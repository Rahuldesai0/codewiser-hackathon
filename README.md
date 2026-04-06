# Adaptive Quiz Lab

An adaptive quiz platform built from the `design.md` spec:

- React frontend for quiz setup, quiz-taking, analysis, and history
- Node/Express API for validation, persistence, and optional static serving
- Python FastAPI intelligence service for adaptive selection and scoring
- Postgres schema with seeded OS, DBMS, and DSA question banks
- Multi-provider question harvesting for extra variety
- Deterministic subject/topic refinement and difficulty clustering for harvested questions
- Background crawler that keeps growing the question bank in Postgres
- Drop-in local dataset import pipeline for larger question banks

## What is included

- Batch-based quiz flow with no answer leakage during the quiz
- Adaptive next-batch selection using weak, strong, and exploratory subtopic picks
- Stable subtopic skill tracking from 0 to 1
- Subject-wise difficulty clustering using a lightweight KMeans-style routine
- End-of-test analysis with score, difficulty performance, subtopic skill view, and review
- History page with recent sessions and performance charts
- Guardrails for common bad-input scenarios:
  - invalid usernames
  - duplicate subject picks
  - question counts that do not divide evenly into batch size
  - accidental blank submissions
  - duplicate batch submissions
  - stale refreshes and resume flows
- short-answer normalization for case, punctuation, and spacing
- temporary remote question cache that is cleaned up when a quiz finishes
- remote difficulty estimation from question features, clustered into easy, medium, and hard without LLMs

## Project structure

```text
apps/
  api/                 Express API
  web/                 React + Vite frontend
services/
  intelligence/        FastAPI adaptive engine
database/
  schema.sql
  seed.sql
```

## Local run

1. Start Postgres:

```powershell
docker compose up -d
```

2. Create schema and seed data:

```powershell
psql -h localhost -U postgres -d adaptive_quiz -f database/schema.sql
psql -h localhost -U postgres -d adaptive_quiz -f database/seed.sql
```

If you already created the database before the remote cache feature was added, run:

```powershell
psql -h localhost -U postgres -d adaptive_quiz -f database/migrations/001_remote_question_cache.sql
psql -h localhost -U postgres -d adaptive_quiz -f database/migrations/002_background_crawler.sql
psql -h localhost -U postgres -d adaptive_quiz -f database/migrations/003_question_import_runs.sql
```

3. Install JS dependencies:

```powershell
npm install
```

4. Install Python dependencies:

```powershell
pip install -r services/intelligence/requirements.txt
```

5. Run the intelligence service:

```powershell
uvicorn services.intelligence.app.main:app --host 127.0.0.1 --port 8000 --app-dir .
```

6. Run the API:

```powershell
npm run dev:api
```

7. Run the frontend:

```powershell
npm run dev:web
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Environment variables

API services:

- `PORT` defaults to `4000`
- `DATABASE_URL` defaults to `postgres://postgres:postgres@localhost:5432/adaptive_quiz`
- `INTELLIGENCE_URL` defaults to `http://127.0.0.1:8000`
- `CLIENT_URL` defaults to `http://127.0.0.1:5173`
- `ENABLE_QUESTION_CRAWLER` defaults to `true`
- `ENABLE_BACKGROUND_QUESTION_CRAWLER` defaults to `true`
- `STACKEXCHANGE_API_BASE` defaults to `https://api.stackexchange.com/2.3`
- `STACKEXCHANGE_KEY` defaults to empty
- `OPEN_TRIVIA_API_BASE` defaults to `https://opentdb.com/api.php`
- `HUGGINGFACE_DATASET_API_BASE` defaults to `https://datasets-server.huggingface.co/rows`
- `HUGGINGFACE_DATASET_NAME` defaults to `lmms-lab/CSBench_MCQ`
- `HUGGINGFACE_DATASET_CONFIG` defaults to `default`
- `HUGGINGFACE_DATASET_SPLIT` defaults to `mcq`
- `HUGGINGFACE_DATASET_ENABLED` defaults to `true`
- `HUGGINGFACE_DATASET_LENGTH` defaults to `100`
- `HUGGINGFACE_DATASET_MAX_PAGES` defaults to `10`
- `HUGGINGFACE_DATASET_ESTIMATED_ROWS` defaults to `1336`
- `QUIZ_API_BASE` defaults to `https://quizapi.io/api/v1`
- `QUIZ_API_KEY` defaults to empty
- `ENABLE_QUESTION_IMPORTS` defaults to `true`
- `QUESTION_IMPORT_DIRECTORY` defaults to `data/question-imports`
- `REMOTE_QUESTION_MULTIPLIER` defaults to `3`
- `CRAWLER_MINIMUM_GAP_MS` defaults to `600000`
- `CRAWLER_PROVIDER_BACKOFF_MS` defaults to `1800000`
- `CRAWLER_INTERVAL_MS` defaults to `1200000`
- `CRAWLER_STARTUP_DELAY_MS` defaults to `10000`
- `CRAWLER_HARVEST_TARGET` defaults to `120`

Frontend:

- `VITE_API_URL` defaults to `http://127.0.0.1:4000/api`

## Notes

- The intelligence service labels difficulty per subject from prompt complexity and then refines usefulness through actual user accuracy over time in session analytics.
- Express can also serve the built frontend bundle if `apps/web/dist` exists.
- The seeded question bank is intentionally compact but diverse enough to exercise the adaptive logic.
- Remote questions are harvested continuously by the background crawler and can be topped up on demand if a requested quiz size exceeds the current bank.
- Harvested questions now go through a second non-LLM subject/topic refinement pass before difficulty clustering, which helps reject generic programming trivia and keep the bank closer to OS, DBMS, and DSA.
- The refinement pass now uses the seeded local bank as labeled anchors, so provider hints like `Computer Networks` from CSBench are much less likely to collapse into the wrong subject.
- Harvested and imported questions are featurized and clustered into three difficulty bands before the quiz starts, so batch selection does not wait on extra clustering work mid-quiz.
- The API now also runs a background crawler loop that periodically tops up the normalized `questions` table for the supported subjects, with run metadata stored in `crawler_runs`.
- The crawler now uses multiple providers: Stack Exchange API, Hugging Face CSBench_MCQ, Open Trivia DB, and QuizAPI when `QUIZ_API_KEY` is configured.
- You can inspect crawler health at `GET /api/crawler/status` and trigger an immediate run with `POST /api/crawler/run`.
- You can drop JSON, JSONL, or NDJSON files into the `data/question-imports` folder using the examples in `data/question-imports/README.md`, and the crawler will import them alongside remote sources.
- If a provider returns `429`, the crawler now backs off temporarily and exposes that cooldown in `/api/crawler/status` instead of hammering the same endpoint again on every restart.
