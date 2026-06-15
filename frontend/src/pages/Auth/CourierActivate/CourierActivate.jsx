import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Register/Register.module.css";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import PasswordInput from "../../../components/Password/PasswordInput";

const API_URL = "https://underground-server.onrender.com/api/couriers";

const CourierActivate = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    email: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const res = await fetch(`${API_URL}/activate/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Ссылка недействительна");
          return;
        }

        setForm((prev) => ({ ...prev, email: data.email }));
      } catch {
        setMessage("Ошибка соединения с сервером");
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let cleaned = value.replace(/\D/g, "");
      if (!cleaned.startsWith("7")) cleaned = "7" + cleaned;
      if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

      let formatted = "+7";
      if (cleaned.length > 1) formatted += `(${cleaned.slice(1, 4)}`;
      if (cleaned.length >= 4) formatted += `) ${cleaned.slice(4, 7)}`;
      if (cleaned.length >= 7) formatted += `-${cleaned.slice(7, 9)}`;
      if (cleaned.length >= 9) formatted += `-${cleaned.slice(9, 11)}`;

      setForm({ ...form, phone: formatted });
      return;
    }

    if (name === "birthdate") {
      let cleaned = value.replace(/\D/g, "");
      if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

      let formatted = "";
      if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
      if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
      if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);

      setForm({ ...form, birthdate: formatted });
      return;
    }

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    setForm({ ...form, [name]: value });
  };

  const checkPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return "Слабый";
    if (score === 3) return "Средний";
    return "Сильный";
  };

  const validateAge = (birthdate) => {
    const [day, month, year] = birthdate.split(".").map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();

    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

    return age >= 18 && age <= 100;
  };

  const validateForm = () => {
    if (!/^[А-Яа-яЁё\s]{1,100}$/.test(form.fullname))
      return "ФИО должно содержать только русские буквы и быть не длиннее 100 символов";

    if (!/^\+7\(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(form.phone))
      return "Телефон должен быть в формате +7(XXX) XXX-XX-XX";

    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(form.birthdate))
      return "Дата рождения должна быть в формате ДД.ММ.ГГГГ";

    if (!validateAge(form.birthdate))
      return "Возраст должен быть от 18 до 100 лет";

    if (!/^[A-Za-z0-9!@#$%^&*()_\-=+{}[\]:;'"<>,.?/`~|\\]{8,20}$/.test(form.password))
      return "Пароль должен быть 8–20 символов, только английские буквы, цифры и символы";

    if (/[А-Яа-яЁё]/.test(form.password))
      return "Пароль не должен содержать русские буквы";

    if (form.password !== form.confirmPassword)
      return "Пароли не совпадают";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/activate/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: form.fullname,
          phone: form.phone,
          birthdate: form.birthdate,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Ошибка регистрации");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/courier");
    } catch {
      setMessage("Ошибка соединения с сервером");
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Регистрация курьера</h1>

          {loading ? (
            <p className={styles.message}>Загрузка...</p>
          ) : form.email ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                name="fullname"
                placeholder="ФИО"
                value={form.fullname}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                placeholder="+7(XXX) XXX-XX-XX"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <input
                name="email"
                placeholder="E-mail"
                value={form.email}
                readOnly
              />

              <input
                name="birthdate"
                placeholder="Дата рождения (ДД.ММ.ГГГГ)"
                value={form.birthdate}
                onChange={handleChange}
                required
              />

              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Пароль"
              />

              {form.password && (
                <p className={styles.strength}>
                  Надёжность пароля: {passwordStrength}
                </p>
              )}

              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
              />

              <button type="submit" className={styles.submit}>
                Зарегистрироваться
              </button>
            </form>
          ) : null}

          {message && <p className={styles.message}>{message}</p>}

          <p className={styles.redirect}>
            Уже есть аккаунт?{" "}
            <Link to="/login" className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourierActivate;
