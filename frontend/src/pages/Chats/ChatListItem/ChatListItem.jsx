import React from "react";
import styles from "./ChatListItem.module.css";

const ChatListItem = ({ chat, active, onClick }) => {
  return (
    <div
      className={`${styles.item} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={styles.name}>{chat.otherName}</span>
      </div>

      <div className={styles.preview}>
        {chat.lastMessage || "Нет сообщений"}
      </div>

      <div className={styles.footer}>
        <span className={styles.time}>{chat.lastMessageTime}</span>

        {chat.unread > 0 && (
          <span className={styles.unread}>{chat.unread}</span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
