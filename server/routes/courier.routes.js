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

// публичные — завершение регистрации по приглашению
router.get("/activate/:token", getInviteInfo);
router.post("/activate/:token", activateCourier);

// получить всех курьеров
router.get("/", authMiddleware, adminMiddleware, getCouriers);

// локальная регистрация
router.post("/create", authMiddleware, adminMiddleware, createCourierLocal);

// продакшен — приглашение по email
router.post("/invite", authMiddleware, adminMiddleware, inviteCourier);

// смена пароля
router.put("/:id/password", authMiddleware, adminMiddleware, changeCourierPassword);

// удаление курьера
router.delete("/:id", authMiddleware, adminMiddleware, deleteCourier);

export default router;
