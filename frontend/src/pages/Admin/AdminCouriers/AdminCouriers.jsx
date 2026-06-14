import React, { useEffect, useState } from "react";
import styles from "./AdminCouriers.module.css";

import { useNotification } from "../../../components/Notifications/NotificationProvider";
import PasswordInput from "../../../components/Password/PasswordInput";

import CourierPassword from "./CourierPassword/CourierPassword";
import CourierDelete from "./CourierDelete/CourierDelete";
import CourierAdd from "./CourierAdd/CourierAdd";

const API_URL = "http://localhost:5000/api";

const AdminCouriers = () => {
  const { showNotification } = useNotification();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [couriers, setCouriers] = useState([]);
  const [mode, setMode] = useState("local");

  // модалки
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCourier, setSelectedCourier] = useState(null);

  // поля для модалки смены пароля
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [newCourier, setNewCourier] = useState({
    fullname: "",
    phone: "",
    birthdate: "",
    email: "",
    password: ""
  });

  // -----------------------------
  // Загрузка курьеров
  // -----------------------------
  const loadCouriers = () => {
    fetch(`${API_URL}/couriers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setCouriers(data))
      .catch(() => { });
  };

  useEffect(() => {
    if (isAdmin) loadCouriers();
  }, [isAdmin]);

  // -----------------------------
  // Добавление курьера
  // -----------------------------
  const handleAddCourier = async (e) => {
    e.preventDefault();

    const url =
      mode === "local"
        ? `${API_URL}/couriers/create`
        : `${API_URL}/couriers/invite`;

    const body =
      mode === "local"
        ? newCourier
        : { email: newCourier.email };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message || "Ошибка");
      return;
    }

    if (data.devMode && data.activationLink) {
      showNotification(
        "success",
        `Ссылка для курьера (скопируйте и отправьте вручную): ${data.activationLink}`
      );
    } else {
      showNotification(
        "success",
        data.message || (mode === "local" ? "Курьер добавлен" : "Приглашение отправлено на email")
      );
    }
    setShowAddModal(false);

    setNewCourier({
      fullname: "",
      phone: "",
      birthdate: "",
      email: "",
      password: ""
    });

    if (mode === "local") {
      loadCouriers();
    }
  };

  // -----------------------------
  // Маски
  // -----------------------------
  const handlePhoneMask = (value) => {
    let cleaned = value.replace(/\D/g, "");
    if (!cleaned.startsWith("7")) cleaned = "7" + cleaned;
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

    let formatted = "+7";
    if (cleaned.length > 1) formatted += `(${cleaned.slice(1, 4)}`;
    if (cleaned.length >= 4) formatted += `) ${cleaned.slice(4, 7)}`;
    if (cleaned.length >= 7) formatted += `-${cleaned.slice(7, 9)}`;
    if (cleaned.length >= 9) formatted += `-${cleaned.slice(9, 11)}`;

    return formatted;
  };

  const handleBirthdateMask = (value) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    let formatted = "";
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);

    return formatted;
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword || !adminPassword) {
      showNotification("error", "Заполните все поля");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("error", "Пароли не совпадают");
      return;
    }

    const res = await fetch(`${API_URL}/couriers/${selectedCourier.id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        newPassword,
        adminPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    showNotification("success", "Пароль изменён");

    // очищаем поля
    setNewPassword("");
    setConfirmPassword("");
    setAdminPassword("");

    setShowPassModal(false);
  };

  // -----------------------------
  // Удаление курьера
  // -----------------------------
  const deleteCourier = async (id) => {
    const res = await fetch(`${API_URL}/couriers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    showNotification("success", "Курьер удалён");
    loadCouriers();
  };

  if (!isAdmin) {
    return <p className={styles.notAuth}>Доступ запрещён</p>;
  }

  return (
    <div className={styles.page}>
      <h2>Курьеры</h2>

      <div className={styles.mode}>
        <p>Режим добавления:</p>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="local">Локальный (ручная регистрация)</option>
          <option value="production">Продакшен (приглашение по email)</option>
        </select>
      </div>

      <div className={styles.addRow}>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          Добавить курьера
        </button>
      </div>

      <div className={styles.list}>
        {couriers.map((c) => (
          <div key={c.id} className={styles.card}>
            <div className={styles.name}>
              <p className={styles.fullname}>{c.fullname}</p>
              <p className={styles.fio}>Телефон: {c.phone}</p>
              <p className={styles.fio}>Email: {c.email}</p>
            </div>

            <div className={styles.buttons}>
              <button
                onClick={() => {
                  setSelectedCourier(c);
                  setShowPassModal(true);
                }}
              >
                Сменить пароль
              </button>

              <button
                onClick={() => {
                  setSelectedCourier(c);
                  setShowDeleteModal(true);
                }}
                className={styles.delete}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка добавления */}
      {showAddModal && (
        <CourierAdd
          mode={mode}
          newCourier={newCourier}
          setNewCourier={setNewCourier}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCourier}
          handlePhoneMask={handlePhoneMask}
          handleBirthdateMask={handleBirthdateMask}
        />
      )}

      {/* Модалка смены пароля */}
      {showPassModal && selectedCourier && (
        <CourierPassword
          courier={selectedCourier}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          adminPassword={adminPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setAdminPassword={setAdminPassword}
          onSubmit={handlePasswordChange}
          onClose={() => setShowPassModal(false)}
        />
      )}

      {/* Модалка удаления */}
      {showDeleteModal && selectedCourier && (
        <CourierDelete
          courier={selectedCourier}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          onDelete={() => {
            deleteCourier(selectedCourier.id);
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCouriers;
