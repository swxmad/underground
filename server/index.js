import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { sequelize } from "./config/db.js";
import { User } from "./models/User.js";
import authRoutes from "./routes/auth.router.js";
import bcryptjs from "bcryptjs";
import eventRoutes from "./routes/event.router.js";
import kitchenRoutes from "./routes/kitchenRoutes.js";
import barRoutes from "./routes/barRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import cardRoutes from "./routes/card.router.js";
import bookingRoutes from "./routes/booking.router.js";
import adminRoutes from "./routes/admin.router.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import "./models/associations.js";
import courierRoutes from "./routes/courier.routes.js";
import courierOrdersRoutes from "./routes/courier.orders.routes.js";
import { Server } from "socket.io";
import http from "http";
import chatRoutes from "./routes/chatRoutes.js";
import { Message } from "./models/Message.js";
import { Chat } from "./models/Chat.js";
import { Op } from "sequelize";
import { getAdminChat } from "./routes/chatWidgetRoutes.js";
import { isCloudinaryEnabled } from "./config/cloudinary.js";
import { formatImagesDeep } from "./utils/formatImage.js";
import jwt from "jsonwebtoken";

dotenv.config();

const CLIENT_URL =
  process.env.FRONTEND_URL || "https://underground-4fpj.onrender.com";

if (isCloudinaryEnabled) {
  console.log("☁️ Cloudinary: постоянное хранение изображений включено");
} else {
  console.warn(
    "⚠️ Cloudinary не настроен — изображения сохраняются локально и пропадут после перезапуска"
  );
}

["uploads", "uploads/bar", "uploads/kitchen", "uploads/events"].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

const attachIo = (req, res, next) => {
  req.io = io;
  next();
};

// -------------------- CORS --------------------
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Прокси для внешних изображений (Cloudinary) — совместимость со старым фронтендом
app.get("/api/media", (req, res) => {
  const { src } = req.query;

  if (!src || typeof src !== "string") {
    return res.status(400).json({ message: "Не указан URL изображения" });
  }

  try {
    const url = new URL(src);
    const allowedHosts = ["res.cloudinary.com"];

    if (!allowedHosts.includes(url.hostname)) {
      return res.status(403).json({ message: "Источник изображения не разрешён" });
    }

    res.redirect(302, src);
  } catch {
    res.status(400).json({ message: "Некорректный URL изображения" });
  }
});

// Все внешние image-URL в API отдаём как /api/media?... для старого фронтенда
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(formatImagesDeep(body));
  next();
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/kitchen", authMiddleware, kitchenRoutes);
app.use("/api/bar", authMiddleware, barRoutes);
app.use("/api/cards", authMiddleware, cardRoutes);
app.use("/api/bookings", authMiddleware, attachIo, bookingRoutes);
app.use("/api/admin", authMiddleware, attachIo, adminRoutes);
app.use("/api/orders", authMiddleware, attachIo, orderRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/couriers", authMiddleware, courierRoutes);
app.use("/api/courier/orders", authMiddleware, attachIo, courierOrdersRoutes);

// Прокидываем io в req
app.use(
  "/api/chats",
  authMiddleware,
  attachIo,
  chatRoutes
);

// Чат с админом
app.get("/api/chats/admin", authMiddleware, getAdminChat);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(err.status || 500).json({
    message: err.message || "Внутренняя ошибка сервера",
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRooms", async (token) => {
    if (!token) return;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      const user = await User.findByPk(decoded.id);
      if (!user) return;

      socket.join(`user_${user.id}`);
      if (user.role === "admin") socket.join("admin");
      if (user.role === "courier") socket.join("couriers");
    } catch {
      // invalid token — ignore
    }
  });

  socket.on("joinChat", (chatId) => {
    if (!chatId) return;
    socket.join(`chat_${chatId}`);
  });

  socket.on("readMessages", async ({ chatId, readerId }) => {
    if (!chatId) return;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return;

    const roles = [chat.participant1Role, chat.participant2Role];
    if (roles.includes("user") && roles.includes("courier")) return;

    await Message.update(
      { isRead: true },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: readerId }
        }
      }
    );

    io.to(`chat_${chatId}`).emit("messagesRead", {
      chatId,
      readerId
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("⏳ Подключение к базе данных...");

    await sequelize.authenticate();
    console.log("✅ Подключение к PostgreSQL установлено");

    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("typing").catch(() => {});
    await queryInterface.dropTable("presence").catch(() => {});

    await sequelize.sync();
    console.log("📦 Модели синхронизированы");

    // Создание администратора
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123_";

    if (adminEmail) {
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });

      if (!existingAdmin) {
        const hashedPassword = await bcryptjs.hash(adminPassword, 10);

        await User.create({
          fullname: "Администратор",
          phone: "+70000000000",
          birthdate: "01.01.1990",
          email: adminEmail,
          password: hashedPassword,
          role: "admin"
        });

        console.log(`👑 Администратор создан: ${adminEmail}`);
      } else {
        console.log(`ℹ️ Администратор уже существует: ${adminEmail}`);
      }
    }

    server.listen(PORT, () =>
      console.log(`🚀 Сервер + Socket.IO запущены на порту ${PORT}`)
    );
  } catch (e) {
    console.error("❌ Ошибка запуска сервера:", e.message);
  }
};

start();
