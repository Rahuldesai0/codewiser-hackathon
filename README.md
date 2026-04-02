# Adaptive Quiz Lab

An adaptive quiz platform built from the `design.md` spec:

- React frontend for quiz setup, quiz-taking, analysis, and history
- Node/Express API for validation, persistence, and optional static serving
- Python FastAPI intelligence service for adaptive selection and scoring
- Postgres schema with seeded OS, DBMS, and DSA question banks

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

API service:

- `PORT` defaults to `4000`
- `DATABASE_URL` defaults to `postgres://postgres:postgres@localhost:5432/adaptive_quiz`
- `INTELLIGENCE_URL` defaults to `http://127.0.0.1:8000`
- `CLIENT_URL` defaults to `http://127.0.0.1:5173`

Frontend:

- `VITE_API_URL` defaults to `http://127.0.0.1:4000/api`

## Notes

- The intelligence service labels difficulty per subject from prompt complexity and then refines usefulness through actual user accuracy over time in session analytics.
- Express can also serve the built frontend bundle if `apps/web/dist` exists.
- The seeded question bank is intentionally compact but diverse enough to exercise the adaptive logic.
