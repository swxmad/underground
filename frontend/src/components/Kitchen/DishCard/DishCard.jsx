import React from "react";
import styles from "./DishCard.module.css";

const DishCard = ({
  item,
  role,
  onAddToCart,
  onEdit,
  onStop,
  onReturn,
  countInCart,
  onDecrease
}) => {
  const isGuest = !role;
  const isUser = role === "user";
  const isAdmin = role === "admin";

  const canAdd = isUser && item.isActive && item.available;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={`http://localhost:5000${item.image}`}
          className={styles.image}
          alt={item.title}
        />

        {(isUser || isAdmin) && !item.available && (
          <div className={styles.unavailable}>нет в наличии</div>
        )}
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      {item.ingredients && (
        <p className={styles.ingredients}>{item.ingredients}</p>
      )}

      <p className={styles.weight}>{item.weight}</p>
      <p className={styles.price}>{item.price} ₽</p>

      {isGuest && <div className={styles.guestNote}></div>}

      {isUser && canAdd && (
        <>
          {countInCart === 0 ? (
            <button className={styles.addBtn} onClick={() => onAddToCart(item)}>
              В корзину
            </button>
          ) : (
            <div className={styles.counter}>
              <button
                className={styles.counterBtn}
                onClick={() => onDecrease(item.id)} // ВАЖНО: item.id
              >
                −
              </button>

              <span className={styles.count}>{countInCart}</span>

              <button
                className={styles.counterBtn}
                onClick={() => onAddToCart(item)}
              >
                +
              </button>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <div className={styles.adminControls}>
          <button className={styles.adminBtn} onClick={() => onEdit(item)}>
            Редактировать
          </button>

          {item.isActive && (
            <button
              className={styles.adminBtn}
              onClick={() =>
                item.available ? onStop(item.id) : onReturn(item.id)
              }
            >
              {item.available ? "Стоп" : "Вернуть"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DishCard;
