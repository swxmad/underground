import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import AdminProfile from "./AdminProfile/AdminProfile";
import AdminUsers from "./AdminUsers/AdminUsers";
import AdminBooking from "./AdminBooking/AdminBooking";
import AdminOrders from "./AdminOrders/AdminOrders";
import AdminCouriers from "./AdminCouriers/AdminCouriers";
import Chats from "../Chats/Chats";

const API_URL = "https://underground-server.onrender.com/api";

const AdminDashboard = () => {
  const [tab, setTab] = useState("profile");
  const [unreadChats, setUnreadChats] = useState(0);

  const token = localStorage.getItem("token");

  const loadUnreadChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const count = data.filter(c => c.unread > 0).length;
      setUnreadChats(count);
    } catch (e) {
      console.error("Ошибка загрузки чатов для счётчика:", e);
    }
  };

  useEffect(() => {
    loadUnreadChats();
  }, []);

  const handleUnreadChange = (count) => {
    setUnreadChats(count);
  };

  return (
    <div className={styles.page}>
      <Header unreadChats={unreadChats} />
      <main className={styles.main}>
        <h1 className={styles.title}>Личный кабинет</h1>
        <div className={styles.sidebar}>
          <button
            className={tab === "profile" ? styles.active : ""}
            onClick={() => setTab("profile")}
          >
            Профиль
          </button>
          <button
            className={tab === "users" ? styles.active : ""}
            onClick={() => setTab("users")}
          >
            Пользователи
          </button>
          <button
            className={tab === "bookings" ? styles.active : ""}
            onClick={() => setTab("bookings")}
          >
            Бронирования
          </button>
          <button
            className={tab === "orders" ? styles.active : ""}
            onClick={() => setTab("orders")}
          >
            Заказы
          </button>
          <button
            className={tab === "couriers" ? styles.active : ""}
            onClick={() => setTab("couriers")}
          >
            Курьеры
          </button>
          <button
            className={tab === "chats" ? styles.active : ""}
            onClick={() => setTab("chats")}
          >
            Чаты
            {unreadChats > 0 && (
              <span className={styles.badgeTab}>{unreadChats}</span>
            )}
          </button>
        </div>
        <div className={styles.content}>
          {tab === "profile" && <AdminProfile />}
          {tab === "users" && <AdminUsers />}
          {tab === "bookings" && <AdminBooking />}
          {tab === "orders" && <AdminOrders />}
          {tab === "couriers" && <AdminCouriers />}
          {tab === "chats" && (
            <Chats onUnreadChange={handleUnreadChange} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
