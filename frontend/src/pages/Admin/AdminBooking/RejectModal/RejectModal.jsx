import React, { useState } from "react";
import styles from "./RejectModal.module.css";

const RejectModal = ({ bookingId, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.window}>
        <h3>Причина отказа</h3>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Укажите причину"
        />

        <div className={styles.buttons}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSubmit}>Отклонить</button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
