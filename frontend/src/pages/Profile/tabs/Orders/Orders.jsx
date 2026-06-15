import React, { useEffect, useState } from "react";
import styles from "./Orders.module.css";

const API_URL = "https://underground-server.onrender.com/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const isAuthorized = !!user;

  // -----------------------------
  //  АВТО-ОБНОВЛЕНИЕ ЗАКАЗОВ
  // -----------------------------
  useEffect(() => {
    if (!isAuthorized) return;

    let interval;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // сортировка: новые сверху
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders((prev) => {
          const prevJSON = JSON.stringify(prev);
          const newJSON = JSON.stringify(sorted);

          if (prevJSON !== newJSON) {
            const marked = sorted.map((o, i) => ({
              ...o,
              _updated: prev[i] && prev[i].status !== o.status,
            }));
            return marked;
          }

          return prev;
        });
      } catch (err) {
        console.error("Ошибка автообновления заказов", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [isAuthorized, token]);

  // -----------------------------
  //  ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН
  // -----------------------------
  if (!isAuthorized) {
    return (
      <main className={styles.main}>
        <p className={styles.notAuth}>Авторизуйтесь, чтобы увидеть заказы</p>
      </main>
    );
  }

  // -----------------------------
  //  РЕНДЕР
  // -----------------------------
  return (
    <main className={styles.main}>
      <h2>Мои заказы</h2>

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>У вас пока нет заказов</p>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div
            key={order.id}
            className={`${styles.orderCard} ${order._updated ? styles.updated : ""
              }`}
          >
            {/* Заголовок */}
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

            {/* Позиции */}
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

            {/* Итог */}
            <div className={styles.total}>
              <p>
                Итого: <span>{order.totalPrice}</span> ₽
              </p>
            </div>

            {/* Адрес */}
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

            {/* Приборы */}
            <div className={styles.utensils}>
              Приборы: {order.utensils}
            </div>

            {["accepted", "on_way", "delivered"].includes(order.status) && (
              <p className={styles.userInfo}>
                <strong>Курьер:</strong> {order.Courier?.fullname}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Orders;
