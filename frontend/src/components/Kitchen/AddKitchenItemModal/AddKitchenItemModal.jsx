import React, { useState } from "react";
import styles from "./AddKitchenItemModal.module.css";

const AddKitchenItemModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("price", price);
    formData.append("weight", weight);
    formData.append("category", category);
    formData.append("image", image);
    formData.append("isActive", isActive);

    const res = await fetch("http://localhost:5000/api/kitchen", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Ошибка при добавлении блюда");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Добавить блюдо</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Состав"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />

          <input
            type="number"
            placeholder="Цена (₽)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Граммовка"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            <option value="Закуски">Закуски</option>
            <option value="Холодные закуски">Холодные закуски</option>
            <option value="Салаты">Салаты</option>
            <option value="Горячее">Горячее</option>
            <option value="Гарниры">Гарниры</option>
            <option value="Горячие сковородки">Горячие сковородки</option>
            <option value="Буррито">Буррито</option>
            <option value="Добавки к буррито">Добавки к буррито</option>
            <option value="Бургеры">Бургеры</option>
            <option value="Морепродукты">Морепродукты</option>
            <option value="Соусы">Соусы</option>
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

export default AddKitchenItemModal;
