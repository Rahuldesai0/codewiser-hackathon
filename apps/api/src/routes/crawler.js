import { Router } from "express";
import { uniqueStrings } from "../utils.js";
import {
  getCrawlerStatus,
  runManualCrawler
} from "../services/backgroundCrawlerService.js";

export const crawlerRouter = Router();

crawlerRouter.get("/status", async (_request, response, next) => {
  try {
    const status = await getCrawlerStatus();
    response.json(status);
  } catch (error) {
    next(error);
  }
});

crawlerRouter.post("/run", async (request, response, next) => {
  try {
    const subjects = uniqueStrings(request.body?.subjects || []).map((subject) => subject.toUpperCase());
    const desiredQuestionTarget = Number.parseInt(
      String(request.body?.desiredQuestionTarget || request.body?.questionTarget || 0),
      10
    );

    const result = await runManualCrawler({
      subjects: subjects.length ? subjects : undefined,
      desiredQuestionTarget: Number.isNaN(desiredQuestionTarget) || desiredQuestionTarget <= 0
        ? undefined
        : desiredQuestionTarget
    });

    response.status(202).json(result);
  } catch (error) {
    next(error);
  }
});
