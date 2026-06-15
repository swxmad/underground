import React, { useEffect, useState } from "react";
import styles from "./Chats.module.css";
import ChatListItem from "./ChatListItem/ChatListItem";
import ChatDialog from "./ChatDialog/ChatDialog";
import { socket } from "../../socket";

const API_URL = "https://underground-server.onrender.com/api";

const Chats = ({ onUnreadChange }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");

  const searchLower = search.trim().toLowerCase();
  const filteredChats = chats.filter(
    (chat) =>
      !searchLower || chat.otherName.toLowerCase().includes(searchLower)
  );

  // пересчёт количества чатов с непрочитанными
  const recalcUnreadChats = (list) => {
    if (!onUnreadChange) return;
    const count = list.filter(c => c.unread > 0).length;
    onUnreadChange(count);
  };

  // загрузка чатов
  const loadChats = async () => {
    const res = await fetch(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setChats(data);
    recalcUnreadChats(data);
  };

  useEffect(() => {
    loadChats();
  }, []);

  const markChatAsReadLocally = (chatId) => {
    setChats(prev => {
      const updated = prev.map(c =>
        c.id === chatId
          ? { ...c, unread: 0 }
          : c
      );
      recalcUnreadChats(updated);
      return updated;
    });
  };

  useEffect(() => {
    const handler = ({ chatId, message }) => {
      setChats(prev => {
        const updated = prev.map(c =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
                unread: c.id === activeChat?.id ? 0 : (c.unread || 0) + 1
              }
            : c
        );
        recalcUnreadChats(updated);
        return updated;
      });
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [activeChat]);

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h2>Чаты</h2>

        {user?.role === "admin" && (
          <input
            type="text"
            className={styles.search}
            placeholder="Поиск по ФИО..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {chats.length === 0 && (
          <p className={styles.empty}>Нет чатов</p>
        )}

        {chats.length > 0 && filteredChats.length === 0 && (
          <p className={styles.empty}>Ничего не найдено</p>
        )}

        {filteredChats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={activeChat?.id === chat.id}
            onClick={() => setActiveChat(chat)}
          />
        ))}
      </div>

      <div className={styles.dialog}>
        {activeChat ? (
          <ChatDialog
            chat={activeChat}
            user={user}
            onRead={() => markChatAsReadLocally(activeChat.id)}
          />
        ) : (
          <p className={styles.placeholder}></p>
        )}
      </div>
    </div>
  );
};

export default Chats;
