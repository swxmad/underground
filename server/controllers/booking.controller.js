import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { sendMail } from "../services/emailService.js";
import {
  emitBookingCreated,
  emitBookingUpdated,
} from "../utils/realtime.js";

export const createBooking = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, date, table, guests, time, cardId } = req.body;

    const existing = await Booking.findAll({
      where: {
        date,
        time,
        status: "approved"
      }
    });

    const occupiedTables = existing.flatMap((b) =>
      b.table
        .split(/[,и\s]+/)
        .map((n) => Number(n))
        .filter(Boolean)
    );

    const requestedTables = table
      .split(/[,и\s]+/)
      .map((n) => Number(n))
      .filter(Boolean);

    const conflict = requestedTables.some((t) => occupiedTables.includes(t));

    if (conflict) {
      return res.status(400).json({
        message: "Данное время уже забронировано"
      });
    }

    const booking = await Booking.create({
      userId: id,
      name,
      date,
      table,
      guests,
      time,
      cardId,
      status: "pending"
    });

    emitBookingCreated(req.io, booking);

    return res.json({ message: "Бронь создана", booking });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { id } = req.user;
    const bookings = await Booking.findAll({ where: { userId: id } });
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Booking.update({ status }, { where: { id } });

    if (status === "approved") {
      const user = await User.findByPk(booking.userId);

      await sendMail(
        user.email,
        "Ваша бронь подтверждена",
        `Здравствуйте, ${user.fullname}!

Ваша бронь подтверждена.

Дата: ${booking.date}
Время: ${booking.time || "не указано"}
Стол(ы): ${booking.table}

Ждём вас в Underground!`
      );
    }

    return res.json({ message: "Статус обновлён" });
  } catch (e) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const rejectBooking = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Бронь не найдена" });
    }

    await booking.update({
      status: "rejected",
      rejectReason: reason || null,
    });

    emitBookingUpdated(req.io, booking);

    const user = await User.findByPk(booking.userId);

    await sendMail(
      user.email,
      "Бронь отклонена",
      `Здравствуйте, ${user.fullname}!

К сожалению, ваша бронь была отклонена.

Причина: ${reason || "не указана"}

Вы можете выбрать другое время или стол.`
    );

    res.json({ message: "Бронь отклонена", booking });
  } catch (err) {
    console.error("Ошибка отклонения брони:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getOccupiedTables = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Дата и время обязательны" });
    }

    const bookings = await Booking.findAll({
      where: {
        date,
        time,
        status: "approved"
      }
    });

    const occupied = bookings.flatMap((b) =>
      b.table
        .split(/[,и\s]+/)
        .map((n) => Number(n))
        .filter(Boolean)
    );

    return res.json(occupied);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
