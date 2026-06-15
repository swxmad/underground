import React, { useState, useEffect } from "react";
import styles from "./CartPage.module.css";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { useCart } from "../../context/CartContext";
import { useNotification } from "../../components/Notifications/NotificationProvider";
import { getImageUrl } from "../../utils/imageUrl";

const API_URL = "https://underground-server.onrender.com/api";

const CartPage = () => {
  const { cart, addToCart, decrease, removeFromCart, clearCart, totalPrice } =
    useCart();
  const { showNotification } = useNotification();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [cards, setCards] = useState([]);

  const [address, setAddress] = useState({
    street: "",
    house: "",
    flat: "",
    floor: "",
    entrance: "",
    intercom: "",
  });

  const [utensils, setUtensils] = useState(1);
  const [selectedCard, setSelectedCard] = useState("");

  // -----------------------------
  // Загрузка карт пользователя
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/cards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch(() => { });
  }, [user, token]);

  // -----------------------------
  // Валидация
  // -----------------------------
  const validate = () => {
    if (!address.street.trim()) return "Введите улицу";
    if (!address.house.trim()) return "Введите дом";

    if (!selectedCard) return "Выберите карту для оплаты";

    return null;
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  // -----------------------------
  // Отправка заказа
  // -----------------------------
  const handleConfirmOrder = async () => {
    if (!cart.length) return;

    const error = validate();
    if (error) {
      showNotification("error", error);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          totalPrice,
          address,
          utensils,
          payment: {
            method: "card",
            cardId: selectedCard,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("error", data.message || "Ошибка оформления заказа");
        return;
      }

      showNotification("success", "Заказ успешно оформлен");
      clearCart();
    } catch (err) {
      console.error(err);
      showNotification("error", "Ошибка оформления заказа");
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={`${styles.container} ${styles.checkoutContainer}`}>
        {/* ЛЕВАЯ ЧАСТЬ — ТОВАРЫ */}
        <div className={styles.orderSummary}>
          <div id="order-items">
            {cart.map((item) => {
              const data = item.Item || item; // ⭐ универсально

              return (
                <div key={item.id} className={styles.card}>
                  <button
                    className={styles.removeItemBtn}
                    onClick={() => {
                      removeFromCart(item.itemId);
                      showNotification("success", "Позиция удалена");
                    }}
                  >
                    ×
                  </button>

                  <img
                    src={getImageUrl(data.image)}
                    alt={data.title}
                  />

                  <h3>{data.title}</h3>
                  <p>{data.weight}</p>
                  <p>{data.price} ₽</p>

                  <div className={styles.quantityControlsInline}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => {
                        const before = item.count;
                        decrease(item.itemId);
                        if (before === 1) {
                          showNotification("success", "Позиция удалена");
                        }
                      }}
                    >
                      −
                    </button>

                    <span className={styles.quantityDisplay}>{item.count}</span>

                    <button
                      className={styles.quantityBtn}
                      onClick={() => {
                        addToCart({ id: data.id });
                        showNotification("success", "Позиция добавлена");
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}

            {cart.length === 0 && (
              <p className={styles.emptyCart}>Корзина пуста</p>
            )}
          </div>

          <div className={styles.orderTotal}>
            <p>
              К оплате: <span>{totalPrice}</span> ₽
            </p>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ — ФОРМА */}
        <div className={styles.deliveryForm}>
          <div className={styles.formBlock}>
            <h3>Адрес доставки</h3>

            <input
              type="text"
              placeholder="Улица*"
              value={address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
            />
            <input
              type="text"
              placeholder="Дом*"
              value={address.house}
              onChange={(e) => handleAddressChange("house", e.target.value)}
            />
            <input
              type="text"
              placeholder="Квартира*"
              value={address.flat}
              onChange={(e) => handleAddressChange("flat", e.target.value)}
            />
            <input
              type="text"
              placeholder="Этаж*"
              value={address.floor}
              onChange={(e) => handleAddressChange("floor", e.target.value)}
            />
            <input
              type="text"
              placeholder="Подъезд*"
              value={address.entrance}
              onChange={(e) => handleAddressChange("entrance", e.target.value)}
            />
            <input
              type="text"
              placeholder="Домофон*"
              value={address.intercom}
              onChange={(e) => handleAddressChange("intercom", e.target.value)}
            />
          </div>

          <div className={styles.formBlock}>
            <h3>Количество приборов</h3>

            <div className={styles.utensilsControl}>
              <button
                type="button"
                onClick={() => setUtensils((u) => Math.max(1, u - 1))}
              >
                −
              </button>

              <span>{utensils}</span>

              <button type="button" onClick={() => setUtensils((u) => u + 1)}>
                +
              </button>
            </div>
          </div>

          <div className={styles.formBlock}>
            <h3>Оплата</h3>

            {cards.length > 0 ? (
              <select
                className={styles.cardSelect}
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                required
              >
                <option value="">Выберите карту</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    •••• {c.cardNumber.slice(-4)} ({c.expiry})
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.noCards}>
                У вас нет карт. Добавьте карту в личном кабинете.
              </p>
            )}
          </div>

          <button
            className={styles.btnConfirm}
            disabled={!cart.length}
            onClick={handleConfirmOrder}
          >
            Оформить заказ
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
