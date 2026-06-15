import React, { useEffect, useState } from "react";
import styles from "../../Admin/AdminOrders/AdminOrders.module.css";
import { useNotification } from "../../../components/Notifications/NotificationProvider";

const API_URL = "https://underground-server.onrender.com/api/courier/orders";

const CourierHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { showNotification } = useNotification();

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setOrders(data);
    } catch {
      showNotification("error", "Ошибка загрузки истории");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>История</h2>

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>История пуста</p>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <h3>Заказ №{order.id}</h3>

              <span className={`${styles.status} ${styles.delivered}`}>
                Доставлен
              </span>

              <p className={styles.date}>
                {new Date(order.updatedAt).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>

            <p className={styles.userInfo}>
              Пользователь: <b>{order.User?.fullname || "Не найден"}</b>
            </p>

            <div className={styles.items}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <img
                    src={`http://localhost:5000${item.image}`}
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

            <p className={styles.userInfo}>
              <strong>Дата доставки:</strong>{" "}
              {new Date(order.updatedAt).toLocaleString("ru-RU")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default CourierHistory;
