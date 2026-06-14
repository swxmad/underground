import { Item } from "../models/Items.js";

// получить все напитки
export const getBarItems = async (req, res) => {
  const items = await Item.findAll({
    where: { type: "bar" }
  });
  res.json(items);
};

// добавить напиток
export const addBarItem = async (req, res) => {
  const {
    title,
    type,          // wine | cocktail | drink
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
    image = `/uploads/bar/${req.file.filename}`;
  }

  const item = await Item.create({
    title,
    type: "bar",          // тип товара (бар)
    drinkType: type,      // подтип напитка (wine | cocktail | drink)
    category,
    isActive: isActive === "true",
    available: true,
    image,

    // wine
    country: type === "wine" ? country : null,
    strength: type === "wine" ? strength : null,
    price50: type === "wine" ? price50 : null,
    priceBottle: type === "wine" ? priceBottle : null,

    // cocktail
    ingredients: type === "cocktail" ? ingredients : null,
    weight: type === "cocktail" ? weight : null,
    price: type === "cocktail" ? price : null,

    // drink
    weight: type === "drink" ? weight : null,
    price: type === "drink" ? price : null,
  });

  res.json(item);
};

// редактировать напиток
export const updateBarItem = async (req, res) => {
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
    where: { id, type: "bar" }
  });

  if (!item) {
    return res.status(404).json({ message: "Напиток не найден" });
  }

  let image = item.image;
  if (req.file) {
    image = `/uploads/bar/${req.file.filename}`;
  }

  await item.update({
    title,
    category,
    isActive: isActive === "true",
    image,

    drinkType: type, // wine | cocktail | drink

    // wine
    country: type === "wine" ? country : null,
    strength: type === "wine" ? strength : null,
    price50: type === "wine" ? price50 : null,
    priceBottle: type === "wine" ? priceBottle : null,

    // cocktail
    ingredients: type === "cocktail" ? ingredients : null,
    weight: type === "cocktail" ? weight : null,
    price: type === "cocktail" ? price : null,

    // drink
    weight: type === "drink" ? weight : null,
    price: type === "drink" ? price : null,
  });

  res.json({ message: "Изменения сохранены", item });
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
