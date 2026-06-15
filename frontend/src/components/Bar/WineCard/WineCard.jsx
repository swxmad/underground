import React from "react";
import styles from "./WineCard.module.css";
import { getImageUrl } from "../../../utils/imageUrl";

const WineCard = ({ item, role, onAdd, onEdit, onStop, onReturn }) => {
  // ⭐ Достаём данные товара из item.Item (CartItem) или item (Item)
  const data = item.Item || item;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={getImageUrl(data.image)}
          className={styles.image}
          alt={data.title}
        />

        {!data.available && (
          <div className={styles.unavailable}>нет в наличии</div>
        )}
      </div>

      <h3 className={styles.title}>{data.title}</h3>

      <p className={styles.country}>{data.country}</p>
      <p className={styles.strength}>{data.strength}%</p>

      <p className={styles.price}>50 мл — {data.price50} ₽</p>
      <p className={styles.price}>Бутылка — {data.priceBottle} ₽</p>

      {/* пользователь */}
      {role !== "admin" && data.isActive && data.available && (
        <button className={styles.addBtn} onClick={() => onAdd(data)}>
          Добавить в корзину
        </button>
      )}

      {/* админ */}
      {role === "admin" && (
        <div className={styles.adminControls}>
          <button className={styles.adminBtn} onClick={() => onEdit(data)}>
            Редактировать
          </button>

          {data.isActive && (
            <button
              className={styles.adminBtn}
              onClick={() =>
                data.available ? onStop(data.id) : onReturn(data.id)
              }
            >
              {data.available ? "Стоп" : "Вернуть"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WineCard;
