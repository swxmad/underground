import React, { useEffect, useState, useCallback } from "react";
import styles from "./AdminBooking.module.css";
import { useNotification } from "../../../components/Notifications/NotificationProvider";
import RejectModal from "./RejectModal/RejectModal";
import { useRealtime } from "../../../hooks/useRealtime";

const API_URL = "https://underground-server.onrender.com/api/admin";

const AdminBookings = () => {

  const statusText = {
    pending: "На рассмотрении",
    approved: "Подтверждена",
    rejected: "Отказано"
  };

  const [rejectModal, setRejectModal] = useState(null);

  const { showNotification } = useNotification();

  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("ru-RU"); // ДД.ММ.ГГГГ
  });

  const [dayBookings, setDayBookings] = useState([]);
  const [pending, setPending] = useState([]);

  const formatDate = (d) => {
    return d.toLocaleDateString("ru-RU");
  };

  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split(".").map(Number);
    return new Date(yyyy, mm - 1, dd);
  };

  const changeDate = (direction) => {
    const current = parseDate(date);

    if (direction === "prev") {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }

    setDate(formatDate(current));
  };

  const loadDayBookings = () => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/bookings/date/${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setDayBookings(data))
      .catch(() => showNotification("error", "Ошибка загрузки бронирований"));
  };

  const loadPending = () => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/bookings/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setPending(data))
      .catch(() => showNotification("error", "Ошибка загрузки заявок"));
  };

  const refreshBookings = useCallback(() => {
    loadPending();
    loadDayBookings();
  }, [date]);

  useEffect(() => {
    loadDayBookings();
  }, [date]);

  useEffect(() => {
    loadPending();
  }, []);

  useRealtime(["bookingCreated", "bookingUpdated"], refreshBookings);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    showNotification("success", "Статус обновлён");

    // обновляем списки
    loadPending();
    loadDayBookings();
  };

  return (
    <div className={styles.page}>
      <h2>Бронирования</h2>

      {/* КАЛЕНДАРЬ */}
      <div className={styles.calendar}>
        <button onClick={() => changeDate("prev")} className={styles.arrow}>
          ←
        </button>

        <p className={styles.date}>{date}</p>

        <button onClick={() => changeDate("next")} className={styles.arrow}>
          →
        </button>
      </div>

      {/* БРОНИ НА ДАТУ */}
      <div className={styles.dayBookings}>

        {dayBookings.length === 0 && (
          <p className={styles.empty}>На эту дату нет бронирований</p>
        )}

        <div className={styles.cards}>
          {dayBookings.map((b) => (
            <div key={b.id} className={styles.card}>
              <p><b>{b.name}</b></p>
              <div className={styles.stat}>
                <p>Столы: {b.table}</p>
                {b.time && <p>Время: {b.time}</p>}
                <p>Гостей: {b.guests}</p>
                <p>Статус: {statusText[b.status]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ЗАЯВКИ НА ПОДТВЕРЖДЕНИЕ */}
      <div className={styles.pending}>
        <h3>Заявки на подтверждение</h3>

        {pending.length === 0 && (
          <p className={styles.empty}>Нет заявок</p>
        )}

        <div className={styles.cardss}>
          {pending.map((b) => (
            <div key={b.id} className={styles.card}>
              <p><b>{b.name}</b></p>
              <p>Дата: {b.date}</p>
              <p>Столы: {b.table}</p>
              {b.time && <p>Время: {b.time}</p>}
              <p>Гостей: {b.guests}</p>

              <div className={styles.buttons}>
                <button
                  className={styles.approve}
                  onClick={() => updateStatus(b.id, "approved")}
                >
                  Подтвердить
                </button>

                <button className={styles.reject} onClick={() => setRejectModal(b.id)}>
                  Отклонить
                </button>

                {rejectModal && (
                  <RejectModal
                    bookingId={rejectModal}
                    onClose={() => setRejectModal(null)}
                    onSuccess={() => {
                      loadPending();
                      loadDayBookings();
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
