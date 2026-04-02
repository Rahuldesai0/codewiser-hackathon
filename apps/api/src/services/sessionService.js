import crypto from "node:crypto";
import { pool, query } from "../db.js";
import { fallbackSubjectCatalog } from "../seedCatalog.js";
import {
  assert,
  mapQuestionRow,
  normalizeQuestion,
  parseJson,
  publicQuestion,
  summarizeSession,
  uniqueStrings
} from "../utils.js";
import { topUpQuestionBank } from "./backgroundCrawlerService.js";
import { evaluateBatch, initializeQuiz } from "./intelligenceClient.js";

let schemaReadyPromise;

function ensureCrawlerSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await query(
        `
          create table if not exists session_question_cache (
            question_id bigint not null,
            session_id uuid not null references quiz_sessions(id) on delete cascade,
            source_name text not null,
            source_url text,
            source_id text not null,
            subject text not null,
            topic text not null,
            subtopic text not null,
            type text not null check (type in ('mcq', 'short_text')),
            prompt text not null,
            options jsonb not null default '[]'::jsonb,
            accepted_answers jsonb not null default '[]'::jsonb,
            explanation text not null default '',
            metadata jsonb not null default '{}'::jsonb,
            fetched_at timestamptz not null default now(),
            unique (session_id, source_name, source_id)
          )
        `
      );

      await query(
        `
          do $$
          begin
            if exists (
              select 1
              from information_schema.table_constraints
              where constraint_name = 'session_question_cache_pkey'
                and table_name = 'session_question_cache'
            ) then
              alter table session_question_cache drop constraint session_question_cache_pkey;
            end if;

            if not exists (
              select 1
              from information_schema.table_constraints
              where constraint_name = 'session_question_cache_session_question_id_key'
                and table_name = 'session_question_cache'
            ) then
              alter table session_question_cache
              add constraint session_question_cache_session_question_id_key unique (session_id, question_id);
            end if;
          end $$;
        `
      );

      await query(
        `
          do $$
          begin
            if exists (
              select 1
              from information_schema.table_constraints
              where constraint_name = 'session_answers_question_id_fkey'
                and table_name = 'session_answers'
            ) then
              alter table session_answers drop constraint session_answers_question_id_fkey;
            end if;
          end $$;
        `
      );
    })();
  }

  return schemaReadyPromise;
}

async function getOrCreateUser(username) {
  const existing = await query("select id from app_users where username = $1", [username]);
  if (existing.rowCount) {
    return existing.rows[0].id;
  }

  const created = await query(
    "insert into app_users (username) values ($1) returning id",
    [username]
  );
  return created.rows[0].id;
}

export async function getSubjectCatalog() {
  try {
    const result = await query(
      `
        select
          subject,
          count(*) as question_count,
          json_agg(distinct subtopic order by subtopic) as subtopics
        from questions
        group by subject
        order by subject
      `
    );

    if (!result.rowCount) {
      return fallbackSubjectCatalog;
    }

    return result.rows.map((row) => ({
      subject: row.subject,
      questionCount: Number(row.question_count),
      subtopics: parseJson(row.subtopics, [])
    }));
  } catch {
    return fallbackSubjectCatalog;
  }
}

async function loadQuestionsBySubjects(subjects) {
  const result = await query(
    `
      select *
      from questions
      where subject = any($1::text[])
      order by subject, topic, subtopic, id
    `,
    [subjects]
  );

  return result.rows.map(mapQuestionRow);
}

async function loadCachedQuestionsForSession(sessionId) {
  await ensureCrawlerSchema();

  const result = await query(
    `
      select
        question_id as id,
        subject,
        topic,
        subtopic,
        type,
        prompt,
        options,
        accepted_answers,
        explanation,
        metadata
      from session_question_cache
      where session_id = $1
      order by fetched_at asc
    `,
    [sessionId]
  );

  return result.rows.map(mapQuestionRow);
}

function mergeQuestionPools(...pools) {
  const seenIds = new Set();
  const seenPrompts = new Set();
  const merged = [];

  for (const pool of pools) {
    for (const question of pool) {
      const promptKey = `${String(question.type || "")}:${String(question.prompt || "").trim().toLowerCase()}`;
      if (seenIds.has(question.id) || seenPrompts.has(promptKey)) {
        continue;
      }

      seenIds.add(question.id);
      seenPrompts.add(promptKey);
      merged.push(question);
    }
  }

  return merged;
}

