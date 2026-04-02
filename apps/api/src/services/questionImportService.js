import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { config } from "../config.js";
import { query } from "../db.js";
import { normalizeQuestion, uniqueStrings } from "../utils.js";
import {
  classifyQuestionToProfile,
  refineQuestionAssignments,
  supportedCrawlerSubjects
} from "./questionCrawlerService.js";

const SUPPORTED_IMPORT_EXTENSIONS = new Set([".json", ".jsonl", ".ndjson", ".csv"]);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDirectory, "../../../../");

function compactText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, "");
}

function importQuestionId(seed) {
  const digest = crypto.createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return -Number.parseInt(digest, 16);
}

function importDirectoryPath() {
  return path.resolve(workspaceRoot, config.questionImportDirectory);
}

function parseArrayCandidate(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return [];
  }

  return [value];
}

function normalizeTextList(...values) {
  return uniqueStrings(
    values.flatMap((value) => parseArrayCandidate(value)).map((entry) => String(entry || "").trim())
  );
}

function normalizeOptionEntry(entry, index) {
  if (entry == null) {
    return null;
  }

  if (typeof entry === "string") {
    return {
      id: String.fromCharCode(97 + index),
      text: entry.trim(),
      isCorrect: false
    };
  }

  const text = String(
    entry.text ?? entry.label ?? entry.value ?? entry.option ?? entry.answer ?? ""
  ).trim();
  if (!text) {
    return null;
  }

  return {
    id: String(entry.id ?? String.fromCharCode(97 + index)),
    text,
    isCorrect: Boolean(entry.isCorrect ?? entry.correct ?? entry.is_answer ?? false)
  };
}

function normalizeOptions(record, acceptedAnswers) {
  const acceptedSet = new Set(acceptedAnswers.map(compactText));
  const normalized = parseArrayCandidate(record.options)
    .map((entry, index) => normalizeOptionEntry(entry, index))
    .filter(Boolean)
    .map((option) => ({
      ...option,
      isCorrect: option.isCorrect || acceptedSet.has(compactText(option.text))
    }));

  return normalized.filter((option, index, array) => {
    const compact = compactText(option.text);
    return compact && array.findIndex((candidate) => compactText(candidate.text) === compact) === index;
  });
}

function normalizeImportType(record, acceptedAnswers, options) {
  const correctOptions = options.filter((option) => option.isCorrect);
  if (options.length >= 2 && correctOptions.length === 1) {
    return "mcq";
  }

  if (acceptedAnswers.length) {
    return "short_text";
  }

  return null;
}

function initialAssignment(record, prompt, explanation, acceptedAnswers, options, subjects) {
  const rawSubject = String(record.subject || "").trim().toUpperCase();
  const allowedSubjects = subjects.length ? subjects : supportedCrawlerSubjects;
  const classification = classifyQuestionToProfile(
    [
      prompt,
      explanation,
      ...acceptedAnswers,
      ...options.map((option) => option.text),
      String(record.topic || ""),
      String(record.subtopic || "")
    ],
    rawSubject && allowedSubjects.includes(rawSubject) ? [rawSubject] : allowedSubjects
  );

  const subject = rawSubject && allowedSubjects.includes(rawSubject)
    ? rawSubject
    : classification?.subject;

  return {
    subject,
    topic: String(record.topic || "").trim() || classification?.profile.topic || "Imported",
    subtopic: String(record.subtopic || "").trim() || classification?.profile.subtopic || "Imported"
  };
}

function normalizeImportedRecord(record, fileName, index, subjects) {
  const prompt = String(
    record.prompt ?? record.question ?? record.text ?? record.title ?? ""
  ).trim();
  if (!prompt) {
    return null;
  }

  const explanation = String(record.explanation ?? record.solution ?? record.description ?? "").trim();
  const acceptedAnswers = normalizeTextList(
    record.acceptedAnswers,
    record.accepted_answers,
    record.answers,
    record.correctAnswers,
    record.correct_answers,
    record.answer,
    record.correctAnswer,
    record.correct_answer
  );
  const options = normalizeOptions(record, acceptedAnswers);
  const type = normalizeImportType(record, acceptedAnswers, options);
  if (!type) {
    return null;
  }

  const assignment = initialAssignment(record, prompt, explanation, acceptedAnswers, options, subjects);
  if (!assignment.subject) {
    return null;
  }

  const normalizedOptions = type === "mcq"
    ? options.map((option, optionIndex) => ({
        id: String.fromCharCode(97 + optionIndex),
        text: option.text,
        isCorrect: option.isCorrect
      }))
    : [];

  const normalizedAnswers = type === "short_text"
    ? acceptedAnswers
    : [];

  return normalizeQuestion({
    id: importQuestionId(`${fileName}:${index}:${prompt}:${type}`),
    subject: assignment.subject,
    topic: assignment.topic,
    subtopic: assignment.subtopic,
    type,
    prompt,
    options: normalizedOptions,
    acceptedAnswers: normalizedAnswers,
    explanation,
    metadata: {
      remote: false,
      imported: true,
      sourceName: `Imported dataset (${fileName})`,
      sourceFile: fileName,
      sourceId: String(record.id ?? `${fileName}:${index}`),
      rawTopic: String(record.topic || "").trim(),
      rawSubtopic: String(record.subtopic || "").trim()
    }
  });
}

