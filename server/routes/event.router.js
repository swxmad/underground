import express from "express";
import { handleUpload } from "../middleware/uploadMemory.js";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", handleUpload("image"), createEvent);
router.put("/:id", handleUpload("image"), updateEvent);
router.delete("/:id", deleteEvent);

export default router;
