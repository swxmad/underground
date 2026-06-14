import express from "express";
import { CartItem } from "../models/CartItem.js";
import { authMiddleware as auth } from "../middleware/authMiddleware.js";
import { Item } from "../models/Items.js";


const router = express.Router();

// получить корзину
router.get("/", auth, async (req, res) => {
  if (!req.user.id) {
    return res.json([]);
  }

  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [{ model: Item }]
  });

  res.json(items);
});


// добавить в корзину
router.post("/add", auth, async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const { itemId, count } = req.body;

  let item = await CartItem.findOne({
    where: { userId: req.user.id, itemId }
  });

  if (item) {
    item.count += 1;
    await item.save();
    return res.json(item);
  }

  item = await CartItem.create({
    userId: req.user.id,
    itemId,
    count: 1
  });

  res.json(item);
});

// уменьшить количество
router.put("/decrease", auth, async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const { itemId } = req.body;

  const item = await CartItem.findOne({
    where: { userId: req.user.id, itemId }
  });

  if (!item) return res.status(404).json({ message: "Не найдено" });

  if (item.count === 1) {
    await item.destroy();
    return res.json({ removed: true });
  }

  item.count -= 1;
  await item.save();
  res.json(item);
});

// удалить полностью
router.delete("/remove/:itemId", auth, async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  await CartItem.destroy({
    where: { userId: req.user.id, itemId: req.params.itemId }
  });

  res.json({ success: true });
});

// очистить корзину
router.delete("/clear", auth, async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  await CartItem.destroy({ where: { userId: req.user.id } });
  res.json({ success: true });
});

export default router;
