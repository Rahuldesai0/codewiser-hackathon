import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { historyRouter } from "./routes/history.js";
import { quizzesRouter } from "./routes/quizzes.js";
import { subjectsRouter } from "./routes/subjects.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDistDirectory = path.resolve(currentDirectory, "../../web/dist");

app.use(
  cors({
    origin: config.clientUrl
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/subjects", subjectsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/history", historyRouter);

if (existsSync(webDistDirectory)) {
  app.use(express.static(webDistDirectory));

  app.get(/^(?!\/api|\/health).*/, (_request, response) => {
    response.sendFile(path.join(webDistDirectory, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  response.status(status).json({
    error: error.message || "Unexpected server error.",
    details: error.details || null
  });
});

app.listen(config.port, () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
