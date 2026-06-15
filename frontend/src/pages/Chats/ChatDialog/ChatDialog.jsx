import React, { useEffect, useState, useRef } from "react";
import styles from "./ChatDialog.module.css";
import { socket } from "../../../socket";

const API_URL = "https://underground-server.onrender.com/api";

const ChatDialog = ({ chat, user, onRead }) => {
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  const loadMessages = async () => {
    const res = await fetch(`${API_URL}/chats/${chat.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    await fetch(`${API_URL}/chats/${chat.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    setText("");
    loadMessages();
  };

  useEffect(() => {
    if (onRead) onRead();

    fetch(`${API_URL}/chats/${chat.id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    socket.emit("readMessages", {
      chatId: chat.id,
      readerId: user.id
    });

    loadMessages();
  }, [chat.id]);

  useEffect(() => {
    const handler = ({ chatId, readerId }) => {
      if (chatId === chat.id && readerId !== user.id) {
        setMessages(prev =>
          prev.map(m => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on("messagesRead", handler);
    return () => socket.off("messagesRead", handler);
  }, [chat.id]);

  return (
    <div className={styles.dialog}>
      <div className={styles.header}>
        <h3>{chat.otherName}</h3>
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
  );
};

export default ChatDialog;
