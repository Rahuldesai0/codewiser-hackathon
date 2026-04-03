import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QuestionCard } from "../components/QuestionCard";
import { api, activeSessionStorageKey, draftStorageKey } from "../lib/api";

function emptyAnswer(answer) {
  return !answer || (!answer.choiceId && !String(answer.answerText || "").trim());
}

function formatRemainingTime(totalSeconds) {
  const clamped = Math.max(0, Number(totalSeconds || 0));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QuizPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmBlankSubmit, setConfirmBlankSubmit] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const timeoutSubmitRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      try {
        setLoading(true);
        const result = await api.getQuiz(sessionId);
        if (cancelled) {
          return;
        }
        if (result.session.status === "completed") {
          localStorage.removeItem(activeSessionStorageKey());
          navigate(`/history/${sessionId}`, { replace: true });
          return;
        }
        setPayload(result);
        setRemainingSeconds(result.session.timerRemainingSeconds);
        timeoutSubmitRef.current = false;
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [navigate, sessionId]);

  useEffect(() => {
    if (!payload?.currentBatch) {
      return;
    }
    const saved = localStorage.getItem(draftStorageKey(sessionId, payload.currentBatch.batchIndex));
    setAnswers(saved ? JSON.parse(saved) : {});
    setConfirmBlankSubmit(false);
  }, [payload?.currentBatch?.batchIndex, sessionId]);

  useEffect(() => {
    if (!payload?.currentBatch) {
      return;
    }
    localStorage.setItem(
      draftStorageKey(sessionId, payload.currentBatch.batchIndex),
      JSON.stringify(answers)
    );
  }, [answers, payload?.currentBatch, sessionId]);

  useEffect(() => {
    if (!payload?.session?.timerEnabled) {
      setRemainingSeconds(null);
      timeoutSubmitRef.current = false;
      return;
    }

    setRemainingSeconds(payload.session.timerRemainingSeconds ?? 0);
    timeoutSubmitRef.current = false;
  }, [payload?.session?.timerEnabled, payload?.session?.timerRemainingSeconds, payload?.currentBatch?.batchIndex]);

  useEffect(() => {
    if (!payload?.session?.timerEnabled || remainingSeconds == null || remainingSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current == null) {
          return current;
        }
        return current > 0 ? current - 1 : 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [payload?.session?.timerEnabled, remainingSeconds]);

  const unansweredCount = useMemo(() => {
    const questions = payload?.currentBatch?.questions || [];
    return questions.filter((question) => emptyAnswer(answers[question.id])).length;
  }, [answers, payload?.currentBatch?.questions]);

  useEffect(() => {
    if (!payload?.session?.timerEnabled || !payload?.currentBatch) {
      return;
    }
    if (remainingSeconds == null || remainingSeconds > 0 || submitting || timeoutSubmitRef.current) {
      return;
    }

    timeoutSubmitRef.current = true;
    setConfirmBlankSubmit(false);
    handleSubmit({ forceBlankSubmit: true });
  }, [payload?.session?.timerEnabled, payload?.currentBatch, remainingSeconds, submitting]);

  function handleAnswerChange(questionId, nextAnswer) {
    setAnswers((current) => ({
      ...current,
      [questionId]: nextAnswer
    }));
    setConfirmBlankSubmit(false);
  }

  async function handleSubmit({ forceBlankSubmit = false } = {}) {
    if (!payload?.currentBatch) {
      return;
    }

    if (unansweredCount > 0 && !confirmBlankSubmit && !forceBlankSubmit) {
      setConfirmBlankSubmit(true);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const result = await api.submitBatch(
        sessionId,
        payload.currentBatch.batchIndex,
        payload.currentBatch.questions.map((question) => ({
          questionId: question.id,
          choiceId: answers[question.id]?.choiceId || null,
          answerText: answers[question.id]?.answerText || ""
        }))
      );

      localStorage.removeItem(draftStorageKey(sessionId, payload.currentBatch.batchIndex));

      if (result.finished) {
        localStorage.removeItem(activeSessionStorageKey());
        navigate(`/history/${sessionId}`);
        return;
      }

      setPayload((current) => ({
        ...current,
        session: result.session,
        warnings: result.warnings || current?.warnings || [],
        currentBatch: result.currentBatch
      }));
      setRemainingSeconds(result.session.timerRemainingSeconds ?? null);
      setAnswers({});
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <p className="muted">Loading quiz session...</p>
      </section>
    );
  }

  if (error && !payload) {
    return (
      <section className="panel">
        <p className="error-text">{error}</p>
      </section>
    );
  }

  if (!payload?.currentBatch) {
    return (
      <section className="panel">
        <p className="muted">No open batch was found for this session.</p>
      </section>
    );
  }

  const progress = payload.session.totalAnswered
    ? Math.round((payload.session.totalAnswered / payload.session.questionTarget) * 100)
    : 0;

  return (
    <div className="page-stack">
      <section className="panel summary-strip">
        <div>
          <p className="eyebrow">Current session</p>
          <h1>{payload.session.username}</h1>
          <p className="muted">
            Batch {payload.currentBatch.batchIndex + 1} of{" "}
            {Math.ceil(payload.session.questionTarget / payload.session.batchSize)}
          </p>
          <div className="tag-row">
            <span className="question-chip secondary">{payload.session.presetKey || "custom"}</span>
            <span className={`question-chip ${payload.session.timerEnabled ? "" : "secondary"}`}>
              {payload.session.timerEnabled
                ? `Time left ${formatRemainingTime(remainingSeconds ?? payload.session.timerRemainingSeconds)}`
                : "Untimed"}
            </span>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-meta">
            <span>{payload.session.totalAnswered} answered</span>
            <span>{payload.session.questionTarget} total</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Why this batch?</h2>
        </div>
        <p className="muted">{payload.currentBatch.selectionReason.strategy}</p>
        <div className="tag-row">
          <span className="question-chip">Weak {payload.currentBatch.selectionReason.distribution.weak}</span>
          <span className="question-chip">Strong {payload.currentBatch.selectionReason.distribution.strong}</span>
          <span className="question-chip">Explore {payload.currentBatch.selectionReason.distribution.explore}</span>
        </div>
        <div className="notes-list">
          {payload.currentBatch.selectionReason.notes.map((note) => (
            <p className="muted" key={note}>{note}</p>
          ))}
        </div>
      </section>

      {payload.warnings?.length ? (
        <section className="panel">
          {payload.warnings.map((warning) => (
            <p key={warning} className="warning-text">{warning}</p>
          ))}
        </section>
      ) : null}

      <div className="question-stack">
        {payload.currentBatch.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            answer={answers[question.id]}
            onChange={handleAnswerChange}
            index={index}
          />
        ))}
      </div>

      {confirmBlankSubmit ? (
        <section className="panel">
          <p className="warning-text">
            {unansweredCount} question{unansweredCount === 1 ? "" : "s"} will be submitted blank.
            Press the button again if that is intentional.
          </p>
        </section>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <div className="action-row">
        <button className="ghost-button" type="button" onClick={() => navigate("/history")}>
          View history
        </button>
        <button className="primary-button" type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting batch..." : "Submit batch"}
        </button>
      </div>
    </div>
  );
}
