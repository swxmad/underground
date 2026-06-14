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

// Все маршруты доступны только курьеру
router.use(authMiddleware);

// доступные заказы
router.get("/available", getAvailableOrders);

// взять заказ
router.put("/:id/take", takeOrder);

// активные заказы
router.get("/active", getActiveOrders);

// обновить статус
router.put("/:id/status", updateOrderStatus);

// история
router.get("/history", getHistory);

export default router;
