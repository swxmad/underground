import React from "react";
import styles from "../../AdminUsers/AdminUsers.module.css";
import PasswordInput from "../../../../components/Password/PasswordInput";

const CourierDelete = ({
  courier,
  adminPassword,
  setAdminPassword,
  onDelete,
  onClose
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Удалить курьера: {courier.fullname}?</h3>

        <PasswordInput
          placeholder="Ваш пароль (админ)"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />

        <div className={styles.modalButtons}>
          <button className={styles.delete} onClick={onDelete}>
            Удалить
          </button>
          <button className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourierDelete;
