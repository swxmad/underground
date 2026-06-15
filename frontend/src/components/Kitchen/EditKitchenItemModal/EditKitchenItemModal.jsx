import React, { useState } from "react";
import styles from "./EditKitchenItemModal.module.css";

const EditKitchenItemModal = ({ item, onClose, onSuccess }) => {
  const [title, setTitle] = useState(item.title);
  const [ingredients, setIngredients] = useState(item.ingredients || "");
  const [price, setPrice] = useState(item.price);
  const [weight, setWeight] = useState(item.weight);
  const [category, setCategory] = useState(item.category);
  const [available, setAvailable] = useState(item.available);
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(item.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("price", price);
    formData.append("weight", weight);
    formData.append("category", category);
    formData.append("available", available);
    formData.append("isActive", isActive);
    if (image) formData.append("image", image);

    const res = await fetch(`https://underground-server.onrender.com/api/kitchen/${item.id}`, {
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
        <h2 className={styles.title}>Редактировать блюдо</h2>

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

export default EditKitchenItemModal;
