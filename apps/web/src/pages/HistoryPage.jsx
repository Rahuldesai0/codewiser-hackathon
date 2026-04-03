import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AccuracyTrendCard } from "../components/AccuracyTrendCard";
import { ChartCard } from "../components/ChartCard";
import { api } from "../lib/api";

export function HistoryPage() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState({ sessions: [], trend: [], subjectPerformance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendRange, setTrendRange] = useState("all");

  async function loadHistory(nextUsername = "") {
    try {
      setLoading(true);
      setError("");
      const result = await api.getHistory(nextUsername);
      setData(result);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="page-stack">
      <section className="panel summary-strip">
        <div>
          <p className="eyebrow">Test history</p>
          <h1>Past sessions and long-term movement</h1>
        </div>
        <form
          className="history-filter"
          onSubmit={(event) => {
            event.preventDefault();
            loadHistory(username);
          }}
        >
          <input
            type="text"
            placeholder="Filter by username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <button className="ghost-button" type="submit">
            Filter
          </button>
        </form>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="chart-grid">
        <AccuracyTrendCard
          sessions={data.sessions}
          range={trendRange}
          onRangeChange={setTrendRange}
          loading={loading}
        />
        <ChartCard title="Subject performance" items={data.subjectPerformance} />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent quizzes</h2>
          {loading ? <p className="muted">Refreshing...</p> : null}
        </div>
        <div className="history-list">
          {data.sessions.length ? (
            data.sessions.map((session) => (
              <Link key={session.id} className="history-card" to={`/history/${session.id}`}>
                <div>
                  <strong>{session.username}</strong>
                  <p className="muted">{session.subjects.join(" | ")}</p>
                </div>
                <div>
                  <strong>{session.percentage}%</strong>
                  <p className="muted">{session.totalCorrect}/{session.totalAnswered} correct</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="muted">No quizzes found yet. Start one from the home page.</p>
          )}
        </div>
      </section>
    </div>
  );
}
