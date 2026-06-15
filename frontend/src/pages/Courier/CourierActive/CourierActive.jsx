import React, { useEffect, useState } from "react";
import styles from "../../Admin/AdminOrders/AdminOrders.module.css";
import { useNotification } from "../../../components/Notifications/NotificationProvider";

const API_URL = "https://underground-server.onrender.com/api/courier/orders";

const CourierActive = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { showNotification } = useNotification();

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setOrders(data);
    } catch {
      showNotification("error", "Ошибка загрузки активных заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("error", data.message || "Ошибка");
        return;
      }

      showNotification("success", "Статус обновлён");
      loadOrders();
    } catch {
      showNotification("error", "Ошибка сервера");
    }
  };

  const statusLabel = (status) => {
    if (status === "accepted") return "Принят курьером";
    if (status === "on_way") return "В пути";
    return status;
  };

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>Активные заказы</h2>

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>У вас нет активных заказов</p>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <h3>Заказ №{order.id}</h3>

              <span className={`${styles.status} ${styles[order.status]}`}>
                {statusLabel(order.status)}
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

            <div className={styles.actions}>
              {order.status === "accepted" && (
                <button onClick={() => updateStatus(order.id, "on_way")}>
                  В пути
                </button>
              )}

              {order.status === "on_way" && (
                <button onClick={() => updateStatus(order.id, "delivered")}>
                  Доставлено
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default CourierActive;
