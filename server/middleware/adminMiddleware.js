import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Токен отсутствует" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещён" });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: "Ошибка авторизации" });
  }
};
