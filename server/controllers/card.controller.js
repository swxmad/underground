import { Card } from "../models/Card.js";

export const addCard = async (req, res) => {
  try {
    const { id } = req.user;
    const { cardNumber, expiry, holder, cvv } = req.body;

    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ message: "Некорректный CVV" });
    }

    const card = await Card.create({
      userId: id,
      cardNumber,
      expiry,
      holder
    });

    return res.json({ message: "Карта добавлена", card });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getCards = async (req, res) => {
  try {
    const { id } = req.user;
    const cards = await Card.findAll({ where: { userId: id } });
    return res.json(cards);
  } catch (e) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.user;
    const { cardId } = req.params;

    await Card.destroy({ where: { id: cardId, userId: id } });

    return res.json({ message: "Карта удалена" });
  } catch (e) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
