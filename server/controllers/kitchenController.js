import { Item } from "../models/Items.js";

// получить все блюда кухни
export const getKitchenItems = async (req, res) => {
  const items = await Item.findAll({
    where: { type: "kitchen" }
  });
  res.json(items);
};

// добавить блюдо кухни
export const addKitchenItem = async (req, res) => {
  const { title, ingredients, price, weight, category, isActive } = req.body;

  let image = null;
  if (req.file) {
    image = `/uploads/kitchen/${req.file.filename}`;
  }

  const item = await Item.create({
    title,
    ingredients,
    price,
    weight,
    category,
    type: "kitchen",
    isActive: isActive === "true",
    available: true,
    image,
  });

  res.json(item);
};

// остановить блюдо
export const stopKitchenItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: false },
    { where: { id, type: "kitchen" } }
  );

  res.json({ message: "Позиция остановлена" });
};

// вернуть блюдо
export const returnKitchenItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: true },
    { where: { id, type: "kitchen" } }
  );

  res.json({ message: "Позиция возвращена" });
};

// редактировать блюдо
export const updateKitchenItem = async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, price, weight, category, isActive } = req.body;

  try {
    const item = await Item.findOne({
      where: { id, type: "kitchen" }
    });

    if (!item) {
      return res.status(404).json({ message: "Блюдо не найдено" });
    }

    let image = item.image;
    if (req.file) {
      image = `/uploads/kitchen/${req.file.filename}`;
    }

    await item.update({
      title,
      ingredients,
      price,
      weight,
      category,
      isActive: isActive === "true",
      image,
    });

    res.json({ message: "Изменения сохранены", item });
  } catch (err) {
    console.error("Ошибка обновления блюда:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