async function storeCachedQuestions(client, sessionId, questions) {
  for (const question of questions) {
    await client.query(
      `
        insert into session_question_cache (
          question_id,
          session_id,
          source_name,
          source_url,
          source_id,
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
          $7,
          $8,
          $9,
          $10,
          $11::jsonb,
          $12::jsonb,
          $13,
          $14::jsonb
        )
        on conflict (session_id, question_id)
        do update set
          prompt = excluded.prompt,
          options = excluded.options,
          accepted_answers = excluded.accepted_answers,
          explanation = excluded.explanation,
          metadata = excluded.metadata
      `,
      [
        question.id,
        sessionId,
        question.metadata?.sourceName || "Remote source",
        question.metadata?.sourceUrl || null,
        question.metadata?.sourceId || String(question.id),
        question.subject,
        question.topic,
        question.subtopic,
        question.type,
        question.prompt,
        JSON.stringify(question.options || []),
        JSON.stringify(question.acceptedAnswers || []),
        question.explanation || "",
        JSON.stringify(question.metadata || {})
      ]
    );
  }
}

async function deleteCachedQuestions(client, sessionId) {
  await ensureCrawlerSchema();
  await client.query("delete from session_question_cache where session_id = $1", [sessionId]);
}

function normalizeCreationInput(body) {
  const username = String(body.username || "").trim().replace(/\s+/g, " ");
  const subjects = uniqueStrings(body.subjects);
  const questionTarget = Number.parseInt(String(body.questionTarget || 0), 10);
  const batchSize = Number.parseInt(String(body.batchSize || 0), 10);

  assert(username.length >= 2, 400, "Username must be at least 2 characters.");
  assert(username.length <= 40, 400, "Username must be at most 40 characters.");
  assert(subjects.length > 0, 400, "Pick at least one subject before starting.");
  assert([5, 10].includes(batchSize), 400, "Batch size must be either 5 or 10.");
  assert(questionTarget >= batchSize, 400, "Question count must be at least one batch.");
  assert(questionTarget <= 100, 400, "Question count cannot exceed 100.");
  assert(
    questionTarget % 5 === 0,
    400,
    "Question count must be a multiple of 5."
  );

  return {
    username,
    subjects,
    questionTarget,
    batchSize
  };
}

async function insertBatch(client, sessionId, batchIndex, batch) {
  await client.query(
    `
      insert into session_batches (
        id,
        session_id,
        batch_index,
        questions,
        selection_reason,
        status
      )
      values ($1, $2, $3, $4::jsonb, $5::jsonb, 'ready')
      on conflict (session_id, batch_index)
      do update set
        questions = excluded.questions,
        selection_reason = excluded.selection_reason,
        status = 'ready'
    `,
    [
      crypto.randomUUID(),
      sessionId,
      batchIndex,
      JSON.stringify(batch.questions),
      JSON.stringify(batch.selectionReason)
    ]
  );
}

