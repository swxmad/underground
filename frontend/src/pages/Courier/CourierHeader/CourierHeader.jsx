import React, { useState } from "react";
import styles from "./CourierHeader.module.css";
import ThemeToggle from "../../../components/ThemeToggle/ThemeToggle";

const Header = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <header className={styles.header}>
      <div className={styles.container}>

        <div className={styles.verh}>
            <img src="/images/лого.jpg" alt="logo" className={styles.logo} />

          <div className={styles.n}>
            <img src="/images/название.png" alt="название" className={styles.naz} />
            <p className={styles.na}>Underground</p>
          </div>

          <div className={styles.navbar}>
            <ThemeToggle className={styles.themeToggle} />
            <div className={styles.menuWrap}>
            <div className={styles.burgerIcon} onClick={toggleMenu}>
              <span className={open ? styles.activeLine1 : ""}></span>
              <span className={open ? styles.activeLine2 : ""}></span>
              <span className={open ? styles.activeLine3 : ""}></span>
            </div>
            <ul className={`${styles.menu} ${open ? styles.menuActive : ""}`}>
              <li>97-33-23</li>

              <li><span className={styles.hoursLabel}>Режим работы:</span><br />
                Вс–Чт: 16:00–02:00<br />
                Пт–Сб: 16:00–04:00
              </li>

              <li>Пушкинская 23</li>
            </ul>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
