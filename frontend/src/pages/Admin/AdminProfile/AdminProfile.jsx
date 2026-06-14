import React, { useState, useEffect } from "react";
import { useNotification } from "../../../components/Notifications/NotificationProvider";
import ProfileInfo from "../../Profile/tabs/ProfileInfo/ProfileInfo";
import profileStyles from "../../Profile/tabs/ProfileInfo/ProfileInfo.module.css";

const API_URL = "http://localhost:5000/api/auth";

const AdminProfile = () => {
  const { showNotification } = useNotification();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAdmin(data))
      .catch(() => showNotification("error", "Ошибка загрузки профиля"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className={profileStyles.loading}>Загрузка...</p>;
  }

  if (!admin) {
    return null;
  }

  return <ProfileInfo user={admin} />;
};

export default AdminProfile;
