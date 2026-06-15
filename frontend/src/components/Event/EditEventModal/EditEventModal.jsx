import React, { useState, useEffect } from "react";
import styles from "./EditEventModal.module.css";

const EditEventModal = ({ event, onClose, onSuccess, onError }) => {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(event.time);
  const [image, setImage] = useState(null);

  const convertToISO = (str) => {
    const months = {
      января: "01",
      февраля: "02",
      марта: "03",
      апреля: "04",
      мая: "05",
      июня: "06",
      июля: "07",
      августа: "08",
      сентября: "09",
      октября: "10",
      ноября: "11",
      декабря: "12",
    };

    const [day, month] = str.split(" ");
    return `2026-${months[month]}-${day.padStart(2, "0")}`;
  };

  const formatDate = (iso) => {
    const months = [
      "января","февраля","марта","апреля","мая","июня",
      "июля","августа","сентября","октября","ноября","декабря"
    ];
    const [year, month, day] = iso.split("-");
    return `${Number(day)} ${months[Number(month) - 1]}`;
  };

  useEffect(() => {
    if (event.date.includes(" ")) {
      setDate(convertToISO(event.date));
    } else {
      setDate(event.date);
    }
  }, [event.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.length > 50) {
      onError("Название не должно превышать 50 символов");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      onError("Дата не может быть в прошлом");
      return;
    }

    const formattedDate = formatDate(date);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", formattedDate);
    formData.append("time", time);

    if (image) {
      formData.append("image", image);
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`https://underground-server.onrender.com/api/events/${event.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      onError("Ошибка при обновлении события");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Редактировать событие</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <input
            type="text"
            placeholder="Название (до 50 символов)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* ⭐ УБРАНА встроенная блокировка даты */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label className={styles.label}>Новая картинка (необязательно)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <div className={styles.buttons}>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
