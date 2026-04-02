import { Router } from "express";
import { getSubjectCatalog } from "../services/sessionService.js";

export const subjectsRouter = Router();

subjectsRouter.get("/", async (_request, response, next) => {
  try {
    const subjects = await getSubjectCatalog();
    response.json({ subjects });
  } catch (error) {
    next(error);
  }
});

