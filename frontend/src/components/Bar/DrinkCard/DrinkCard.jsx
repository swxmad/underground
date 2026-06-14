import React from "react";
import styles from "./DrinkCard.module.css";

const DrinkCard = ({
  item,              // теперь item = CartItem
  role,
  isAuthorized,
  countInCart,
  onAdd,
  onDecrease,
  onEdit,
  onStop,
  onReturn
}) => {

  // ⭐ Достаём данные товара из item.Item
  const data = item.Item || item; // fallback, если придёт чистый Item

  const canAddToCart = isAuthorized && data.isActive && data.available;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={`http://localhost:5000${data.image}`}
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

      {/* --- АДМИН --- */}
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
