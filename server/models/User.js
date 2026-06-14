import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    birthdate: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true }
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM("user", "admin", "courier"),
      defaultValue: "user"
    },
    needsActivation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    activationToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: "users"
  }
);

