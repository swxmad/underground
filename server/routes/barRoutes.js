import express from "express";
import { handleUpload } from "../middleware/uploadMemory.js";
import {
  getBarItems,
  addBarItem,
  updateBarItem,
  stopBarItem,
  returnBarItem,
} from "../controllers/barController.js";

const router = express.Router();

router.get("/", getBarItems);
router.post("/", handleUpload("image"), addBarItem);
router.put("/:id", handleUpload("image"), updateBarItem);
router.put("/:id/stop", stopBarItem);
router.put("/:id/return", returnBarItem);

export default router;
