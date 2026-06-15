import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {

      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    strength: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price50: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    priceBottle: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drinkType: {
  type: DataTypes.STRING,
  allowNull: true,
},

    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "items",
  }
);
