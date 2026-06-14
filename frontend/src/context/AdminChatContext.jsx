import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket";

const AdminChatContext = createContext();
export const useAdminChat = () => useContext(AdminChatContext);

const API_URL = "http://localhost:5000/api";

export const AdminChatProvider = ({ children }) => {
  const [unreadChats, setUnreadChats] = useState(0);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const loadUnread = async () => {
    if (!user || user.role !== "admin") return;

    const res = await fetch(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const chats = await res.json();

    const count = chats.filter(c => c.unread > 0).length;
    setUnreadChats(count);
  };

  useEffect(() => {
    if (user?.role !== "admin") return;

    loadUnread();

    socket.on("newMessage", loadUnread);
    socket.on("messagesRead", loadUnread);

    return () => {
      socket.off("newMessage", loadUnread);
      socket.off("messagesRead", loadUnread);
    };
  }, []);

  return (
    <AdminChatContext.Provider value={{ unreadChats, loadUnread }}>
      {children}
    </AdminChatContext.Provider>
  );
};
