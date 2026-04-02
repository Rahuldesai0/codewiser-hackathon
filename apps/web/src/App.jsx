import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { SetupPage } from "./pages/SetupPage";
import { QuizPage } from "./pages/QuizPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { activeSessionStorageKey, api } from "./lib/api";
import { fallbackSubjects } from "./lib/fallbackSubjects";

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeSession = localStorage.getItem(activeSessionStorageKey());

  useEffect(() => {
    let cancelled = false;

    async function loadSubjects() {
      try {
        setLoading(true);
        const result = await api.getSubjects();
        if (!cancelled) {
          setSubjects((result.subjects || []).length ? result.subjects : fallbackSubjects);
          setError("");
        }
      } catch (caughtError) {
        if (!cancelled) {
          setSubjects(fallbackSubjects);
          setError("Subjects are shown from the local fallback catalog because the API is not reachable yet.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-badge">AQ</span>
          <span>Adaptive Quiz Lab</span>
        </Link>
        <nav className="nav-row">
          <Link to="/">Home</Link>
          <Link to="/history">History</Link>
          {activeSession ? <Link to={`/quiz/${activeSession}`}>Resume</Link> : null}
        </nav>
      </header>

      <main className="content-shell">
        <Routes>
          <Route path="/" element={<SetupPage subjects={subjects} loading={loading} error={error} />} />
          <Route path="/quiz/:sessionId" element={<QuizPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:sessionId" element={<AnalysisPage />} />
        </Routes>
      </main>
    </div>
  );
}
