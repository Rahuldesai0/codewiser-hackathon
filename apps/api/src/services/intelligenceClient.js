import { config } from "../config.js";
import { createHttpError } from "../utils.js";

async function callIntelligence(path, payload) {
  const response = await fetch(`${config.intelligenceUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw createHttpError(502, `Intelligence service failed: ${message || response.statusText}`);
  }

  return response.json();
}

export function initializeQuiz(payload) {
  return callIntelligence("/quiz/initialize", payload);
}

export function evaluateBatch(payload) {
  return callIntelligence("/quiz/evaluate", payload);
}

