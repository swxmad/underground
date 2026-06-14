import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  deleteUser,
  changeUserPassword
} from "../controllers/adminUsers.controller.js";

import {
  getBookingsByDate,
  getPendingBookings,
  updateStatus
} from "../controllers/adminBookings.controller.js";

const router = Router();

// USERS
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/users/:id/password", authMiddleware, adminMiddleware, changeUserPassword);

// BOOKINGS
router.get("/bookings/date/:date", authMiddleware, adminMiddleware, getBookingsByDate);
router.get("/bookings/pending", authMiddleware, adminMiddleware, getPendingBookings);
router.put("/bookings/:id/status", authMiddleware, adminMiddleware, updateStatus);

// ORDERS
//router.get("/orders", authMiddleware, adminMiddleware, getOrders);
//router.put("/orders/:id/delivered", authMiddleware, adminMiddleware, markDelivered);

export default router;
