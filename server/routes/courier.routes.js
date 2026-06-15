import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getCouriers,
  createCourierLocal,
  inviteCourier,
  getInviteInfo,
  activateCourier,
  deleteCourier,
  changeCourierPassword
} from "../controllers/courier.controller.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/activate/:token", getInviteInfo);
router.post("/activate/:token", activateCourier);

router.get("/", authMiddleware, adminMiddleware, getCouriers);

router.post("/create", authMiddleware, adminMiddleware, createCourierLocal);

router.post("/invite", authMiddleware, adminMiddleware, inviteCourier);

router.put("/:id/password", authMiddleware, adminMiddleware, changeCourierPassword);

router.delete("/:id", authMiddleware, adminMiddleware, deleteCourier);

export default router;
