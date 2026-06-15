import { Booking } from "../models/Booking.js";
import { emitBookingUpdated } from "../utils/realtime.js";

// Получить бронирования на конкретную дату
export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params; // формат ДД.ММ.ГГГГ

    const bookings = await Booking.findAll({
      where: {
        date,
        status: "approved"   // ⭐ фильтруем только подтверждённые
      }
    });

    return res.json(bookings);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка загрузки бронирований" });
  }
};

// Получить заявки на подтверждение
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

// Обновить статус брони (подтвердить / отклонить)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved | rejected

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
