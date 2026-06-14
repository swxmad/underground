import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Event = sequelize.define("Event", {
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});
