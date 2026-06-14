import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addCard, getCards, deleteCard } from "../controllers/card.controller.js";

const router = Router();

router.post("/", authMiddleware, addCard);
router.get("/", authMiddleware, getCards);
router.delete("/:cardId", authMiddleware, deleteCard);

export default router;
