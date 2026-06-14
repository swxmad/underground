import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createBooking, getMyBookings, getAllBookings, updateStatus, rejectBooking, getOccupiedTables } from "../controllers/booking.controller.js";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/occupied", authMiddleware, getOccupiedTables);

// admin
router.get("/all", authMiddleware, getAllBookings);
router.put("/:id/status", authMiddleware, updateStatus);
router.put("/:id/reject", authMiddleware, rejectBooking);


export default router;
