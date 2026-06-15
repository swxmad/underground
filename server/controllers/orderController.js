import { Order } from "../models/Order.js";
import { Op } from "sequelize";
import { User } from "../models/User.js";
import {
  emitOrderCreated,
  emitOrderUpdated,
} from "../utils/realtime.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalPrice, address, utensils, payment } = req.body;

    console.log("ITEMS FROM FRONT:", items);

    const normalizedItems = items.map(i => {
      const product = i.Item || i.item;

      if (!product) {
        throw new Error("В позиции заказа отсутствует поле Item/item");
      }

      return {
        id: product.id,
        title: product.title,
        weight: product.weight,
        price: product.price,
        image: product.image,
        count: i.count
      };
    });

    const order = await Order.create({
      userId,
      items: normalizedItems,
      totalPrice,
      address,
      utensils,
      payment,
      status: "new",
    });

    emitOrderCreated(req.io, order);

    res.json({ message: "Заказ создан", order });
  } catch (err) {
    console.error("Ошибка создания заказа:", err);
    res.status(500).json({ message: "Ошибка создания заказа" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "items",
        "totalPrice",
        "address",
        "utensils",
        "payment",
        "status",
        "createdAt"
      ],
      include: [
        {
          model: User,
          as: "Courier",
          attributes: ["fullname"],
        }
      ]
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Ошибка загрузки заказов" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { date } = req.query;

    let where = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      where.createdAt = {
        [Op.between]: [start, end]
      };
    }

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["fullname"]
        },
        {
          model: User,
          as: "Courier",
          attributes: ["fullname"],
        }
      ]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка загрузки заказов" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["approved", "ready_for_courier"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Недопустимый статус для админа" });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Заказ не найден" });

    order.status = status;

    if (status === "ready_for_courier") {
      order.courierId = null;
    }

    await order.save();

    const fullOrder = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ["fullname"] },
        { model: User, as: "Courier", attributes: ["fullname"] },
      ],
    });

    emitOrderUpdated(req.io, fullOrder || order);

    res.json({ message: "Статус обновлён", order: fullOrder || order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
};
