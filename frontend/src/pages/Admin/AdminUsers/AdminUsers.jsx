import React, { useEffect, useState } from "react";
import styles from "./AdminUsers.module.css";
import { useNotification } from "../../../components/Notifications/NotificationProvider";
import PasswordInput from "../../../components/Password/PasswordInput";

const API_URL = "https://underground-server.onrender.com/api/admin";

const AdminUsers = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const searchLower = search.trim().toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      !searchLower || u.fullname.toLowerCase().includes(searchLower)
  );

  // Модалки
  const [passwordModal, setPasswordModal] = useState(null); // {id, fullname}
  const [deleteModal, setDeleteModal] = useState(null); // {id, fullname}

  // Поля смены пароля
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const load = () => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => showNotification("error", "Ошибка загрузки пользователей"));
  };

  useEffect(() => {
    load();
  }, []);

  // -----------------------------
  // Индикатор надёжности пароля
  // -----------------------------
  const passwordStrength = () => {
    if (newPassword.length < 4) return "Слабый";
    if (newPassword.length < 8) return "Средний";
    return "Сильный";
  };

  // -----------------------------
  // Смена пароля пользователю
  // -----------------------------
  const submitPasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showNotification("error", "Пароли не совпадают");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/users/${passwordModal.id}/password`, {
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

    showNotification("success", "Пароль обновлён");

    setPasswordModal(null);
    setNewPassword("");
    setConfirmPassword("");
    setAdminPassword("");
  };

  // -----------------------------
  // Удаление пользователя
  // -----------------------------
  const submitDelete = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/users/${deleteModal.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Admin-Password": adminPassword
      },
      body: JSON.stringify({ adminPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("error", data.message);
      return;
    }

    showNotification("success", "Пользователь удалён");

    setDeleteModal(null);
    setAdminPassword("");
    load();
  };

  return (
    <div className={styles.page}>
      <h2>Пользователи</h2>

      <input
        type="text"
        className={styles.search}
        placeholder="Поиск по ФИО..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {users.length > 0 && filteredUsers.length === 0 && (
        <p className={styles.empty}>Ничего не найдено</p>
      )}

      <div className={styles.list}>
        {filteredUsers.map((u) => (
          <div key={u.id} className={styles.card}>
            <div className={styles.name}>
              <p className={styles.fullname}>{u.fullname}</p>
              <p className={styles.fio}>Телефон: {u.phone}</p>
              <p className={styles.fio}>Email: {u.email}</p>
            </div>

            <div className={styles.buttons}>
              <button onClick={() => setPasswordModal(u)}>Сменить пароль</button>
              <button onClick={() => setDeleteModal(u)} className={styles.delete}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛКА СМЕНЫ ПАРОЛЯ */}
      {passwordModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>{passwordModal.fullname}</h3>

            <PasswordInput
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className={styles.strength + " " + styles[passwordStrength()]}>
              Надёжность: {passwordStrength()}
            </div>

            <div className={styles.admin}>
              <PasswordInput
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <PasswordInput
                placeholder="Ваш пароль (админ)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.save} onClick={submitPasswordChange}>
                Сохранить
              </button>
              <button className={styles.cancel} onClick={() => setPasswordModal(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА УДАЛЕНИЯ */}
      {deleteModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Удалить пользователя: {deleteModal.fullname}?</h3>

            <PasswordInput
              placeholder="Ваш пароль (админ)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            <div className={styles.modalButtons}>
              <button className={styles.delete} onClick={submitDelete}>
                Удалить
              </button>
              <button className={styles.cancel} onClick={() => setDeleteModal(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
