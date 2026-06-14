// server/src/models/index.js
import { sequelize } from "../config/db.js";

import { User } from "./User.js";
import { Item } from "./Item.js";
import { CartItem } from "./CartItem.js";
import { Order } from "./Order.js";
import { OrderItem } from "./OrderItem.js";

// просто экспортируем модели — без sync, без ассоциаций
export {
  sequelize,
  User,
  Item,
  CartItem,
  Order,
  OrderItem,
};
