import express from "express";
import upload from "../middleware/uploadBar.js";
import {
  getBarItems,
  addBarItem,
  updateBarItem,
  stopBarItem,
  returnBarItem,
} from "../controllers/barController.js";

const router = express.Router();

router.get("/", getBarItems);
router.post("/", upload.single("image"), addBarItem);
router.put("/:id", upload.single("image"), updateBarItem);
router.put("/:id/stop", stopBarItem);
router.put("/:id/return", returnBarItem);

export default router;
