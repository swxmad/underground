import React, { useState } from "react";
import styles from "../../AdminUsers/AdminUsers.module.css";
import PasswordInput from "../../../../components/Password/PasswordInput";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";

const CourierPassword = ({
  courier,
  newPassword,
  confirmPassword,
  adminPassword,
  setNewPassword,
  setConfirmPassword,
  setAdminPassword,
  onSubmit,
  onClose
}) => {
  const { showNotification } = useNotification();
  const [strength, setStrength] = useState("");

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

  const handleNewPassword = (value) => {
    setNewPassword(value);
    if (value.length > 0) {
      setStrength(checkStrength(value));
    } else {
      setStrength("");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{courier.fullname}</h3>

        <PasswordInput
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(e) => handleNewPassword(e.target.value)}
        />

        {newPassword.length > 0 && (
          <div className={styles.strength + " " + styles[strength]}>
            Надёжность: {strength}
          </div>
        )}

        <div className={styles.admin}>
          <PasswordInput
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <PasswordInput
            placeholder="Ваш пароль (админ)"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
        </div>

        <div className={styles.modalButtons}>
          <button className={styles.save} onClick={onSubmit}>
            Сохранить
          </button>
          <button className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourierPassword;
