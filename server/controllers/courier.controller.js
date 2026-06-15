import { User } from "../models/User.js";
import bcryptjs from "bcryptjs";
import { sendMail } from "../services/emailService.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Chat } from "../models/Chat.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://underground-server.onrender.com";

export const getCouriers = async (req, res) => {
  try {
    const couriers = await User.findAll({
      where: { role: "courier", needsActivation: false }
    });

    return res.json(couriers);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const createCourierLocal = async (req, res) => {
  try {
    const { fullname, phone, birthdate, email, password } = req.body;

    if (!fullname || !phone || !birthdate || !email || !password)
      return res.status(400).json({ message: "Заполните все поля" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing)
      return res.status(400).json({ message: "Курьер с таким email уже существует" });

    const hashed = await bcryptjs.hash(password, 10);

    const courier = await User.create({
      fullname,
      phone,
      birthdate,
      email: normalizedEmail,
      password: hashed,
      role: "courier",
      needsActivation: false
    });

    const admin = await User.findOne({ where: { role: "admin" } });

    if (admin) {
      await Chat.create({
        participant1Id: courier.id,
        participant1Role: "courier",
        participant2Id: admin.id,
        participant2Role: "admin",
        lastMessage: null,
        lastMessageAt: null
      });
    }

    return res.json({ message: "Курьер создан" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const inviteCourier = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Введите email" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      if (existing.role !== "courier" || !existing.needsActivation) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const activationLink = `${FRONTEND_URL}/courier/activate/${token}`;

    if (existing?.needsActivation) {
      existing.activationToken = token;
      await existing.save();
    } else {
      const hashedPlaceholder = await bcryptjs.hash(
        crypto.randomBytes(32).toString("hex"),
        10
      );

      await User.create({
        fullname: "—",
        phone: "+7(000) 000-00-00",
        birthdate: "01.01.1990",
        email: normalizedEmail,
        password: hashedPlaceholder,
        role: "courier",
        needsActivation: true,
        activationToken: token
      });
    }

    let mailResult;

    try {
      mailResult = await sendMail(
        normalizedEmail,
        "Приглашение в систему Underground",
        `Вас пригласили работать курьером в Underground.\n\n` +
        `Перейдите по ссылке и заполните форму регистрации:\n${activationLink}\n\n` +
        `После регистрации вы сможете войти в личный кабинет курьера.`
      );
    } catch (mailError) {
      if (!existing) {
        await User.destroy({
          where: { email: normalizedEmail, needsActivation: true }
        });
      }

      return res.status(500).json({
        message: mailError.message || "Не удалось отправить письмо"
      });
    }

    if (mailResult.mode === "console") {
      return res.json({
        message: "Почта не настроена. Ссылка для регистрации курьера сгенерирована.",
        activationLink,
        devMode: true
      });
    }

    return res.json({ message: "Приглашение отправлено на email" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getInviteInfo = async (req, res) => {
  try {
    const { token } = req.params;

    const courier = await User.findOne({
      where: {
        activationToken: token,
        needsActivation: true,
        role: "courier"
      }
    });

    if (!courier) {
      return res.status(404).json({ message: "Ссылка недействительна или уже использована" });
    }

    return res.json({ email: courier.email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const activateCourier = async (req, res) => {
  try {
    const { token } = req.params;
    const { fullname, phone, birthdate, password } = req.body;

    if (!fullname || !phone || !birthdate || !password) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const courier = await User.findOne({
      where: {
        activationToken: token,
        needsActivation: true,
        role: "courier"
      }
    });

    if (!courier) {
      return res.status(404).json({ message: "Ссылка недействительна или уже использована" });
    }

    const hashed = await bcryptjs.hash(password, 10);

    await courier.update({
      fullname,
      phone,
      birthdate,
      password: hashed,
      needsActivation: false,
      activationToken: null
    });

    const admin = await User.findOne({ where: { role: "admin" } });

    if (admin) {
      const existingChat = await Chat.findOne({
        where: {
          participant1Id: courier.id,
          participant2Id: admin.id
        }
      });

      if (!existingChat) {
        await Chat.create({
          participant1Id: courier.id,
          participant1Role: "courier",
          participant2Id: admin.id,
          participant2Role: "admin",
          lastMessage: null,
          lastMessageAt: null
        });
      }
    }

    const jwtToken = jwt.sign(
      { id: courier.id, role: courier.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Регистрация завершена",
      token: jwtToken,
      user: {
        id: courier.id,
        fullname: courier.fullname,
        phone: courier.phone,
        birthdate: courier.birthdate,
        email: courier.email,
        role: courier.role
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const deleteCourier = async (req, res) => {
  try {
    const { id } = req.params;

    await User.destroy({ where: { id, role: "courier" } });

    return res.json({ message: "Курьер удалён" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const changeCourierPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "Введите пароль" });

    const hashed = await bcryptjs.hash(newPassword, 10);

    await User.update(
      { password: hashed },
      { where: { id, role: "courier" } }
    );

    return res.json({ message: "Пароль изменён" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
