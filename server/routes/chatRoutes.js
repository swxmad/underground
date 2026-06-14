import express from "express";
import {
  getChats,
  openChat,
  getChatMessages,
  sendMessage,
  markAsRead
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getChats);
router.post("/open", authMiddleware, openChat);
router.get("/:id/messages", authMiddleware, getChatMessages);
router.post("/:id/messages", authMiddleware, sendMessage);
router.put("/:id/read", authMiddleware, markAsRead);

export default router;
