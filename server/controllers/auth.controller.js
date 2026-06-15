import { User } from "../models/User.js";
import { Chat } from "../models/Chat.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// регистрация
export const register = async (req, res) => {
  try {
    const { fullname, phone, birthdate, email, password } = req.body;

    if (!fullname || !phone || !birthdate || !email || !password)
      return res.status(400).json({ message: "Заполните все поля" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Пользователь уже существует" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      phone,
      birthdate,
      email,
      password: hashedPassword,
      role: "user"
    });

    const admin = await User.findOne({ where: { role: "admin" } });

    await Chat.create({
      participant1Id: user.id,
      participant1Role: "user",
      participant2Id: admin.id,
      participant2Role: "admin",
      lastMessage: null,
      lastMessageAt: null
    });

    return res.status(201).json({ message: "Регистрация успешна" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

//вход
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Введите email и пароль" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: "Неверный логин или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный логин или пароль" });
    }

    if (user.needsActivation) {
      return res.status(403).json({ message: "Аккаунт не активирован" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        phone: user.phone,
        birthdate: user.birthdate,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};


//редактировать профиль
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullname, phone, birthdate, email } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    user.fullname = fullname;
    user.phone = phone;
    user.birthdate = birthdate;
    user.email = email;

    await user.save();

    return res.json({
      message: "Данные обновлены",
      user: {
        id: user.id,
        fullname: user.fullname,
        phone: user.phone,
        birthdate: user.birthdate,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

//сменить пароль
export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Старый пароль неверный" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ message: "Пароль успешно изменён" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

// удалить собственный аккаунт
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.user;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Введите пароль" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    await user.destroy();

    return res.json({ message: "Аккаунт удалён" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка удаления аккаунта" });
  }
};

//хз для профиля админа
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "fullname", "email", "phone", "birthdate", "role"]
    });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