export async function createQuizSession(body) {
  await ensureCrawlerSchema();

  const { username, subjects, questionTarget, batchSize } = normalizeCreationInput(body);
  const userId = await getOrCreateUser(username);
  let questions = await loadQuestionsBySubjects(subjects);

  if (questions.length < questionTarget) {
    await topUpQuestionBank(subjects, Math.max(questionTarget * 4, 120));
    questions = await loadQuestionsBySubjects(subjects);
  }

  assert(questions.length >= batchSize, 400, "Not enough questions are available for those subjects.");

  const supportedQuestionCount = questions.length - (questions.length % 5);
  const adjustedTarget = Math.min(questionTarget, supportedQuestionCount);
  assert(
    adjustedTarget >= batchSize,
    400,
    "The selected subjects do not have enough questions for a valid batch."
  );

  const warnings = [];
  if (adjustedTarget !== questionTarget) {
    warnings.push(
      `Requested ${questionTarget} questions, but only ${adjustedTarget} are currently available for the selected subjects.`
    );
  }

  const intelligence = await initializeQuiz({
    username,
    userId,
    subjects,
    questionTarget: adjustedTarget,
    batchSize,
    questionPool: questions
  });

  const client = await pool.connect();

  try {
    await client.query("begin");

    const created = await client.query(
      `
        insert into quiz_sessions (
          id,
          user_id,
          username_snapshot,
          requested_subjects,
          question_target,
          batch_size,
          status,
          current_batch_index,
          total_correct,
          total_answered,
          analysis_state,
          warnings
        )
        values (
          $1,
          $2,
          $3,
          $4::jsonb,
          $5,
          $6,
          'active',
          0,
          0,
          0,
          $7::jsonb,
          $8::jsonb
        )
        returning *
      `,
      [
        crypto.randomUUID(),
        userId,
        username,
        JSON.stringify(subjects),
        adjustedTarget,
        batchSize,
        JSON.stringify(intelligence.state),
        JSON.stringify(warnings)
      ]
    );

    const session = created.rows[0];
    await insertBatch(client, session.id, 0, intelligence.batch);
    await client.query("commit");

    return {
      session: summarizeSession(session),
      warnings,
      currentBatch: {
        batchIndex: 0,
        selectionReason: intelligence.batch.selectionReason,
        questions: intelligence.batch.questions.map(publicQuestion)
      }
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getQuizSession(sessionId) {
  const sessionResult = await query("select * from quiz_sessions where id = $1", [sessionId]);
  assert(sessionResult.rowCount, 404, "Quiz session not found.");

  const session = sessionResult.rows[0];
  const openBatchResult = await query(
    `
      select *
      from session_batches
      where session_id = $1 and status = 'ready'
      order by batch_index asc
      limit 1
    `,
    [sessionId]
  );

  return {
    session: summarizeSession(session),
    warnings: parseJson(session.warnings, []),
    currentBatch: openBatchResult.rowCount
      ? {
          batchIndex: openBatchResult.rows[0].batch_index,
          selectionReason: parseJson(openBatchResult.rows[0].selection_reason, {}),
          questions: parseJson(openBatchResult.rows[0].questions, [])
            .map(normalizeQuestion)
            .map(publicQuestion)
        }
      : null
  };
}

function validateSubmission(batchQuestions, rawAnswers) {
  const submitted = Array.isArray(rawAnswers) ? rawAnswers : [];
  const byQuestionId = new Map();

  for (const answer of submitted) {
    const questionId = String(answer?.questionId ?? "");
    if (!questionId || byQuestionId.has(questionId)) {
      continue;
    }

    byQuestionId.set(questionId, {
      questionId,
      choiceId: answer.choiceId ? String(answer.choiceId) : null,
      answerText: String(answer.answerText || "").trim()
    });
  }

  return batchQuestions.map((question) => {
    const current = byQuestionId.get(String(question.id));
    return {
      questionId: question.id,
      choiceId: current?.choiceId || null,
      answerText: current?.answerText || ""
    };
  });
}

export async function submitBatch(sessionId, batchIndex, rawAnswers) {
  await ensureCrawlerSchema();

  const sessionResult = await query("select * from quiz_sessions where id = $1", [sessionId]);
  assert(sessionResult.rowCount, 404, "Quiz session not found.");

  const session = sessionResult.rows[0];
  assert(session.status === "active", 409, "This quiz is already finished.");

  const batchResult = await query(
    `
      select *
      from session_batches
      where session_id = $1 and batch_index = $2
      limit 1
    `,
    [sessionId, batchIndex]
  );

  assert(batchResult.rowCount, 404, "Batch not found.");
  assert(batchResult.rows[0].status === "ready", 409, "This batch was already submitted.");

  const batchQuestions = parseJson(batchResult.rows[0].questions, []).map(normalizeQuestion);
  const answers = validateSubmission(batchQuestions, rawAnswers);
  const localQuestions = await loadQuestionsBySubjects(parseJson(session.requested_subjects, []));
  const cachedQuestions = await loadCachedQuestionsForSession(sessionId);
  const questionPool = mergeQuestionPools(localQuestions, cachedQuestions);

  const intelligence = await evaluateBatch({
    state: parseJson(session.analysis_state, {}),
    batchQuestions,
    answers,
    questionPool,
    questionTarget: session.question_target,
    batchSize: session.batch_size
  });

  const client = await pool.connect();

  try {
    await client.query("begin");

    await client.query(
      `
        update session_batches
        set status = 'completed', completed_at = now()
        where session_id = $1 and batch_index = $2
      `,
      [sessionId, batchIndex]
    );

    for (const review of intelligence.review) {
      await client.query(
        `
          insert into session_answers (
            id,
            session_id,
            batch_index,
            question_id,
            subject,
            topic,
            subtopic,
            difficulty_label,
            question_type,
            prompt_snapshot,
            submitted_answer,
            submitted_option_id,
            is_correct,
            correct_answer_snapshot,
            explanation_snapshot
          )
          values (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15
          )
        `,
        [
          crypto.randomUUID(),
          sessionId,
          batchIndex,
          review.questionId,
          review.subject,
          review.topic,
          review.subtopic,
          review.difficultyLabel,
          review.type,
          review.prompt,
          review.submittedAnswer,
          review.submittedOptionId,
          review.correct,
          review.correctAnswer,
          review.explanation
        ]
      );
    }

    await client.query(
      `
        update quiz_sessions
        set
          analysis_state = $2::jsonb,
          total_correct = $3,
          total_answered = $4,
          current_batch_index = $5,
          status = $6,
          completed_at = case when $6 = 'completed' then now() else completed_at end
        where id = $1
      `,
      [
        sessionId,
        JSON.stringify(intelligence.state),
        intelligence.summary.totalCorrect,
        intelligence.summary.totalAnswered,
        intelligence.summary.currentBatchIndex,
        intelligence.summary.finished ? "completed" : "active"
      ]
    );

    if (!intelligence.summary.finished && intelligence.nextBatch) {
      await insertBatch(client, sessionId, intelligence.nextBatch.batchIndex, intelligence.nextBatch);
    }

    if (intelligence.summary.finished) {
      await deleteCachedQuestions(client, sessionId);
    }

    await client.query("commit");

    return {
      batchResult: intelligence.batchAnalysis,
      session: {
        ...summarizeSession({
          ...session,
          total_correct: intelligence.summary.totalCorrect,
          total_answered: intelligence.summary.totalAnswered,
          current_batch_index: intelligence.summary.currentBatchIndex,
          status: intelligence.summary.finished ? "completed" : "active"
        }),
        currentBatchIndex: intelligence.summary.currentBatchIndex
      },
      currentBatch: intelligence.summary.finished || !intelligence.nextBatch
        ? null
        : {
            batchIndex: intelligence.nextBatch.batchIndex,
            selectionReason: intelligence.nextBatch.selectionReason,
            questions: intelligence.nextBatch.questions.map(publicQuestion)
          },
      finished: intelligence.summary.finished
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getQuizAnalysis(sessionId) {
  const sessionResult = await query("select * from quiz_sessions where id = $1", [sessionId]);
  assert(sessionResult.rowCount, 404, "Quiz session not found.");
  const session = sessionResult.rows[0];

  const answersResult = await query(
    `
      select *
      from session_answers
      where session_id = $1
      order by batch_index asc, created_at asc
    `,
    [sessionId]
  );

  const state = parseJson(session.analysis_state, {});
  const answers = answersResult.rows.map((row) => ({
    questionId: row.question_id,
    subject: row.subject,
    topic: row.topic,
    subtopic: row.subtopic,
    difficultyLabel: row.difficulty_label,
    type: row.question_type,
    prompt: row.prompt_snapshot,
    submittedAnswer: row.submitted_answer,
    submittedOptionId: row.submitted_option_id,
    correct: row.is_correct,
    correctAnswer: row.correct_answer_snapshot,
    explanation: row.explanation_snapshot,
    batchIndex: row.batch_index
  }));

  return {
    session: summarizeSession(session),
    warnings: parseJson(session.warnings, []),
    score: {
      correct: session.total_correct,
      answered: session.total_answered,
      percentage: session.total_answered
        ? Math.round((session.total_correct / session.total_answered) * 100)
        : 0
    },
    difficultyPerformance: state.difficultyPerformance || {},
    subjectBreakdown: state.subjectBreakdown || {},
    subtopicBreakdown: state.subtopicBreakdown || {},
    batchHistory: state.batchHistory || [],
    review: answers
  };
}

export async function getHistory(username = "") {
  const cleanUsername = String(username || "").trim();
  const params = [];
  let whereClause = "";

  if (cleanUsername) {
    params.push(cleanUsername);
    whereClause = "where username_snapshot = $1";
  }

  const sessionsResult = await query(
    `
      select *
      from quiz_sessions
      ${whereClause}
      order by started_at desc
      limit 50
    `,
    params
  );

  const sessions = sessionsResult.rows.map((row) => {
    const percentage = row.total_answered
      ? Math.round((row.total_correct / row.total_answered) * 100)
      : 0;

    return {
      ...summarizeSession(row),
      percentage
    };
  });

  const trend = [...sessions]
    .reverse()
    .map((session) => ({
      label: new Date(session.startedAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric"
      }),
      score: session.percentage
    }));

  const subjectAccumulator = new Map();

  for (const row of sessionsResult.rows) {
    const state = parseJson(row.analysis_state, {});
    for (const [subject, breakdown] of Object.entries(state.subjectBreakdown || {})) {
      const current = subjectAccumulator.get(subject) || { correct: 0, total: 0 };
      current.correct += breakdown.correct || 0;
      current.total += breakdown.total || 0;
      subjectAccumulator.set(subject, current);
    }
  }

  const subjectPerformance = [...subjectAccumulator.entries()].map(([subject, stats]) => ({
    subject,
    percentage: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  }));

  return {
    sessions,
    trend,
    subjectPerformance
  };
}
