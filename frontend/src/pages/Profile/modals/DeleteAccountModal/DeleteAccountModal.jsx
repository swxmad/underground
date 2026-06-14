import React, { useState } from "react";
import styles from "../ChangePasswordModal/ChangePasswordModal.module.css";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";
import PasswordInput from "../../../../components/Password/PasswordInput";

const API_URL = "http://localhost:5000/api/auth";

const DeleteAccountModal = ({ onClose }) => {
  const { showNotification } = useNotification();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      showNotification("error", "Введите пароль");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    showNotification("success", "Аккаунт удалён");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Удаление аккаунта</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <PasswordInput
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />

          <div className={styles.buttons}>
            <button type="submit" className={styles.save}>Удалить</button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
