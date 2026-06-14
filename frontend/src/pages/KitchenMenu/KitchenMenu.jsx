import React, { useEffect, useState } from "react";
import styles from "./KitchenMenu.module.css";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import DishCard from "../../components/Kitchen/DishCard/DishCard";
import AddKitchenItemModal from "../../components/Kitchen/AddKitchenItemModal/AddKitchenItemModal";
import EditKitchenItemModal from "../../components/Kitchen/EditKitchenItemModal/EditKitchenItemModal";

import { useCart } from "../../context/CartContext";

const API_URL = "http://localhost:5000/api";

const KitchenMenu = ({ unreadChats }) => {
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // ⭐ корзина
  const { cart, addToCart, decrease } = useCart();

  const showBanner = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  // ⭐ правильный подсчёт количества в корзине
  const getCountInCart = (id) => {
    const item = cart.find((i) => i.itemId === id);
    return item ? item.count : 0;
  };

  // загрузка блюд
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/kitchen`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Ошибка загрузки блюд", err);
      showBanner("Ошибка загрузки меню");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // остановить позицию
  const handleStop = async (id) => {
    try {
      await fetch(`${API_URL}/kitchen/${id}/stop`, { method: "PUT" });
      showBanner("Позиция остановлена");
      fetchItems();
    } catch (err) {
      console.error("Ошибка остановки позиции", err);
      showBanner("Ошибка при остановке позиции");
    }
  };

  // вернуть позицию
  const handleReturn = async (id) => {
    try {
      await fetch(`${API_URL}/kitchen/${id}/return`, { method: "PUT" });
      showBanner("Позиция возвращена");
      fetchItems();
    } catch (err) {
      console.error("Ошибка возврата позиции", err);
      showBanner("Ошибка при возврате позиции");
    }
  };

  // ⭐ добавить в корзину
  const handleAddToCart = (item) => {
    addToCart({ ...item, type: "kitchen" });
    showBanner("Добавлено в корзину");
  };

  // ⭐ уменьшить количество
  const handleDecrease = (id) => {
    const before = getCountInCart(id);
    decrease(id);

    if (before === 1) {
      showBanner("Удалено из корзины");
    }
  };

  // группы категорий
  const groups = [
    { title: "Закуски", categories: ["Закуски", "Холодные закуски"] },
    {
      title: "Основные блюда",
      categories: ["Салаты", "Горячее", "Гарниры", "Горячие сковородки"],
    },
    { title: "Мексиканское", categories: ["Буррито", "Добавки к буррито"] },
    { title: "Бургеры", categories: ["Бургеры"] },
    { title: "Морепродукты", categories: ["Морепродукты"] },
    { title: "Соусы", categories: ["Соусы"] },
  ];

  const searchLower = search.trim().toLowerCase();

  const matchesSearch = (item) =>
    !searchLower || item.title.toLowerCase().includes(searchLower);

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      categories: !searchLower
        ? group.categories
        : group.categories.filter((cat) =>
            items.some((item) => item.category === cat && matchesSearch(item))
          ),
    }))
    .filter((group) => group.categories.length > 0);

  return (
    <>
    <div className={styles.page}>
      <Header unreadChats={unreadChats}/>

      {message && <div className={styles.authBanner}>{message}</div>}

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.adminRow}>
            <input
              type="text"
              className={styles.search}
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {role === "admin" && (
              <button
                className={styles.addBtn}
                onClick={() => setShowAddModal(true)}
              >
                Добавить позицию
              </button>
            )}
          </div>

          {filteredGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.title}</h2>

              {group.categories.map((cat, catIndex) => {
                const id = `${groupIndex}-${catIndex}`;
                const isOpen = openCategory === id;

                const categoryItems = items.filter(
                  (item) => item.category === cat && matchesSearch(item)
                );

                return (
                  <div key={id} className={styles.categoryBlock}>
                    <button
                      className={styles.categoryButton}
                      onClick={() => setOpenCategory(isOpen ? null : id)}
                    >
                      {cat}
                    </button>

                    {isOpen && (
                      <div className={styles.categoryContent}>
                        {categoryItems.length === 0 && (
                          <p className={styles.empty}>Блюд пока нет</p>
                        )}

                        <div className={styles.itemsGrid}>
                          {categoryItems.map((item) => {
                            const count = getCountInCart(item.id);

                            return (
                              <DishCard
                                key={item.id}
                                item={item}
                                role={role}
                                countInCart={count}
                                onAddToCart={handleAddToCart}
                                onDecrease={handleDecrease}
                                onStop={handleStop}
                                onReturn={handleReturn}
                                onEdit={(item) => setEditItem(item)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <p className={styles.notFound}>Ничего не найдено</p>
          )}
        </div>
      </main>

      <Footer />
    </div>

      {showAddModal && (
        <AddKitchenItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            showBanner("Позиция добавлена");
            fetchItems();
          }}
        />
      )}

      {editItem && (
        <EditKitchenItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            showBanner("Изменения сохранены");
            fetchItems();
          }}
        />
      )}

    </>
  );
};

export default KitchenMenu;
