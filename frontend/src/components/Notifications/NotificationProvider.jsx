import React, { createContext, useContext, useState } from "react";
import styles from "./Notifications.module.css";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (type, message) => {
    const id = Date.now();

    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <div className={styles.container}>
        {notifications.map((n) => (
          <div key={n.id} className={`${styles.notification} ${styles[n.type]}`}>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
