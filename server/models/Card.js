import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./User.js";

export const Card = sequelize.define("Card", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },

  expiry: {
    type: DataTypes.STRING,
    allowNull: false
  },

  holder: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.hasMany(Card, { foreignKey: "userId" });
Card.belongsTo(User, { foreignKey: "userId" });
