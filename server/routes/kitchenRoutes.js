import express from "express";
import { handleUpload } from "../middleware/uploadMemory.js";
import {
  getKitchenItems,
  addKitchenItem,
  stopKitchenItem,
  returnKitchenItem,
  updateKitchenItem
} from "../controllers/kitchenController.js";

const router = express.Router();

router.get("/", getKitchenItems);
router.post("/", handleUpload("image"), addKitchenItem);
router.put("/:id/stop", stopKitchenItem);
router.put("/:id/return", returnKitchenItem);
router.put("/:id", handleUpload("image"), updateKitchenItem);

export default router;
