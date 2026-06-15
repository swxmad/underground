import React, { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";

const API_URL = "https://underground-server.onrender.com/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const isAdmin = user?.role === "admin";

  // -----------------------------
  // Загрузка заказов
  // -----------------------------
  const fetchOrders = async () => {
    if (!isAdmin) return;

    setLoading(true);

    try {
      const url = selectedDate
        ? `${API_URL}/orders?date=${selectedDate}`
        : `${API_URL}/orders`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // сортировка по статусу
      const statusOrder = ["new", "approved", "accepted", "on_way", "delivered"];

      const sorted = [...data].sort((a, b) => {
        const statusSort =
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);

        if (statusSort !== 0) return statusSort;

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(sorted);
    } catch (err) {
      console.error("Ошибка загрузки заказов", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAdmin, token, selectedDate]);

  // -----------------------------
  // Обновление статуса
  // -----------------------------
  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      // локально обновляем
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Ошибка обновления статуса", err);
    }
  };

  if (!isAdmin) {
    return (
      <main className={styles.main}>
        <p className={styles.notAuth}>Доступ только для администратора</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>Заказы</h2>

      {/* ФИЛЬТР ПО ДАТЕ */}
      <div className={styles.filterBlock}>
        <label>Показать заказы за дату:</label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {selectedDate && (
          <button
            className={styles.clearBtn}
            onClick={() => setSelectedDate("")}
          >
            Сбросить
          </button>
        )}
      </div>

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>Заказов пока нет</p>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <h3>Заказ №{order.id}</h3>

              <span className={`${styles.status} ${styles[order.status]}`}>
                {order.status === "new" && "Новый"}
                {order.status === "approved" && "Готовится"}
                {order.status === "ready_for_courier" && "Ожидает курьера"}
                {order.status === "accepted" && "Принят курьером"}
                {order.status === "on_way" && "В пути"}
                {order.status === "delivered" && "Доставлен"}
              </span>

              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>

            <p className={styles.userInfo}>
              Пользователь: <b>{order.User?.fullname || "Не найден"}</b>
            </p>

            {/* ПОЗИЦИИ */}
            <div className={styles.items}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <img
                    src={`https://underground-server.onrender.com${item.image}`}
                    alt={item.title}
                  />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemWeight}>{item.weight}</p>
                  </div>
                  <p className={styles.itemCount}>× {item.count}</p>
                  <p className={styles.itemPrice}>{item.price} ₽</p>
                </div>
              ))}
            </div>

            <div className={styles.total}>
              <p>
                Итого: <span>{order.totalPrice}</span> ₽
              </p>
            </div>

            {/* АДРЕС */}
            <div className={styles.addressBlock}>
              <h4>Адрес доставки</h4>
              <p>
                {order.address.street}, дом {order.address.house}, кв.{" "}
                {order.address.flat}
              </p>
              <p>
                Этаж: {order.address.floor}, подъезд: {order.address.entrance}
              </p>
              <p>Домофон: {order.address.intercom}</p>
            </div>

            <div className={styles.utensils}>
              Приборы: {order.utensils}
            </div>

            {["accepted", "on_way", "delivered"].includes(order.status) && (
              <p className={styles.userInfo}>
                <strong>Курьер:</strong> {order.Courier?.fullname}
              </p>
            )}

            {/* КНОПКИ ДЛЯ АДМИНА */}
            <div className={styles.actions}>
              {order.status === "new" && (
                <button onClick={() => updateStatus(order.id, "approved")}>
                  Принять заказ
                </button>
              )}

              {order.status === "approved" && (
                <button onClick={() => updateStatus(order.id, "ready_for_courier")}>
                  Передать курьеру
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminOrders;
