import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

// Получить всех пользователей + активные брони
export const getAllUsers = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.findAll({
      attributes: ["id", "fullname", "email", "phone", "birthdate", "role"],
      include: [
        {
          model: Booking,
          where: {
            date: { [Op.gte]: today.toLocaleDateString("ru-RU") }
          },
          required: false
        }
      ]
    });

    return res.json(users);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка загрузки пользователей" });
  }
};

// Удалить пользователя
export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.id; // админ берётся из токена
    const { adminPassword } = req.body;

    // 1. Проверяем, что админ существует
    const admin = await User.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Администратор не найден" });
    }

    // 2. Проверяем пароль администратора
    const isValid = await bcrypt.compare(adminPassword, admin.password);
    if (!isValid) {
      return res.status(403).json({ message: "Неверный пароль администратора" });
    }

    // 3. Удаляем пользователя
    await User.destroy({ where: { id: req.params.id } });

    return res.json({ message: "Пользователь удалён" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка удаления пользователя" });
  }
};

// Сменить пароль пользователю
export const changeUserPassword = async (req, res) => {
  try {
    const { newPassword, adminPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "Пароль слишком короткий" });
    }

    // Проверяем пароль админа
    const admin = await User.findByPk(req.user.id);

    const valid = await bcrypt.compare(adminPassword, admin.password);
    if (!valid) {
      return res.status(403).json({ message: "Неверный пароль администратора" });
    }

    // Хешируем новый пароль пользователя
    const hashed = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashed },
      { where: { id: req.params.id } }
    );

    return res.json({ message: "Пароль пользователя обновлён" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка смены пароля" });
  }
};