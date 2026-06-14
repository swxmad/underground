import { Event } from "../models/Event.js";

export const getEvents = async (req, res) => {
  const events = await Event.findAll({ order: [["date", "ASC"]] });
  res.json(events);
};

export const createEvent = async (req, res) => {
  try {
    const { title, date, time } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Файл изображения обязателен" });
    }

    const event = await Event.create({
      title,
      date,
      time,
      image: "/uploads/" + req.file.filename,
    });

    res.json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, date, time } = req.body;

    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Событие не найдено" });

    event.title = title;
    event.date = date;
    event.time = time;

    if (req.file) {
      event.image = "/uploads/" + req.file.filename;
    }

    await event.save();

    res.json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Событие не найдено" });

    await event.destroy();
    res.json({ message: "Удалено" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
