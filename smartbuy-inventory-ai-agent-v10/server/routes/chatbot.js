import { Router } from "express";
import { askInventoryChatbot } from "../services/chatbot.js";

export const chatbotRouter = Router();

chatbotRouter.post("/chat", async (req, res, next) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        message: "Message is too long",
      });
    }

    const result = await askInventoryChatbot(message);

    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
});