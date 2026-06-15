import React, { useState } from "react";
import styles from "./EditBarItemModal.module.css";

const EditBarItemModal = ({ item, onClose, onSuccess }) => {
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState(item.type);

  const [country, setCountry] = useState(item.country || "");
  const [strength, setStrength] = useState(item.strength || "");
  const [price50, setPrice50] = useState(item.price50 || "");
  const [priceBottle, setPriceBottle] = useState(item.priceBottle || "");

  const [ingredients, setIngredients] = useState(item.ingredients || "");
  const [weight, setWeight] = useState(item.weight || "");
  const [price, setPrice] = useState(item.price || "");

  const [drinkWeight, setDrinkWeight] = useState(item.weight || "");
  const [drinkPrice, setDrinkPrice] = useState(item.price || "");

  const [category, setCategory] = useState(item.category);
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(item.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);
    formData.append("type", type);
    formData.append("category", category);
    formData.append("isActive", isActive);

    if (image) {
      formData.append("image", image);
    }

    if (type === "wine") {
      formData.append("country", country);
      formData.append("strength", strength);
      formData.append("price50", price50);
      formData.append("priceBottle", priceBottle);
    }

    if (type === "cocktail") {
      formData.append("ingredients", ingredients);
      formData.append("weight", weight);
      formData.append("price", price);
    }

    if (type === "drink") {
      formData.append("weight", drinkWeight);
      formData.append("price", drinkPrice);
    }

    const res = await fetch(`https://underground-server.onrender.com/api/bar/${item.id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      alert("Ошибка при сохранении");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Редактировать напиток</h2>

        <form className={styles.form} onSubmit={handleSubmit}>

          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="wine">Вино</option>
            <option value="cocktail">Коктейль</option>
            <option value="drink">Напиток</option>
          </select>

          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {type === "wine" && (
            <>
              <input
                type="text"
                placeholder="Страна"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Крепость (%)"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Цена за 50 мл"
                value={price50}
                onChange={(e) => setPrice50(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Цена за бутылку"
                value={priceBottle}
                onChange={(e) => setPriceBottle(e.target.value)}
                required
              />
            </>
          )}

          {type === "cocktail" && (
            <>
              <textarea
                placeholder="Состав"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Граммовка"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Цена"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </>
          )}

          {type === "drink" && (
            <>
              <input
                type="text"
                placeholder="Граммовка"
                value={drinkWeight}
                onChange={(e) => setDrinkWeight(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Цена"
                value={drinkPrice}
                onChange={(e) => setDrinkPrice(e.target.value)}
                required
              />
            </>
          )}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Вино">Вино</option>
            <option value="Горячие коктейли">Горячие коктейли</option>
            <option value="Безалкогольные коктейли">Безалкогольные коктейли</option>
            <option value="Напитки">Напитки</option>
          </select>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            Доступен для заказа
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <div className={styles.buttons}>
            <button type="submit" className={styles.saveBtn}>
              Сохранить
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBarItemModal;
