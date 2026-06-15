import React, { useEffect, useState } from "react";
import styles from "../../Admin/AdminOrders/AdminOrders.module.css";
import { useNotification } from "../../../components/Notifications/NotificationProvider";

const API_URL = "https://underground-server.onrender.com/api/courier/orders";

const CourierAvailable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const token = localStorage.getItem("token");

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setOrders(data);
    } catch {
      console.log("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const takeOrder = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/take`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("error", data.message || "Ошибка");
        return;
      }

      showNotification("success", "Заказ успешно взят!");
      loadOrders();
    } catch {
      showNotification("error", "Ошибка сервера");
    }
  };

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>Доступные заказы</h2>

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>Нет доступных заказов</p>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <h3>Заказ №{order.id}</h3>

              <span className={`${styles.status} ${styles.ready_for_courier}`}>
                Ожидает курьера
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
              <button onClick={() => takeOrder(order.id)}>
                Взять заказ
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default CourierAvailable;
