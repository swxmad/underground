import React from "react";
import styles from "./DrinkCard.module.css";
import { getImageUrl } from "../../../utils/imageUrl";

const DrinkCard = ({
  item,
  role,
  isAuthorized,
  countInCart,
  onAdd,
  onDecrease,
  onEdit,
  onStop,
  onReturn
}) => {

  const data = item.Item || item;

  const canAddToCart = isAuthorized && data.isActive && data.available;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={getImageUrl(data.image)}
          className={styles.image}
          alt={data.title}
        />
        {(role === "user" || role === "admin") && !data.available && (
          <div className={styles.unavailable}>нет в наличии</div>
        )}
      </div>
      <h3 className={styles.title}>{data.title}</h3>
      <p className={styles.weight}>{data.weight}</p>
      <p className={styles.price}>{data.price} ₽</p>
      {role !== "admin" && canAddToCart && (
        <>
          {countInCart === 0 ? (
            <button className={styles.addBtn} onClick={() => onAdd(data)}>
              Добавить в корзину
            </button>
          ) : (
            <div className={styles.counter}>
              <button
                className={styles.counterBtn}
                onClick={() => onDecrease(data.id)}
              >
                −
              </button>
              <span className={styles.count}>{countInCart}</span>
              <button
                className={styles.counterBtn}
                onClick={() => onAdd(data)}
              >
                +
              </button>
            </div>
          )}
        </>
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

export default DrinkCard;
