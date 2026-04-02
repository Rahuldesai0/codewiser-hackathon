import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChartCard } from "../components/ChartCard";
import { api } from "../lib/api";

function toChartItems(entries) {
  return Object.entries(entries || {}).map(([label, stats]) => ({
    label,
    score: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  }));
}

export function AnalysisPage() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      try {
        setLoading(true);
        const result = await api.getAnalysis(sessionId);
        if (!cancelled) {
          setData(result);
        }
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

    loadAnalysis();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <section className="panel">
        <p className="muted">Loading analysis...</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="panel">
        <p className="error-text">{error || "Analysis unavailable."}</p>
      </section>
    );
  }

  const subtopics = Object.values(data.subtopicBreakdown || {}).sort((a, b) =>
    a.subject.localeCompare(b.subject)
  );

  return (
    <div className="page-stack">
      <section className="panel summary-strip">
        <div>
          <p className="eyebrow">Detailed analysis</p>
          <h1>{data.session.username} scored {data.score.percentage}%</h1>
          <p className="muted">
            {data.score.correct} correct out of {data.score.answered} attempted questions
          </p>
        </div>
      </section>

      <div className="chart-grid">
        <ChartCard title="Difficulty-wise performance" items={toChartItems(data.difficultyPerformance)} />
        <ChartCard
          title="Batch trend"
          items={(data.batchHistory || []).map((batch) => ({
            label: `B${batch.batchIndex + 1}`,
            score: batch.accuracy
          }))}
        />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Subject and subtopic breakdown</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Subtopic</th>
                <th>Accuracy</th>
                <th>Skill</th>
              </tr>
            </thead>
            <tbody>
              {subtopics.map((entry) => (
                <tr key={`${entry.subject}-${entry.subtopic}`}>
                  <td>{entry.subject}</td>
                  <td>{entry.subtopic}</td>
                  <td>{entry.total ? Math.round((entry.correct / entry.total) * 100) : 0}%</td>
                  <td>{Math.round((entry.skill || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Question review</h2>
        </div>
        <div className="review-list">
          {data.review.map((item) => (
            <details key={`${item.batchIndex}-${item.questionId}`} className="review-item">
              <summary>
                <span className={`result-dot ${item.correct ? "good" : "bad"}`} />
                <strong>{item.prompt}</strong>
              </summary>
              <p className="muted">Your answer: {item.submittedAnswer || "Blank"}</p>
              <p className="muted">Correct answer: {item.correctAnswer}</p>
              <p>{item.explanation}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
