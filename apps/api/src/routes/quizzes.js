import { Router } from "express";
import {
  createQuizSession,
  getQuizAnalysis,
  getQuizSession,
  submitBatch
} from "../services/sessionService.js";

export const quizzesRouter = Router();

quizzesRouter.post("/", async (request, response, next) => {
  try {
    const result = await createQuizSession(request.body || {});
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

quizzesRouter.get("/:sessionId", async (request, response, next) => {
  try {
    const result = await getQuizSession(request.params.sessionId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

quizzesRouter.get("/:sessionId/analysis", async (request, response, next) => {
  try {
    const result = await getQuizAnalysis(request.params.sessionId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

quizzesRouter.post("/:sessionId/batches/:batchIndex/submit", async (request, response, next) => {
  try {
    const result = await submitBatch(
      request.params.sessionId,
      Number.parseInt(request.params.batchIndex, 10),
      request.body?.answers
    );
    response.json(result);
  } catch (error) {
    next(error);
  }
});

