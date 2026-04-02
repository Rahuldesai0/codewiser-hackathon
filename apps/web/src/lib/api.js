const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
  } catch {
    throw new Error("Could not reach the app server. Make sure the API is running on port 4000.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong.");
  }

  return payload;
}

export const api = {
  getSubjects() {
    return request("/subjects");
  },
  createQuiz(data) {
    return request("/quizzes", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getQuiz(sessionId) {
    return request(`/quizzes/${sessionId}`);
  },
  submitBatch(sessionId, batchIndex, answers) {
    return request(`/quizzes/${sessionId}/batches/${batchIndex}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers })
    });
  },
  getAnalysis(sessionId) {
    return request(`/quizzes/${sessionId}/analysis`);
  },
  getHistory(username = "") {
    const query = username ? `?username=${encodeURIComponent(username)}` : "";
    return request(`/history${query}`);
  }
};

export function activeSessionStorageKey() {
  return "adaptive-quiz-active-session";
}

export function draftStorageKey(sessionId, batchIndex) {
  return `adaptive-quiz-draft:${sessionId}:${batchIndex}`;
}
