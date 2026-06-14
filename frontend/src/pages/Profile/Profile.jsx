import React, { useState } from "react";
import styles from "./Profile.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProfileInfo from "./tabs/ProfileInfo/ProfileInfo";
import Orders from "./tabs/Orders/Orders";
import Cards from "./tabs/Cards/Cards";
import MyBookings from "./tabs/MyBookings/MyBookings";
import ChatWidget from "../../components/ChatWidget/ChatWidget";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tab, setTab] = useState("profile");

  if (!user) {
    return <p className={styles.notAuth}>Вы не авторизованы</p>;
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>Личный кабинет</h1>

        {/* Вкладки */}
        <div className={styles.tabs}>
          <button
            className={tab === "profile" ? styles.active : ""}
            onClick={() => setTab("profile")}
          >
            Профиль
          </button>

          <button
            className={tab === "reservations" ? styles.active : ""}
            onClick={() => setTab("reservations")}
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
            className={tab === "cards" ? styles.active : ""}
            onClick={() => setTab("cards")}
          >
            Карты
          </button>
        </div>

        {/* Контент вкладок */}
        <div className={styles.content}>
          {tab === "profile" && <ProfileInfo user={user} />}
          {tab === "reservations" && <MyBookings userId={user.id} />}
          {tab === "orders" && <Orders userId={user.id} />}
          {tab === "cards" && <Cards userId={user.id} />}
        </div>

        <ChatWidget user={user} />
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
