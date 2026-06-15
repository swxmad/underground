import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";

export const getChats = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let where = {
    [Op.or]: [
      { participant1Id: userId },
      { participant2Id: userId }
    ]
  };

  if (role === "user") {
    where = {
      [Op.or]: [
        { participant1Id: userId, participant2Role: "admin" },
        { participant2Id: userId, participant1Role: "admin" }
      ]
    };
  }

  if (role === "courier") {
    where = {
      [Op.or]: [
        { participant1Id: userId, participant2Role: "admin" },
        { participant2Id: userId, participant1Role: "admin" }
      ]
    };
  }

  const chats = await Chat.findAll({
    where,
    include: [
      { model: User, as: "Participant1", attributes: ["fullname"] },
      { model: User, as: "Participant2", attributes: ["fullname"] }
    ],
    order: [["lastMessageAt", "DESC"]]
  });

  const result = [];

  for (const chat of chats) {
    const isP1 = chat.participant1Id === userId;
    const otherId = isP1 ? chat.participant2Id : chat.participant1Id;
    const otherUser = await User.findByPk(otherId);

    result.push({
      id: chat.id,
      otherId,
      otherName: otherUser.fullname,
      otherRole: isP1 ? chat.participant2Role : chat.participant1Role,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageAt,
      unread: isP1 ? chat.unreadForP1 : chat.unreadForP2
    });
  }

  res.json(result);
};

export const openChat = async (req, res) => {
  const { participant1Id, participant1Role, participant2Id, participant2Role } = req.body;

  if (
    (participant1Role === "user" && participant2Role === "courier") ||
    (participant1Role === "courier" && participant2Role === "user")
  ) {
    return res.status(400).json({ message: "Чат между пользователем и курьером запрещён" });
  }

  let chat = await Chat.findOne({
    where: {
      [Op.or]: [
        { participant1Id, participant2Id },
        { participant1Id: participant2Id, participant2Id: participant1Id }
      ]
    }
  });

  if (!chat) {
    chat = await Chat.create({
      participant1Id,
      participant1Role,
      participant2Id,
      participant2Role,
      lastMessage: null,
      lastMessageAt: null
    });
  }

  res.json(chat);
};

export const getChatMessages = async (req, res) => {
  const chatId = req.params.id;

  const messages = await Message.findAll({
    where: { chatId },
    order: [["createdAt", "ASC"]]
  });

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const chatId = req.params.id;
  const senderId = req.user.id;
  const senderRole = req.user.role;
  const { text } = req.body;

  const chat = await Chat.findByPk(chatId);
  if (!chat) return res.status(404).json({ message: "Чат не найден" });

  const message = await Message.create({
    chatId,
    senderId,
    senderRole,
    text
  });

  const isP1 = chat.participant1Id === senderId;

  await chat.update({
    lastMessage: text,
    lastMessageAt: new Date(),
    unreadForP1: isP1 ? chat.unreadForP1 : chat.unreadForP1 + 1,
    unreadForP2: isP1 ? chat.unreadForP2 + 1 : chat.unreadForP2
  });

  req.io.to(`chat_${chatId}`).emit("newMessage", {
    chatId,
    message
  });

  res.json(message);
};

export const markAsRead = async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;

  const chat = await Chat.findByPk(chatId);
  if (!chat) return res.status(404).json({ message: "Чат не найден" });

  const roles = [chat.participant1Role, chat.participant2Role];
  if (roles.includes("user") && roles.includes("courier")) {
    return res.status(400).json({ message: "Чат между пользователем и курьером запрещён" });
  }

  await Message.update(
    { isRead: true },
    {
      where: {
        chatId,
        senderId: { [Op.ne]: userId }
      }
    }
  );

  const isP1 = chat.participant1Id === userId;

  await chat.update({
    unreadForP1: isP1 ? 0 : chat.unreadForP1,
    unreadForP2: isP1 ? chat.unreadForP2 : 0
  });

  res.json({ success: true });
};