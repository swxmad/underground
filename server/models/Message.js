import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Message = sequelize.define("Message", {
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  senderRole: {
    type: DataTypes.ENUM("user", "courier", "admin"),
    allowNull: false
  },

  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "messages"
});
