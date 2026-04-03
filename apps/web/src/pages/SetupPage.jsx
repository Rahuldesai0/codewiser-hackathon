import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, activeSessionStorageKey } from "../lib/api";
import { getPreset, testPresets, timerMinuteOptions } from "../lib/testPresets";

const BATCH_OPTIONS = [5, 10];

function normalizeQuestionTarget(value, batchSize, fallback = 10) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  const clamped = Math.max(batchSize, Math.min(100, parsed));
  const normalized = Math.max(batchSize, Math.round(clamped / 5) * 5);
  return Math.min(100, normalized);
}

export function SetupPage({ subjects, loading, error }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [presetKey, setPresetKey] = useState("custom");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectToAdd, setSubjectToAdd] = useState("");
  const [questionTarget, setQuestionTarget] = useState(10);
  const [batchSize, setBatchSize] = useState(5);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const selectedPreset = useMemo(() => getPreset(presetKey), [presetKey]);
  const availableSubjectOptions = useMemo(
    () => subjects.filter((entry) => !selectedSubjects.includes(entry.subject)),
    [selectedSubjects, subjects]
  );

  useEffect(() => {
    const normalized = normalizeQuestionTarget(questionTarget, batchSize, batchSize);
    if (normalized !== questionTarget) {
      setQuestionTarget(normalized);
    }
  }, [batchSize, questionTarget]);

  useEffect(() => {
    if (subjectToAdd && !availableSubjectOptions.some((entry) => entry.subject === subjectToAdd)) {
      setSubjectToAdd("");
    }
  }, [availableSubjectOptions, subjectToAdd]);

  useEffect(() => {
    const preset = getPreset(presetKey);
    if (!preset) {
      return;
    }

    setQuestionTarget(preset.questionTarget);
    setBatchSize(preset.batchSize);
    setTimerEnabled(preset.timerEnabled);
    setTimerDurationMinutes(preset.timerDurationMinutes || 60);

    if (preset.subjects.length) {
      const availableSubjects = new Set(subjects.map((entry) => entry.subject));
      setSelectedSubjects(preset.subjects.filter((subject) => availableSubjects.has(subject)));
    }
  }, [presetKey, subjects]);

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
        presetKey,
        subjects: selectedSubjects,
        questionTarget,
        batchSize,
        timerEnabled,
        timerDurationMinutes: timerEnabled ? timerDurationMinutes : 0
      });
      localStorage.setItem(activeSessionStorageKey(), result.session.id);
      navigate(`/quiz/${result.session.id}`);
    } catch (caughtError) {
      setFormError(caughtError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function addSubject(subject) {
    if (!subject) {
      return;
    }
    setSelectedSubjects((current) => (current.includes(subject) ? current : [...current, subject]));
    setSubjectToAdd("");
  }

  function removeSubject(subject) {
    setSelectedSubjects((current) => current.filter((value) => value !== subject));
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
          <h2>Start A Test</h2>
        </div>

        <label className="field">
          <span>Test preset</span>
          <select value={presetKey} onChange={(event) => setPresetKey(event.target.value)}>
            {testPresets.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
          <p className="muted">{selectedPreset.description}</p>
        </label>

        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            minLength={2}
            maxLength={40}
            placeholder="Username"
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

        <div className="field">
          <span>Subjects</span>
          {loading ? <p className="muted">Loading subjects...</p> : null}
          {error ? <p className="muted">{error}</p> : null}
          <div className="subject-picker-row">
            <select
              value={subjectToAdd}
              onChange={(event) => {
                const nextSubject = event.target.value;
                setSubjectToAdd(nextSubject);
                if (nextSubject) {
                  addSubject(nextSubject);
                }
              }}
              disabled={loading || !availableSubjectOptions.length}
            >
              {availableSubjectOptions.length ? (
                <>
                  <option value="">Select subjects</option>
                  {availableSubjectOptions.map((entry) => (
                    <option key={entry.subject} value={entry.subject}>
                      {entry.subject}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">All available subjects are already selected</option>
              )}
            </select>
          </div>
          <div className="selected-subject-list">
            {selectedSubjects.length ? (
              selectedSubjects.map((subject) => (
                <div key={subject} className="selected-subject-chip">
                  <span>{subject}</span>
                  <button type="button" onClick={() => removeSubject(subject)} aria-label={`Remove ${subject}`}>
                    x
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">No subjects selected yet.</p>
            )}
          </div>
        </div>

        <div className="split">
          <label className="field">
            <span>Total questions</span>
            <input
              type="number"
              min={batchSize}
              max={100}
              step={5}
              value={questionTarget}
              onChange={(event) => setQuestionTarget(normalizeQuestionTarget(event.target.value, batchSize, questionTarget))}
            />
            <p className="muted">Use multiples of 5, up to 100.</p>
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

        <section className="panel inset-panel">
          <div className="panel-header">
            <h3>Timer</h3>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(event) => setTimerEnabled(event.target.checked)}
              />
              <span>{timerEnabled ? "Timed test" : "Practice mode"}</span>
            </label>
          </div>
          {timerEnabled ? (
            <label className="field">
              <span>Duration</span>
              <select
                value={timerDurationMinutes}
                onChange={(event) => setTimerDurationMinutes(Number(event.target.value))}
              >
                {timerMinuteOptions.map((value) => (
                  <option key={value} value={value}>
                    {value} minutes
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="muted">Timer is off. The quiz stays in practice mode until you submit all batches.</p>
          )}
        </section>

        {formError ? <p className="error-text">{formError}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting || loading}>
          {submitting ? "Starting quiz..." : "Launch adaptive quiz"}
        </button>
      </form>
    </div>
  );
}
