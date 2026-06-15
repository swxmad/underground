import { Booking } from "../models/Booking.js";
import { emitBookingUpdated } from "../utils/realtime.js";

export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const bookings = await Booking.findAll({
      where: {
        date,
        status: "approved"
      }
    });

    return res.json(bookings);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка загрузки бронирований" });
  }
};

export const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: "pending" }
    });

    return res.json(bookings);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка загрузки заявок" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Некорректный статус" });
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Бронь не найдена" });
    }

    await booking.update({ status });

    emitBookingUpdated(req.io, booking);

    return res.json({ message: "Статус обновлён", booking });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка обновления статуса" });
  }
};
