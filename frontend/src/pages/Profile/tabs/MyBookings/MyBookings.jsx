import React, { useEffect, useState, useCallback } from "react";
import styles from "./MyBookings.module.css";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";
import { useRealtime } from "../../../../hooks/useRealtime";

const API_URL = "https://underground-server.onrender.com/api/bookings";

const MyBookings = () => {
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState([]);

  const loadBookings = useCallback(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch(() => showNotification("error", "Ошибка загрузки бронирований"));
  }, [showNotification]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useRealtime(["bookingCreated", "bookingUpdated"], loadBookings);

  const statusText = {
    pending: "На рассмотрении",
    approved: "Бронь подтверждена",
    rejected: "Отказано в брони"
  };

  const statusClass = {
    pending: styles.statusPending,
    approved: styles.statusApproved,
    rejected: styles.statusRejected,
  };

  return (
    <div className={styles.page}>
      <h2>Мои бронирования</h2>

      {bookings.length === 0 && (
        <p className={styles.empty}>У вас пока нет бронирований</p>
      )}

      <div className={styles.list}>
        {bookings.map((b) => (
          <div key={b.id} className={styles.card}>
            <p><b>Имя:</b> {b.name}</p>
            <p><b>Дата:</b> {b.date}</p>
            <p><b>Столы:</b> {b.table}</p>
            <p><b>Гостей:</b> {b.guests}</p>
            {b.time && <p><b>Время:</b> {b.time}</p>}

            <p className={`${styles.status} ${statusClass[b.status]}`}>
              {statusText[b.status]}
            </p>
            {b.status === "rejected" && b.rejectReason && (
              <p className={styles.rejectReason}>
                Причина отказа: {b.rejectReason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
