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

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Ошибка загрузки изображения кухни:", err);
      return res.status(400).json({ message: "Ошибка загрузки изображения" });
    }
    next();
  });
};

router.get("/", getKitchenItems);
router.post("/", handleUpload, addKitchenItem);
router.put("/:id/stop", stopKitchenItem);
router.put("/:id/return", returnKitchenItem);
router.put("/:id", handleUpload, updateKitchenItem);

export default router;
