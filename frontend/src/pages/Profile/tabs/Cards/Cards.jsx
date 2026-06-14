import React, { useEffect, useState } from "react";
import AddCardModal from "../../modals/AddCardModal/AddCardModal";
import { useNotification } from "../../../../components/Notifications/NotificationProvider";
import styles from "./Cards.module.css";

const API_URL = "http://localhost:5000/api/cards";

const ConfirmDeleteCardModal = ({ onClose, onConfirm }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.modalText}>Вы действительно хотите удалить карту?</p>

        <div className={styles.modalButtons}>
          <button className={styles.modalYes} onClick={onConfirm}>
            Да
          </button>
          <button className={styles.modalNo} onClick={onClose}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

const Cards = () => {
  const { showNotification } = useNotification();
  const [cards, setCards] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadCards = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setCards(data);
  };

  const handleDeleteCard = async (id) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message || "Ошибка удаления карты");
      setConfirmDelete(null);
      return;
    }

    showNotification("success", "Карта удалена");
    setConfirmDelete(null);
    loadCards();
  };

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <div>
      <h2>Мои карты</h2>

      <button className={styles.add} onClick={() => setShowAdd(true)}>
        Добавить карту
      </button>

      <div className={styles.cards}>
        {cards.map((c) => (
          <div key={c.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <p>•••• {c.cardNumber.slice(-4)}</p>
              <p>{c.expiry}</p>
            </div>
            <button
              className={styles.delete}
              onClick={() => setConfirmDelete(c.id)}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddCardModal
          onClose={() => setShowAdd(false)}
          onAdd={() => loadCards()}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteCardModal
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteCard(confirmDelete)}
        />
      )}
    </div>
  );
};

export default Cards;
