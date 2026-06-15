import { Item } from "../models/Items.js";
import { saveImage } from "../services/imageStorage.js";

export const getKitchenItems = async (req, res) => {
  const items = await Item.findAll({
    where: { type: "kitchen" }
  });
  res.json(items);
};

export const addKitchenItem = async (req, res) => {
  try {
    const { title, ingredients, price, weight, category, isActive } = req.body;

    let image = null;
    if (req.file) {
      image = await saveImage(req.file, "kitchen");
    }

    if (!image) {
      return res.status(400).json({ message: "Изображение обязательно" });
    }

    const item = await Item.create({
      title,
      ingredients,
      price: Number(price) || 0,
      weight,
      category,
      type: "kitchen",
      isActive: isActive === "true" || isActive === true,
      available: true,
      image,
    });

    res.json(item);
  } catch (err) {
    console.error("Ошибка добавления блюда:", err);
    res.status(500).json({ message: "Ошибка при добавлении блюда" });
  }
};

export const stopKitchenItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: false },
    { where: { id, type: "kitchen" } }
  );

  res.json({ message: "Позиция остановлена" });
};

export const returnKitchenItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: true },
    { where: { id, type: "kitchen" } }
  );

  res.json({ message: "Позиция возвращена" });
};

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
      image = await saveImage(req.file, "kitchen");
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
