import React, { useState } from "react";
import styles from "./AddBarItemModal.module.css";

const AddBarItemModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("wine"); // wine | cocktail | drink

  // поля вина
  const [country, setCountry] = useState("");
  const [strength, setStrength] = useState("");
  const [price50, setPrice50] = useState("");
  const [priceBottle, setPriceBottle] = useState("");

  // поля коктейлей
  const [ingredients, setIngredients] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  // поля напитков
  const [drinkWeight, setDrinkWeight] = useState("");
  const [drinkPrice, setDrinkPrice] = useState("");

  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);
    formData.append("type", type);
    formData.append("category", category);
    formData.append("isActive", isActive);
    formData.append("image", image);

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

    const res = await fetch("https://underground-server.onrender.com/api/bar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Ошибка при добавлении напитка");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Добавить напиток</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* тип напитка */}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="wine">Вино</option>
            <option value="cocktail">Коктейль</option>
            <option value="drink">Напиток</option>
          </select>

          {/* общее поле */}
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* поля вина */}
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

          {/* поля коктейлей */}
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

          {/* поля напитков */}
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

          {/* категория */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>

            {/* вино */}
            <option value="Вино">Вино</option>

            {/* коктейли */}
            <option value="Горячие коктейли">Горячие коктейли</option>
            <option value="Безалкогольные коктейли">Безалкогольные коктейли</option>

            {/* напитки */}
            <option value="Напитки">Напитки</option>
          </select>

          {/* галочка isActive */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            Доступен для заказа
          </label>

          {/* фото */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
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

export default AddBarItemModal;
