import { config } from "../config.js";
import { pool, query } from "../db.js";
import { mapQuestionRow } from "../utils.js";
import {
  ensureImportTables,
  getImportStatusSummary,
  importQuestionDatasets
} from "./questionImportService.js";
import {
  refineQuestionAssignments,
  getCrawlerProviderStatus,
  harvestRemoteQuestions,
  supportedCrawlerSubjects
} from "./questionCrawlerService.js";

const LOCK_KEY = 483920145;
let schedulerHandle;
let currentlyRunning = false;
let latestProcessRun = null;

async function waitForCrawlerIdle(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;

  while (currentlyRunning && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function ensureCrawlerTables() {
  await query(
    `
      create table if not exists crawler_runs (
        id bigserial primary key,
        reason text not null,
        status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
        subjects jsonb not null default '[]'::jsonb,
        fetched_count integer not null default 0,
        inserted_count integer not null default 0,
        updated_count integer not null default 0,
        warning_count integer not null default 0,
        error_message text,
        started_at timestamptz not null default now(),
        completed_at timestamptz
      )
    `
  );
}

function updateLatestProcessRun(details) {
  latestProcessRun = {
    ...(latestProcessRun || {}),
    ...details
  };
}

async function recordSkippedRun(reason, subjects, message) {
  await query(
    `
      insert into crawler_runs (reason, status, subjects, error_message, completed_at)
      values ($1, 'skipped', $2::jsonb, $3, now())
    `,
    [reason, JSON.stringify(subjects), message]
  );
}

async function shouldSkipForCooldown(reason) {
  if (!["startup", "interval"].includes(reason)) {
    return null;
  }

  const minimumGapMs = Math.max(config.crawlerMinimumGapMs, 0);
  if (!minimumGapMs) {
    return null;
  }

  const recentResult = await query(
    `
      select started_at
      from crawler_runs
      where status in ('running', 'completed')
      order by started_at desc
      limit 1
    `
  );

  if (!recentResult.rowCount) {
    return null;
  }

  const startedAt = new Date(recentResult.rows[0].started_at).getTime();
  const ageMs = Date.now() - startedAt;
  if (ageMs >= minimumGapMs) {
    return null;
  }

  return {
    message: `Skipped ${reason} crawl because the previous run started ${Math.round(ageMs / 1000)} seconds ago.`,
    retryAfterMs: minimumGapMs - ageMs
  };
}

async function loadStoredQuestions(subjects) {
  const result = await query(
    `
      select *
      from questions
      where subject = any($1::text[])
      order by created_at desc, id desc
    `,
    [subjects]
  );

  return result.rows.map(mapQuestionRow);
}

async function upsertQuestions(client, questions) {
  if (!questions.length) {
    return { insertedCount: 0, updatedCount: 0 };
  }

  const existingResult = await client.query(
    "select id from questions where id = any($1::bigint[])",
    [questions.map((question) => question.id)]
  );
  const existingIds = new Set(existingResult.rows.map((row) => Number(row.id)));
  let insertedCount = 0;
  let updatedCount = 0;

  for (const question of questions) {
    const alreadyExists = existingIds.has(question.id);

    await client.query(
      `
        insert into questions (
          id,
          subject,
          topic,
          subtopic,
          type,
          prompt,
          options,
          accepted_answers,
          explanation,
          metadata
        )
        values (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::jsonb,
          $8::jsonb,
          $9,
          $10::jsonb
        )
        on conflict (id)
        do update set
          subject = excluded.subject,
          topic = excluded.topic,
          subtopic = excluded.subtopic,
          type = excluded.type,
          prompt = excluded.prompt,
          options = excluded.options,
          accepted_answers = excluded.accepted_answers,
          explanation = excluded.explanation,
          metadata = excluded.metadata
      `,
      [
        question.id,
        question.subject,
        question.topic,
        question.subtopic,
        question.type,
        question.prompt,
        JSON.stringify(question.options || []),
        JSON.stringify(question.acceptedAnswers || []),
        question.explanation || "",
        JSON.stringify({
          ...(question.metadata || {}),
          harvestedAt: new Date().toISOString()
        })
      ]
    );

    if (alreadyExists) {
      updatedCount += 1;
    } else {
      insertedCount += 1;
    }
  }

  return { insertedCount, updatedCount };
}

function remoteOrImportedQuestions(questions) {
  return questions.filter((question) => {
    const metadata = question.metadata || {};
    return Boolean(metadata.remote || metadata.imported);
  });
}

async function runCrawlerCycle({
  subjects = supportedCrawlerSubjects,
  reason = "scheduled",
  desiredQuestionTarget = config.crawlerHarvestTarget,
  useAdvisoryLock = true
} = {}) {
  await ensureCrawlerTables();
  await ensureImportTables();

  if (currentlyRunning) {
    return { status: "skipped", reason: "Crawler is already running in this process." };
  }

  currentlyRunning = true;
  updateLatestProcessRun({
    status: "running",
    reason,
    subjects,
    desiredQuestionTarget,
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null
  });
  let lockAcquired = false;
  let runId = null;

  try {
    const cooldown = await shouldSkipForCooldown(reason);
    if (cooldown) {
      await recordSkippedRun(reason, subjects, cooldown.message);
      updateLatestProcessRun({
        status: "skipped",
        reason,
        subjects,
        desiredQuestionTarget,
        error: null,
        cooldownUntil: new Date(Date.now() + cooldown.retryAfterMs).toISOString(),
        completedAt: new Date().toISOString(),
        warnings: [cooldown.message]
      });
      return { status: "skipped", reason: cooldown.message };
    }

    if (useAdvisoryLock) {
      const lockResult = await query("select pg_try_advisory_lock($1) as locked", [LOCK_KEY]);
      lockAcquired = Boolean(lockResult.rows[0]?.locked);
      if (!lockAcquired) {
        await recordSkippedRun(reason, subjects, "Another crawler instance currently holds the DB lock.");
        return { status: "skipped", reason: "Another crawler instance currently holds the DB lock." };
      }
    }

    const started = await query(
      `
        insert into crawler_runs (reason, status, subjects)
        values ($1, 'running', $2::jsonb)
        returning id
      `,
      [reason, JSON.stringify(subjects)]
    );
    runId = started.rows[0].id;

    const existingQuestions = await loadStoredQuestions(subjects);
    const reclassifiedStoredQuestions = refineQuestionAssignments(
      remoteOrImportedQuestions(existingQuestions),
      subjects,
      existingQuestions
    );
    const [harvest, imported] = await Promise.all([
      harvestRemoteQuestions({
        subjects,
        questionTarget: desiredQuestionTarget,
        existingQuestions
      }),
      importQuestionDatasets({
        subjects,
        existingQuestions
      })
    ]);

    const combinedQuestions = [...reclassifiedStoredQuestions, ...harvest.questions, ...imported.questions];
    const combinedWarnings = [...harvest.warnings, ...imported.warnings];

    const client = await pool.connect();
    try {
      await client.query("begin");
      const counts = await upsertQuestions(client, combinedQuestions);
      await client.query(
        `
          update crawler_runs
          set
            status = 'completed',
            fetched_count = $2,
            inserted_count = $3,
            updated_count = $4,
            warning_count = $5,
            completed_at = now()
          where id = $1
        `,
        [
          runId,
          combinedQuestions.length,
          counts.insertedCount,
          counts.updatedCount,
          combinedWarnings.length
        ]
      );
      await client.query("commit");

      const result = {
        status: "completed",
        fetchedCount: combinedQuestions.length,
        insertedCount: counts.insertedCount,
        updatedCount: counts.updatedCount,
        importedCount: imported.questions.length,
        remoteFetchedCount: harvest.questions.length,
        warnings: combinedWarnings
      };

      updateLatestProcessRun({
        ...result,
        reason,
        subjects,
        desiredQuestionTarget,
        completedAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (runId != null) {
      await query(
        `
          update crawler_runs
          set
            status = 'failed',
            error_message = $2,
            completed_at = now()
          where id = $1
        `,
        [runId, error.message || "Unknown crawler error."]
      );
    }

    updateLatestProcessRun({
      status: "failed",
      reason,
      subjects,
      desiredQuestionTarget,
      error: error.message || "Unknown crawler error.",
      completedAt: new Date().toISOString()
    });

    return {
      status: "failed",
      error: error.message || "Unknown crawler error."
    };
  } finally {
    if (lockAcquired) {
      await query("select pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    }
    currentlyRunning = false;
  }
}

export async function topUpQuestionBank(subjects, desiredQuestionTarget) {
  if (currentlyRunning) {
    await waitForCrawlerIdle();
  }

  return runCrawlerCycle({
    subjects,
    desiredQuestionTarget,
    reason: "top-up",
    useAdvisoryLock: false
  });
}

export async function runManualCrawler({
  subjects = supportedCrawlerSubjects,
  desiredQuestionTarget = config.crawlerHarvestTarget
} = {}) {
  return runCrawlerCycle({
    subjects,
    desiredQuestionTarget,
    reason: "manual",
    useAdvisoryLock: true
  });
}

export async function getCrawlerStatus() {
  await ensureCrawlerTables();
  await ensureImportTables();

  const [recentRuns, subjectCounts, sourceCounts, totalCounts, importStatus] = await Promise.all([
    query(
      `
        select *
        from crawler_runs
        order by started_at desc
        limit 10
      `
    ),
    query(
      `
        select
          subject,
          count(*) as total_count,
          count(*) filter (
            where coalesce((metadata ->> 'remote')::boolean, false)
          ) as remote_count,
          count(*) filter (
            where coalesce((metadata ->> 'imported')::boolean, false)
          ) as imported_count
        from questions
        group by subject
        order by subject asc
      `
    ),
    query(
      `
        select
          coalesce(nullif(metadata ->> 'sourceName', ''), 'Seed bank') as source_name,
          count(*) as total_count
        from questions
        group by 1
        order by total_count desc, source_name asc
        limit 15
      `
    ),
    query(
      `
        select
          count(*) as total_questions,
          count(*) filter (
            where coalesce((metadata ->> 'remote')::boolean, false)
          ) as remote_questions,
          count(*) filter (
            where coalesce((metadata ->> 'imported')::boolean, false)
          ) as imported_questions
        from questions
      `
    ),
    getImportStatusSummary()
  ]);

  const totals = totalCounts.rows[0] || {};

  return {
    enabled: config.enableQuestionCrawler,
    backgroundEnabled: config.enableBackgroundQuestionCrawler,
    running: currentlyRunning,
    schedulerActive: Boolean(schedulerHandle),
    latestProcessRun,
    providers: getCrawlerProviderStatus(),
    totals: {
      totalQuestions: Number(totals.total_questions || 0),
      remoteQuestions: Number(totals.remote_questions || 0),
      importedQuestions: Number(totals.imported_questions || 0)
    },
    subjects: subjectCounts.rows.map((row) => ({
      subject: row.subject,
      totalCount: Number(row.total_count || 0),
      remoteCount: Number(row.remote_count || 0),
      importedCount: Number(row.imported_count || 0)
    })),
    sources: sourceCounts.rows.map((row) => ({
      sourceName: row.source_name,
      totalCount: Number(row.total_count || 0)
    })),
    recentRuns: recentRuns.rows.map((row) => ({
      id: Number(row.id),
      reason: row.reason,
      status: row.status,
      subjects: row.subjects || [],
      fetchedCount: Number(row.fetched_count || 0),
      insertedCount: Number(row.inserted_count || 0),
      updatedCount: Number(row.updated_count || 0),
      warningCount: Number(row.warning_count || 0),
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at
    })),
    imports: importStatus
  };
}

export function startBackgroundQuestionCrawler() {
  if (!config.enableQuestionCrawler || !config.enableBackgroundQuestionCrawler || schedulerHandle) {
    return;
  }

  const kickoff = async (reason) => {
    const result = await runCrawlerCycle({
      subjects: supportedCrawlerSubjects,
      desiredQuestionTarget: config.crawlerHarvestTarget,
      reason
    });
    if (result.status === "failed") {
      console.error(`Background crawler failed: ${result.error}`);
    }
  };

  setTimeout(() => {
    kickoff("startup").catch((error) => {
      console.error(`Background crawler startup failed: ${error.message}`);
    });

    schedulerHandle = setInterval(() => {
      kickoff("interval").catch((error) => {
        console.error(`Background crawler interval failed: ${error.message}`);
      });
    }, config.crawlerIntervalMs);
  }, Math.max(config.crawlerStartupDelayMs, 0));
}
