export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeUsername(input) {
  return String(input || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

export function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];
}

export function parseJson(value, fallback) {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createHttpError(status, message, details = undefined) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

export function assert(condition, status, message, details = undefined) {
  if (!condition) {
    throw createHttpError(status, message, details);
  }
}

export function sanitizeInteger(input, fallback, min, max) {
  const parsed = Number.parseInt(String(input ?? fallback), 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return clamp(parsed, min, max);
}

export function answerSummary(question) {
  if (question.type === "mcq") {
    const option = ensureArray(question.options).find((entry) => entry.isCorrect);
    return option?.text || "Correct option";
  }

  return ensureArray(question.acceptedAnswers)[0] || "";
}

export function mapQuestionRow(row) {
  return {
    id: Number(row.id),
    subject: row.subject,
    topic: row.topic,
    subtopic: row.subtopic,
    type: row.type,
    prompt: row.prompt,
    options: parseJson(row.options, []),
    acceptedAnswers: parseJson(row.accepted_answers, []),
    explanation: row.explanation,
    metadata: parseJson(row.metadata, {})
  };
}

export function normalizeQuestion(question) {
  return {
    id: Number(question.id),
    subject: question.subject,
    topic: question.topic,
    subtopic: question.subtopic,
    type: question.type,
    prompt: question.prompt,
    options: ensureArray(question.options).map((option) => ({
      ...option,
      id: String(option.id)
    })),
    acceptedAnswers: ensureArray(question.acceptedAnswers ?? question.accepted_answers),
    explanation: question.explanation || "",
    metadata: question.metadata || {}
  };
}

export function publicQuestion(question) {
  const normalized = normalizeQuestion(question);

  return {
    id: normalized.id,
    subject: normalized.subject,
    topic: normalized.topic,
    subtopic: normalized.subtopic,
    type: normalized.type,
    prompt: normalized.prompt,
    options: ensureArray(normalized.options).map(({ id, text }) => ({ id, text })),
    metadata: normalized.metadata || {}
  };
}

export function summarizeSession(session) {
  return {
    id: session.id,
    username: session.username_snapshot,
    subjects: parseJson(session.requested_subjects, []),
    questionTarget: session.question_target,
    batchSize: session.batch_size,
    status: session.status,
    totalCorrect: session.total_correct,
    totalAnswered: session.total_answered,
    startedAt: session.started_at,
    completedAt: session.completed_at
  };
}
