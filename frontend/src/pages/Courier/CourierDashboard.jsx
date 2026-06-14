import React, { useState } from "react";
import styles from "./CourierDashboard.module.css";

import CourierHeader from "./CourierHeader/CourierHeader";
import Footer from "../../components/Footer/Footer";

import CourierProfile from "./CourierProfile/CourierProfile";
import CourierAvailable from "./CourierAvailable/CourierAvailable";
import CourierActive from "./CourierActive/CourierActive";
import CourierHistory from "./CourierHistory/CourierHistory";

const CourierDashboard = () => {
  const courier = JSON.parse(localStorage.getItem("user"));
  const [tab, setTab] = useState("profile");

  if (!courier || courier.role !== "courier") {
    return <p className={styles.notAuth}>Доступ запрещён</p>;
  }

  return (
    <div className={styles.page}>
      <CourierHeader />

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
            className={tab === "available" ? styles.active : ""}
            onClick={() => setTab("available")}
          >
            Доступные заказы
          </button>

          <button
            className={tab === "active" ? styles.active : ""}
            onClick={() => setTab("active")}
          >
            Активные заказы
          </button>

          <button
            className={tab === "history" ? styles.active : ""}
            onClick={() => setTab("history")}
          >
            История
          </button>
        </div>

        {/* Контент вкладок */}
        <div className={styles.content}>
          {tab === "profile" && <CourierProfile courier={courier} />}
          {tab === "available" && <CourierAvailable courierId={courier.id} />}
          {tab === "active" && <CourierActive courierId={courier.id} />}
          {tab === "history" && <CourierHistory courierId={courier.id} />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourierDashboard;
