import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Chat = sequelize.define("Chat", {
  participant1Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  participant1Role: {
    type: DataTypes.ENUM("user", "courier", "admin"),
    allowNull: false
  },
  participant2Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  participant2Role: {
    type: DataTypes.ENUM("user", "courier", "admin"),
    allowNull: false
  },

  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  unreadForP1: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  unreadForP2: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "chats"
});
