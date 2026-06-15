import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAvailableOrders,
  takeOrder,
  getActiveOrders,
  updateOrderStatus,
  getHistory
} from "../controllers/courierOrders.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/available", getAvailableOrders);

router.put("/:id/take", takeOrder);

router.get("/active", getActiveOrders);

router.put("/:id/status", updateOrderStatus);

router.get("/history", getHistory);

export default router;
