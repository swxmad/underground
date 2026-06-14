import React, { useEffect, useState, useRef } from "react";
import styles from "./ChatWidget.module.css";
import { socket } from "../../socket";

const API_URL = "http://localhost:5000/api";

const ChatWidget = ({ user }) => {
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef(null);

  // 1. Получаем chatId с админом
  const loadAdminChat = async () => {
    const res = await fetch(`${API_URL}/chats/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const id = Number(data.chatId);
    setChatId(id);
    return id;
  };

  // 2. Загружаем сообщения и считаем непрочитанные
  const loadMessages = async (id) => {
    const res = await fetch(`${API_URL}/chats/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setMessages(data);

    const unreadCount = data.filter(
      m => m.senderId !== user.id && !m.isRead
    ).length;

    setUnread(unreadCount);
  };

  // 3. Отправка сообщения
  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;

    await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    setText("");
  };

  // 4. Помечаем как прочитанные (только сервер + сокет)
  const markRead = async (id) => {
    if (!id) return;

    await fetch(`${API_URL}/chats/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    socket.emit("readMessages", {
      chatId: id,
      readerId: user.id
    });
  };

  // 5. Автоскролл
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Первичная загрузка при заходе на страницу — чтобы был бейдж
  useEffect(() => {
    (async () => {
      try {
        const id = await loadAdminChat();
        if (id) {
          await loadMessages(id);
        }
      } catch (e) {
        console.error("Ошибка первичной загрузки чата:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 7. Слушаем новые сообщения
  useEffect(() => {
    const handler = ({ chatId: incomingId, message }) => {
      if (Number(incomingId) !== Number(chatId)) return;

      setMessages(prev => [...prev, message]);

      // если чат закрыт — увеличиваем счётчик
      if (!open) {
        setUnread(prev => prev + 1);
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [chatId, open]);

  // 8. Слушаем прочтение админом
  useEffect(() => {
    const handler = ({ chatId: incomingId, readerId }) => {
      if (Number(incomingId) === Number(chatId) && readerId !== user.id) {
        setMessages(prev =>
          prev.map(m => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on("messagesRead", handler);
    return () => socket.off("messagesRead", handler);
  }, [chatId, user.id]);

  // 9. Открытие чата
  const openChat = async () => {
    let id = chatId;

    // если по какой-то причине ещё не загружали — подстрахуемся
    if (!id) {
      id = await loadAdminChat();
      await loadMessages(id);
    }

    // подключаемся к комнате
    socket.emit("joinChat", id);

    // помечаем прочитанными на сервере
    await markRead(id);

    // локально обнуляем счётчик
    setUnread(0);

    setOpen(true);
  };

  return (
    <>
      {/* Кнопка чата с бейджем */}
      <div className={styles.button} onClick={openChat}>
        <img src="/images/mage_message-round.png" alt="" />
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
      </div>

      {/* Модалка */}
      {open && (
        <div className={styles.modal}>
          <div className={styles.window}>
            <div className={styles.header}>
              <span>Администратор</span>
              <button className={styles.exit} onClick={() => setOpen(false)}>✖</button>
            </div>

            <div className={styles.messages}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.senderId === user.id
                      ? styles.myMessage
                      : styles.theirMessage
                  }
                >
                  {msg.text}

                  {msg.senderId === user.id && (
                    <span className={styles.checks}>
                      {msg.isRead ? "✔✔" : "✔"}
                    </span>
                  )}
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>

            <div className={styles.inputArea}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите сообщение…"
              />
              <button onClick={sendMessage}>Отправить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
