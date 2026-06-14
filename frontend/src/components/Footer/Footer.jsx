import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

const MAP_EMBED_URL =
  "https://yandex.ru/map-widget/v1/?um=constructor%3Ab134c83e954a54e0ab2323b3d4af27bb758e2408a09566869cc0baecb4568185&source=constructor";

const MAP_LINK_URL =
  "https://yandex.ru/maps/?um=constructor%3Ab134c83e954a54e0ab2323b3d4af27bb758e2408a09566869cc0baecb4568185";

const Footer = () => {
  return (
    <div className={styles.container}>
    <footer className={styles.footer}>
      <div className={styles.mapWrapper}>
        <iframe
          src={MAP_EMBED_URL}
          title="Карта — Пушкинская 23"
          className={styles.map}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={MAP_LINK_URL}
          target="_blank"
          rel="noreferrer"
          className={styles.mapLink}
        >
          Открыть в Яндекс.Картах
        </a>
      </div>
      <div className={styles.info}>
        <Link to="/">
          <img src="/images/лого.jpg" alt="logo" className={styles.logo} />
        </Link>
        <div className={styles.vsee}>
          <p className={styles.dan}>97-33-23</p>
          <p className={styles.dan}>
            <span className={styles.hoursLabel}>Режим работы:</span><br />
            Вс–Чт: 16:00–02:00<br />
            Пт–Сб: 16:00–04:00
          </p>
          <p className={styles.dan}>Пушкинская 23</p>
        </div>
        <div className={styles.seti}>
          <a href="https://vk.com/orenrock_ru" target="_blank" rel="noreferrer">
            <img src="/images/вк.png" alt="vk" className={styles.ceti} />
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
