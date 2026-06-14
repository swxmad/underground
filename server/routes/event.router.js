import express from "express";
import { upload } from "../middleware/upload.js";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", upload.single("image"), createEvent);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

export default router;
