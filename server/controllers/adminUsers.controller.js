import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import bcryptjs from "bcryptjs";
import { Op } from "sequelize";

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

export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { adminPassword } = req.body;

    const admin = await User.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Администратор не найден" });
    }

    const isValid = await bcryptjs.compare(adminPassword, admin.password);
    if (!isValid) {
      return res.status(403).json({ message: "Неверный пароль администратора" });
    }

    await User.destroy({ where: { id: req.params.id } });

    return res.json({ message: "Пользователь удалён" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка удаления пользователя" });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { newPassword, adminPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "Пароль слишком короткий" });
    }

    const admin = await User.findByPk(req.user.id);

    const valid = await bcryptjs.compare(adminPassword, admin.password);
    if (!valid) {
      return res.status(403).json({ message: "Неверный пароль администратора" });
    }

    const hashed = await bcryptjs.hash(newPassword, 10);

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