import React, { useState } from "react";
import styles from "./EditProfileModal.module.css";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";

const API_URL = "http://localhost:5000/api/auth";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const { showNotification } = useNotification(); // ✔ Хук внутри компонента

  const [form, setForm] = useState({
    fullname: user.fullname,
    phone: user.phone,
    email: user.email,
    birthdate: user.birthdate
  });

  // -----------------------------
  // Маска телефона
  // -----------------------------
  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, "");
    if (!cleaned.startsWith("7")) cleaned = "7" + cleaned;
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

    let formatted = "+7";
    if (cleaned.length > 1) formatted += `(${cleaned.slice(1, 4)}`;
    if (cleaned.length >= 4) formatted += `) ${cleaned.slice(4, 7)}`;
    if (cleaned.length >= 7) formatted += `-${cleaned.slice(7, 9)}`;
    if (cleaned.length >= 9) formatted += `-${cleaned.slice(9, 11)}`;

    return formatted;
  };

  // -----------------------------
  // Маска даты рождения
  // -----------------------------
  const formatBirthdate = (value) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    let formatted = "";
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);

    return formatted;
  };

  // -----------------------------
  // Проверка существования даты
  // -----------------------------
  const isValidDate = (dateStr) => {
    const [day, month, year] = dateStr.split(".").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // -----------------------------
  // Проверка возраста
  // -----------------------------
  const validateAge = (birthdate) => {
    const [day, month, year] = birthdate.split(".").map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();

    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

    return age >= 18 && age <= 100;
  };

  // -----------------------------
  // Полная валидация формы
  // -----------------------------
  const validateForm = () => {
    if (!/^[А-Яа-яЁё\s]{1,100}$/.test(form.fullname))
      return "ФИО должно содержать только русские буквы";

    if (!/^\+7\(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(form.phone))
      return "Телефон должен быть в формате +7(XXX) XXX-XX-XX";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Некорректный email";

    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(form.birthdate))
      return "Дата рождения должна быть в формате ДД.ММ.ГГГГ";

    if (!isValidDate(form.birthdate))
      return "Такой даты не существует";

    if (!validateAge(form.birthdate))
      return "Возраст должен быть от 18 до 100 лет";

    return null;
  };

  // -----------------------------
  // Обработка ввода
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setForm({ ...form, phone: formatPhone(value) });
      return;
    }

    if (name === "birthdate") {
      setForm({ ...form, birthdate: formatBirthdate(value) });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // -----------------------------
  // Отправка формы
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      showNotification("error", error);
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    showNotification("success", "Данные успешно обновлены");

    onSave(data.user);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Редактировать данные</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            placeholder="ФИО"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+7(XXX) XXX-XX-XX"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          <input
            name="birthdate"
            value={form.birthdate}
            onChange={handleChange}
            placeholder="Дата рождения (ДД.ММ.ГГГГ)"
            required
          />

          <div className={styles.buttons}>
            <button type="submit" className={styles.save}>Сохранить</button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
