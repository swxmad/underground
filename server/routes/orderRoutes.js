import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// пользователь
router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);

// админ
router.get("/", adminMiddleware, getAllOrders);
router.put("/:id/status", adminMiddleware, updateOrderStatus);

export default router;
