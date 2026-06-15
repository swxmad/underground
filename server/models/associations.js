import { User } from "./User.js";
import { Item } from "./Items.js";
import { CartItem } from "./CartItem.js";
import { Order } from "./Order.js";
import { Chat } from "./Chat.js";
import { Message } from "./Message.js";

User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });

Item.hasMany(CartItem, { foreignKey: "itemId", onDelete: "CASCADE" });
CartItem.belongsTo(Item, { foreignKey: "itemId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "courierId", as: "CourierOrders" });
Order.belongsTo(User, { foreignKey: "courierId", as: "Courier" });

Chat.hasMany(Message, { foreignKey: "chatId", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

Chat.belongsTo(User, { as: "Participant1", foreignKey: "participant1Id" });
Chat.belongsTo(User, { as: "Participant2", foreignKey: "participant2Id" });
