import React from "react";
import styles from "./CocktailCard.module.css";
import { getImageUrl } from "../../../utils/imageUrl";

const CocktailCard = ({ item, role, onAdd, onEdit, onStop, onReturn }) => {
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
      <p className={styles.ingredients}>{data.ingredients}</p>
      <p className={styles.weight}>{data.weight}</p>
      <p className={styles.price}>{data.price} ₽</p>

      {role !== "admin" && data.isActive && data.available && (
        <button className={styles.addBtn} onClick={() => onAdd(data)}>
          Добавить в корзину
        </button>
      )}

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

export default CocktailCard;
