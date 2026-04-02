import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, activeSessionStorageKey } from "../lib/api";

const QUESTION_OPTIONS = Array.from({ length: 20 }, (_value, index) => (index + 1) * 5);
const BATCH_OPTIONS = [5, 10];

export function SetupPage({ subjects, loading, error }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questionTarget, setQuestionTarget] = useState(10);
  const [batchSize, setBatchSize] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const allowedQuestionOptions = useMemo(
    () => QUESTION_OPTIONS.filter((value) => value >= batchSize && value % 5 === 0),
    [batchSize]
  );

  useEffect(() => {
    if (!allowedQuestionOptions.includes(questionTarget)) {
      setQuestionTarget(allowedQuestionOptions[0] || 5);
    }
  }, [allowedQuestionOptions, questionTarget]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (selectedSubjects.length === 0) {
      setFormError("Choose at least one subject so the quiz has somewhere to pull questions from.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await api.createQuiz({
        username,
        subjects: selectedSubjects,
        questionTarget,
        batchSize
      });
      localStorage.setItem(activeSessionStorageKey(), result.session.id);
      navigate(`/quiz/${result.session.id}`);
    } catch (caughtError) {
      setFormError(caughtError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSubject(subject) {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((value) => value !== subject)
        : [...current, subject]
    );
  }

  return (
    <div className="page-grid">
      <section className="hero-card panel">
        <p className="eyebrow">Adaptive Quiz Lab</p>
        <h1>Build confidence and expose blind spots batch by batch.</h1>
        <p className="muted">
          The engine tracks subtopic skill, mixes weak and strong areas, and gives a full post-test
          analysis without leaking answers mid-quiz.
        </p>
      </section>

      <form className="panel setup-form" onSubmit={handleSubmit}>
        <div className="panel-header">
          <h2>Start a quiz</h2>
          <p className="muted">Safe defaults, guardrails, and no weird empty-state surprises.</p>
        </div>

        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            minLength={2}
            maxLength={40}
            placeholder="Rahul Sharma"
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

        <div className="field">
          <span>Subjects</span>
          {loading ? <p className="muted">Loading subjects...</p> : null}
          {error ? <p className="muted">{error}</p> : null}
          <div className="subject-grid">
            {subjects.map((entry) => {
              const checked = selectedSubjects.includes(entry.subject);
              return (
                <label key={entry.subject} className={`subject-card ${checked ? "selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={loading}
                    onChange={() => toggleSubject(entry.subject)}
                  />
                  <strong>{entry.subject}</strong>
                </label>
              );
            })}
          </div>
        </div>

        <div className="split">
          <label className="field">
            <span>Total questions</span>
            <select
              value={questionTarget}
              onChange={(event) => setQuestionTarget(Number(event.target.value))}
            >
              {(allowedQuestionOptions.length ? allowedQuestionOptions : [10]).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Batch size</span>
            <select
              value={batchSize}
              onChange={(event) => {
                const nextBatch = Number(event.target.value);
                setBatchSize(nextBatch);
              }}
            >
              {BATCH_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        {formError ? <p className="error-text">{formError}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting || loading}>
          {submitting ? "Starting quiz..." : "Launch adaptive quiz"}
        </button>
      </form>
    </div>
  );
}
