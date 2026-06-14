import React, { useState } from "react";
import styles from "./AddCardModal.module.css";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";

const API_URL = "http://localhost:5000/api/cards";

const AddCardModal = ({ onClose, onAdd }) => {
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    holder: "",
    cvv: ""
  });

  const formatCardNumber = (value) => {
    let cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    let cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    return cleaned;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, "").slice(0, 3);
  };

  const validate = () => {
  if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(form.cardNumber))
    return "Введите корректный номер карты";

  if (!/^\d{2}\/\d{2}$/.test(form.expiry))
    return "Введите срок действия в формате MM/YY";

  const [mmStr, yyStr] = form.expiry.split("/");
  const mm = Number(mmStr);
  const yy = Number(yyStr);

  if (mm < 1 || mm > 12) return "Некорректный месяц";

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100; 

  if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
    return "Срок действия карты истёк";
  }

  if (!/^[A-Za-z\s]{3,30}$/.test(form.holder))
    return "Имя владельца должно быть латиницей";

  if (!/^\d{3}$/.test(form.cvv))
    return "CVV должен состоять из 3 цифр";

  return null;
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      setForm({ ...form, cardNumber: formatCardNumber(value) });
      return;
    }

    if (name === "expiry") {
      setForm({ ...form, expiry: formatExpiry(value) });
      return;
    }

    if (name === "cvv") {
      setForm({ ...form, cvv: formatCVV(value) });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      showNotification("error", error);
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(API_URL, {
      method: "POST",
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

    showNotification("success", "Карта добавлена");
    onAdd(data.card);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Добавить карту</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="cardNumber"
            placeholder="Номер карты"
            value={form.cardNumber}
            onChange={handleChange}
            required
          />

          <input
            name="expiry"
            placeholder="MM/YY"
            value={form.expiry}
            onChange={handleChange}
            required
          />

          <input
            name="cvv"
            placeholder="CVV"
            value={form.cvv}
            onChange={handleChange}
            required
          />

          <input
            name="holder"
            placeholder="Имя владельца (латиницей)"
            value={form.holder}
            onChange={handleChange}
            required
          />

          <div className={styles.buttons}>
            <button type="submit" className={styles.save}>Добавить</button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