async function ensureImportDirectory() {
  const directory = importDirectoryPath();
  await mkdir(directory, { recursive: true });
  return directory;
}

function normalizeImportPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.questions)) {
    return payload.questions;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === "\"") {
      if (insideQuotes && nextCharacter === "\"") {
        value += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value.trim());
      value = "";

      if (row.some((entry) => entry !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += character;
  }

  if (value !== "" || row.length) {
    row.push(value.trim());
  }

  if (row.some((entry) => entry !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((values) =>
    headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {})
  );
}

async function readImportRecords(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const content = await readFile(filePath, "utf-8");

  if (extension === ".json") {
    return normalizeImportPayload(JSON.parse(content));
  }

  if (extension === ".csv") {
    return parseCsv(content);
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function recordImportRunStart(fileName, subjects) {
  const result = await query(
    `
      insert into question_import_runs (file_name, status, subjects)
      values ($1, 'running', $2::jsonb)
      returning id
    `,
    [fileName, JSON.stringify(subjects)]
  );

  return result.rows[0].id;
}

async function recordImportRunCompletion(runId, details) {
  await query(
    `
      update question_import_runs
      set
        status = $2,
        total_records = $3,
        prepared_count = $4,
        skipped_count = $5,
        error_message = $6,
        completed_at = now()
      where id = $1
    `,
    [
      runId,
      details.status,
      details.totalRecords,
      details.preparedCount,
      details.skippedCount,
      details.errorMessage || null
    ]
  );
}

function dedupeImportedQuestions(questions, existingQuestions) {
  const seenIds = new Set(existingQuestions.map((question) => Number(question.id)));
  const seenPrompts = new Set(
    existingQuestions.map((question) => `${question.type}:${compactText(question.prompt)}`)
  );
  const unique = [];

  for (const question of questions) {
    const promptKey = `${question.type}:${compactText(question.prompt)}`;
    if (!promptKey || seenIds.has(question.id) || seenPrompts.has(promptKey)) {
      continue;
    }

    seenIds.add(question.id);
    seenPrompts.add(promptKey);
    unique.push(question);
  }

  return unique;
}

export async function ensureImportTables() {
  await query(
    `
      create table if not exists question_import_runs (
        id bigserial primary key,
        file_name text not null,
        status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
        subjects jsonb not null default '[]'::jsonb,
        total_records integer not null default 0,
        prepared_count integer not null default 0,
        skipped_count integer not null default 0,
        error_message text,
        started_at timestamptz not null default now(),
        completed_at timestamptz
      )
    `
  );

  await query(
    `
      create index if not exists idx_question_import_runs_started
      on question_import_runs(started_at desc)
    `
  );
}

export async function importQuestionDatasets({ subjects, existingQuestions = [] }) {
  if (!config.enableQuestionImports) {
    return { questions: [], warnings: [], files: [] };
  }

  await ensureImportTables();
  const directory = await ensureImportDirectory();
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && SUPPORTED_IMPORT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (!files.length) {
    return { questions: [], warnings: [], files: [] };
  }

  const warnings = [];
  const preparedQuestions = [];

  for (const fileName of files) {
    const runId = await recordImportRunStart(fileName, subjects);
    try {
      const records = await readImportRecords(path.join(directory, fileName));
      const normalized = records
        .map((record, index) => normalizeImportedRecord(record, fileName, index, subjects))
        .filter(Boolean);
      const refined = refineQuestionAssignments(normalized, subjects);
      const deduped = dedupeImportedQuestions(
        refined,
        [...existingQuestions, ...preparedQuestions]
      );
      const skippedCount = Math.max(records.length - deduped.length, 0);

      if (!deduped.length && records.length) {
        warnings.push(
          `Import skipped ${fileName}: records were present, but none were quiz-ready. Each record needs either one correct MCQ option or at least one accepted answer.`
        );
      }

      await recordImportRunCompletion(runId, {
        status: "completed",
        totalRecords: records.length,
        preparedCount: deduped.length,
        skippedCount
      });

      preparedQuestions.push(...deduped);
    } catch (error) {
      warnings.push(`Import failed for ${fileName}: ${error.message || "Unknown error"}`);
      await recordImportRunCompletion(runId, {
        status: "failed",
        totalRecords: 0,
        preparedCount: 0,
        skippedCount: 0,
        errorMessage: error.message || "Unknown error"
      });
    }
  }

  return {
    questions: preparedQuestions,
    warnings,
    files
  };
}

export async function getImportStatusSummary() {
  await ensureImportTables();
  const directory = await ensureImportDirectory();
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && SUPPORTED_IMPORT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const recentRuns = await query(
    `
      select *
      from question_import_runs
      order by started_at desc
      limit 10
    `
  );

  return {
    enabled: config.enableQuestionImports,
    directory,
    files,
    recentRuns: recentRuns.rows.map((row) => ({
      id: Number(row.id),
      fileName: row.file_name,
      status: row.status,
      subjects: row.subjects || [],
      totalRecords: Number(row.total_records || 0),
      preparedCount: Number(row.prepared_count || 0),
      skippedCount: Number(row.skipped_count || 0),
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at
    }))
  };
}
