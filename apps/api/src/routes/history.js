import { Router } from "express";
import { getHistory } from "../services/sessionService.js";

export const historyRouter = Router();

historyRouter.get("/", async (request, response, next) => {
  try {
    const result = await getHistory(request.query.username);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

