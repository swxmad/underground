import React from "react";
import styles from "./DeleteConfirm.module.css";

const DeleteConfirm = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.text}>Удалить это событие?</p>

        <div className={styles.buttons}>
          <button className={styles.confirm} onClick={onConfirm}>
            Да, удалить
          </button>
          <button className={styles.cancel} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
