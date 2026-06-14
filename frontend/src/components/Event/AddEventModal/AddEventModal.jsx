import React, { useState } from "react";
import styles from "./AddEventModal.module.css";

const AddEventModal = ({ onClose, onSuccess, onError }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState(null);

  const formatDate = (iso) => {
    const months = [
      "января","февраля","марта","апреля","мая","июня",
      "июля","августа","сентября","октября","ноября","декабря"
    ];
    const [year, month, day] = iso.split("-");
    return `${Number(day)} ${months[Number(month) - 1]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.length > 50) {
      onError("Название не должно превышать 50 символов");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (isNaN(selected.getTime())) {
      onError("Некорректная дата");
      return;
    }

    if (selected < today) {
      onError("Дата не может быть в прошлом");
      return;
    }

    const formattedDate = formatDate(date);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", formattedDate);
    formData.append("time", time);
    formData.append("image", image);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      onError("Ошибка при добавлении события");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Добавить событие</h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

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

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <div className={styles.buttons}>
            <button type="submit">Добавить</button>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
