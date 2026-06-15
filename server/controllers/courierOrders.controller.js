import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { emitOrderUpdated } from "../utils/realtime.js";

// ------------------------------------------------------
// 1. Доступные заказы (которые никто не взял)
// ------------------------------------------------------
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "ready_for_courier", courierId: null },
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["fullname"] }]
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка загрузки заказов" });
  }
};

// ------------------------------------------------------
// 2. Курьер берет заказ
// ------------------------------------------------------
export const takeOrder = async (req, res) => {
  try {
    const courierId = req.user.id;
    const orderId = req.params.id;

    // 1. Находим заказ
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    if (order.courierId) {
      return res.status(400).json({ message: "Заказ уже взят другим курьером" });
    }

    if (order.status !== "ready_for_courier") {
      return res.status(400).json({ message: "Этот заказ недоступен" });
    }

    // 2. Курьер берет заказ
    order.courierId = courierId;
    order.status = "accepted";
    await order.save();

    // 3. Получаем заказ с пользователем
    const fullOrder = await Order.findByPk(orderId, {
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

    emitOrderUpdated(req.io, fullOrder);

    res.json({
      message: "Заказ успешно взят",
      order: fullOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при взятии заказа" });
  }
};

// ------------------------------------------------------
// 3. Активные заказы курьера
// ------------------------------------------------------
export const getActiveOrders = async (req, res) => {
  try {
    const courierId = req.user.id;

    const orders = await Order.findAll({
      where: {
        courierId,
        status: ["accepted", "on_way"]
      },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["fullname"]
        }
      ]
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка загрузки активных заказов" });
  }
};

// ------------------------------------------------------
// 4. Курьер обновляет статус заказа
// ------------------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const courierId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;

    const allowed = ["on_way", "delivered"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Недопустимый статус" });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    if (order.courierId !== courierId) {
      return res.status(403).json({ message: "Это не ваш заказ" });
    }

    order.status = status;
    await order.save();

    const fullOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ["fullname"] },
        { model: User, as: "Courier", attributes: ["fullname"] },
      ],
    });

    emitOrderUpdated(req.io, fullOrder || order);

    res.json({ message: "Статус обновлён", order: fullOrder || order });
  } catch (err) {
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
};

// ------------------------------------------------------
// 5. История заказов курьера
// ------------------------------------------------------
export const getHistory = async (req, res) => {
  try {
    const courierId = req.user.id;

    const orders = await Order.findAll({
      where: {
        courierId,
        status: "delivered"
      },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["fullname"]
        },
        {
          model: User,
          as: "Courier",
          attributes: ["fullname"]
        }
      ]
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка загрузки истории" });
  }
};
