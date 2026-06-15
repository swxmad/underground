import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";

export const getAdminChat = async (req, res) => {
  const userId = req.user.id;

  const admin = await User.findOne({ where: { role: "admin" } });
  if (!admin) return res.status(500).json({ message: "Админ не найден" });

  let chat = await Chat.findOne({
    where: {
      [Op.or]: [
        { participant1Id: userId, participant2Id: admin.id },
        { participant1Id: admin.id, participant2Id: userId }
      ]
    }
  });

  if (!chat) {
    chat = await Chat.create({
      participant1Id: userId,
      participant1Role: req.user.role,
      participant2Id: admin.id,
      participant2Role: "admin",
      lastMessage: null,
      lastMessageAt: null
    });
  }

  res.json({ chatId: chat.id });
};
