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

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Ошибка загрузки изображения бара:", err);
      return res.status(400).json({ message: "Ошибка загрузки изображения" });
    }
    next();
  });
};

router.get("/", getBarItems);
router.post("/", handleUpload, addBarItem);
router.put("/:id", handleUpload, updateBarItem);
router.put("/:id/stop", stopBarItem);
router.put("/:id/return", returnBarItem);

export default router;
