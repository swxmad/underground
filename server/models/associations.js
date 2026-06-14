import { User } from "./User.js";
import { Item } from "./Items.js";
import { CartItem } from "./CartItem.js";
import { Order } from "./Order.js";
import { Chat } from "./Chat.js";
import { Message } from "./Message.js";

// User ↔ CartItem
User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });

// Item ↔ CartItem
Item.hasMany(CartItem, { foreignKey: "itemId", onDelete: "CASCADE" });
CartItem.belongsTo(Item, { foreignKey: "itemId" });

// User (клиент) ↔ Order
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

// User (курьер) ↔ Order
User.hasMany(Order, { foreignKey: "courierId", as: "CourierOrders" });
Order.belongsTo(User, { foreignKey: "courierId", as: "Courier" });

// Chat ↔ Message
Chat.hasMany(Message, { foreignKey: "chatId", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

// Chat ↔ Users
Chat.belongsTo(User, { as: "Participant1", foreignKey: "participant1Id" });
Chat.belongsTo(User, { as: "Participant2", foreignKey: "participant2Id" });
