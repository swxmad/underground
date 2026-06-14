import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./User.js";
import { Card } from "./Card.js";

export const Booking = sequelize.define("Booking", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },

    date: { type: DataTypes.STRING, allowNull: false },

    table: { type: DataTypes.STRING, allowNull: false },

    guests: { type: DataTypes.INTEGER, allowNull: false },

    time: { type: DataTypes.STRING, allowNull: true },

    status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
    },
    rejectReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

Card.hasMany(Booking, { foreignKey: "cardId" });
Booking.belongsTo(Card, { foreignKey: "cardId" });
