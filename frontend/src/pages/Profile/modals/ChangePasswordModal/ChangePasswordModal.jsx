import React, { useState } from "react";
import styles from "./ChangePasswordModal.module.css";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";
import PasswordInput from "../../../../components/Password/PasswordInput";

const API_URL = "https://underground-server.onrender.com/api/auth";

const ChangePasswordModal = ({ onClose }) => {
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [strength, setStrength] = useState("");

  // -----------------------------
  // Проверка силы пароля
  // -----------------------------
  const checkStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return "Слабый";
    if (score === 3) return "Средний";
    return "Сильный";
  };

  // -----------------------------
  // Валидация
  // -----------------------------
  const validateForm = () => {
    if (!form.oldPassword) return "Введите старый пароль";

    if (!/^[A-Za-z0-9!@#$%^&*()_\-=+{}[\]:;'"<>,.?/`~|\\]{8,20}$/.test(form.newPassword))
      return "Пароль должен быть 8–20 символов";

    if (/[А-Яа-яЁё]/.test(form.newPassword))
      return "Пароль не должен содержать русские буквы";

    if (form.newPassword !== form.confirmPassword)
      return "Пароли не совпадают";

    return null;
  };

  // -----------------------------
  // Обработка ввода
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "newPassword") {
      setStrength(checkStrength(value));
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

    const res = await fetch(`${API_URL}/change-password`, {
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

    showNotification("success", "Пароль успешно изменён");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Смена пароля</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <PasswordInput
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            placeholder="Старый пароль"
          />

          <PasswordInput
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Новый пароль"
          />

          {form.newPassword && (
            <p className={styles.strength}>
              Надёжность: {strength}
            </p>
          )}

          <PasswordInput
            name="confirmPassword"
            placeholder="Повторите новый пароль"
            value={form.confirmPassword}
            onChange={handleChange}
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

export default ChangePasswordModal;
