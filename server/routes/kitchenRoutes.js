import express from "express";
import multer from "multer";
import {
  getKitchenItems,
  addKitchenItem,
  stopKitchenItem,
  returnKitchenItem,
  updateKitchenItem
} from "../controllers/kitchenController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/kitchen",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", getKitchenItems);
router.post("/", upload.single("image"), addKitchenItem);
router.put("/:id/stop", stopKitchenItem);
router.put("/:id/return", returnKitchenItem);
router.put("/:id", upload.single("image"), updateKitchenItem);

export default router;
