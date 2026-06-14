import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import PasswordInput from "../../../components/Password/PasswordInput";

const API_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ← добавлено

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Ошибка входа");
        return;
      }

      // сохраняем токен и пользователя
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // перенаправление по роли
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "courier") {
        navigate("/courier");
      } else {
        navigate("/");
      }

    } catch (err) {
      setMessage("Ошибка соединения с сервером");
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Вход</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              required
            />
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Пароль"
            />


            <button type="submit" className={styles.submit}>
              Войти
            </button>
          </form>

          {message && <p className={styles.message}>{message}</p>}

          <p className={styles.redirect}>
            Нет аккаунта?{" "}
            <Link to="/register" className={styles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
