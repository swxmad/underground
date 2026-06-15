import { Router } from "express";
import {
  register,
  login,
  updateProfile,
  changePassword,
  deleteAccount,
  getMe
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.post("/register", register);
router.post("/login", login);

router.put("/update", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

export default router;
