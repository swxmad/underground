import { Item } from "../models/Items.js";
import { saveImage } from "../services/imageStorage.js";

// получить все напитки
export const getBarItems = async (req, res) => {
  const items = await Item.findAll({
    where: { type: "bar" },
  });
  res.json(items);
};

// добавить напиток
export const addBarItem = async (req, res) => {
  try {
    const {
      title,
      type, // wine | cocktail | drink
      country,
      strength,
      price50,
      priceBottle,
      ingredients,
      weight,
      price,
      category,
      isActive,
    } = req.body;

    let image = null;
    if (req.file) {
      image = await saveImage(req.file, "bar");
    }

    if (!image) {
      return res.status(400).json({ message: "Изображение обязательно" });
    }

    const common = {
      title,
      type: "bar",
      drinkType: type,
      category,
      isActive: isActive === "true" || isActive === true,
      available: true,
      image,
    };

    let itemData;

    if (type === "wine") {
      itemData = {
        ...common,
        country,
        strength,
        price50,
        priceBottle,
        price: Number(priceBottle) || Number(price50) || 0,
      };
    } else if (type === "cocktail") {
      itemData = {
        ...common,
        ingredients,
        weight,
        price: Number(price) || 0,
      };
    } else {
      itemData = {
        ...common,
        weight,
        price: Number(price) || 0,
      };
    }

    const item = await Item.create(itemData);
    res.json(item);
  } catch (err) {
    console.error("Ошибка добавления напитка:", err);
    res.status(500).json({ message: "Ошибка при добавлении напитка" });
  }
};

// редактировать напиток
export const updateBarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      type, // wine | cocktail | drink
      country,
      strength,
      price50,
      priceBottle,
      ingredients,
      weight,
      price,
      category,
      isActive,
    } = req.body;

    const item = await Item.findOne({
      where: { id, type: "bar" },
    });

    if (!item) {
      return res.status(404).json({ message: "Напиток не найден" });
    }

    let image = item.image;
    if (req.file) {
      image = await saveImage(req.file, "bar");
    }

    const common = {
      title,
      category,
      isActive: isActive === "true" || isActive === true,
      image,
      drinkType: type,
    };

    let updateData;

    if (type === "wine") {
      updateData = {
        ...common,
        country,
        strength,
        price50,
        priceBottle,
        price: Number(priceBottle) || Number(price50) || item.price,
        ingredients: null,
        weight: null,
      };
    } else if (type === "cocktail") {
      updateData = {
        ...common,
        ingredients,
        weight,
        price: Number(price) || 0,
        country: null,
        strength: null,
        price50: null,
        priceBottle: null,
      };
    } else {
      updateData = {
        ...common,
        weight,
        price: Number(price) || 0,
        country: null,
        strength: null,
        price50: null,
        priceBottle: null,
        ingredients: null,
      };
    }

    await item.update(updateData);

    res.json({ message: "Изменения сохранены", item });
  } catch (err) {
    console.error("Ошибка обновления напитка:", err);
    res.status(500).json({ message: "Ошибка при обновлении напитка" });
  }
};

// остановить напиток
export const stopBarItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: false },
    { where: { id, type: "bar" } }
  );

  res.json({ message: "Позиция остановлена" });
};

// вернуть напиток
export const returnBarItem = async (req, res) => {
  const { id } = req.params;

  await Item.update(
    { available: true },
    { where: { id, type: "bar" } }
  );

  res.json({ message: "Позиция возвращена" });
};
