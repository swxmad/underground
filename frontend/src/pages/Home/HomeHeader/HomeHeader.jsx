import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HomeHeader.module.css";
import ThemeToggle from "../../../components/ThemeToggle/ThemeToggle";

const HomeHeader = ({ unreadChats = 0 }) => {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.verh}>
          <Link to="/" onClick={() => setOpen(false)}>
            <img src="/images/лого.jpg" alt="logo" className={styles.logo} />
          </Link>

          <div className={styles.navbar}>
            <ThemeToggle className={styles.themeToggle} />
            <div className={styles.menuWrap}>
              <div className={styles.burgerIcon} onClick={toggleMenu}>
                <span className={open ? styles.activeLine1 : ""}></span>
                <span className={open ? styles.activeLine2 : ""}></span>
                <span className={open ? styles.activeLine3 : ""}></span>
              </div>

              <ul className={`${styles.menu} ${open ? styles.menuActive : ""}`}>
              {!role && (
                <li>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Войти
                  </Link>
                </li>
              )}

              {role === "user" && (
                <li>
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    Профиль
                  </Link>
                </li>
              )}

              {role === "admin" && (
                <li>
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    Профиль
                    {unreadChats > 0 && (
                      <span className={styles.badgeSmall}>{unreadChats}</span>
                    )}
                  </Link>
                </li>
              )}

              <li>
                <Link to="/booking" onClick={() => setOpen(false)}>
                  Бронь
                </Link>
              </li>

              <li>
                <Link to="/bar" onClick={() => setOpen(false)}>
                  Меню Бар
                </Link>
              </li>

              <li>
                <Link to="/kitchen" onClick={() => setOpen(false)}>
                  Меню Кухня
                </Link>
              </li>

              {role === "user" && (
                <li>
                  <Link to="/cart" onClick={() => setOpen(false)}>
                    Корзина
                  </Link>
                </li>
              )}

              <li>97-33-23</li>

              <li>
                <span className={styles.hoursLabel}>Режим работы:</span>
                <br />
                Вс–Чт: 16:00–02:00
                <br />
                Пт–Сб: 16:00–04:00
              </li>

              <li>Пушкинская 23</li>
            </ul>
            </div>
          </div>
        </div>

        <p className={styles.adres}>Оренбург, Пушкинская 23</p>
      </div>
    </header>
  );
};

export default HomeHeader;
