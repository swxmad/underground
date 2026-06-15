import React, { useEffect, useState } from "react";
import styles from "./BarMenu.module.css";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import WineCard from "../../components/Bar/WineCard/WineCard";
import CocktailCard from "../../components/Bar/CocktailCard/CocktailCard";
import DrinkCard from "../../components/Bar/DrinkCard/DrinkCard";

import AddBarItemModal from "../../components/Bar/AddBarItemModal/AddBarItemModal";
import EditBarItemModal from "../../components/Bar/EditBarItemModal/EditBarItemModal";

import { useCart } from "../../context/CartContext";

const API_URL = "https://underground-server.onrender.com/api";

const BarMenu = ({ unreadChats }) => {
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { cart, addToCart, decrease } = useCart();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const isAuthorized = !!user;

  const showBanner = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  // ⭐ ПРАВИЛЬНЫЙ ПОИСК В КОРЗИНЕ (itemId, а не id)
  const getCountInCart = (id) => {
    const item = cart.find((i) => i.itemId === id);
    return item ? item.count : 0;
  };

  const handleAddDrink = async (item) => {
    const ok = await addToCart(item);
    showBanner(ok ? "Добавлено в корзину" : "Не удалось добавить в корзину");
  };

  const handleDecreaseDrink = (id) => {
    const count = getCountInCart(id);
    decrease(id);

    if (count === 1) {
      showBanner("Удалено из корзины");
    }
  };

  // загрузка напитков
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/bar`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Ошибка загрузки бара", err);
      showBanner("Ошибка загрузки меню");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // остановить напиток
  const handleStop = async (id) => {
    try {
      await fetch(`${API_URL}/bar/${id}/stop`, { method: "PUT" });
      showBanner("Позиция остановлена");
      fetchItems();
    } catch (err) {
      console.error("Ошибка остановки", err);
      showBanner("Ошибка при остановке");
    }
  };

  // вернуть напиток
  const handleReturn = async (id) => {
    try {
      await fetch(`${API_URL}/bar/${id}/return`, { method: "PUT" });
      showBanner("Позиция возвращена");
      fetchItems();
    } catch (err) {
      console.error("Ошибка возврата", err);
      showBanner("Ошибка при возврате");
    }
  };

  // группы категорий
  const groups = [
    {
      title: "Алкоголь",
      categories: ["Вино"],
    },
    {
      title: "Коктейли",
      categories: ["Горячие коктейли", "Безалкогольные коктейли"],
    },
    {
      title: "Напитки",
      categories: ["Напитки"],
    }
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
                Добавить напиток
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
                          <p className={styles.empty}>Напитков пока нет</p>
                        )}

                        <div className={styles.itemsGrid}>
                          {categoryItems.map((item) => {
                            if (item.drinkType === "wine") {
                              return (
                                <WineCard
                                  key={item.id}
                                  item={item}
                                  role={role}
                                  onEdit={(item) => setEditItem(item)}
                                  onStop={handleStop}
                                  onReturn={handleReturn}
                                />
                              );
                            }

                            if (item.drinkType === "cocktail") {
                              return (
                                <CocktailCard
                                  key={item.id}
                                  item={item}
                                  role={role}
                                  onEdit={(item) => setEditItem(item)}
                                  onStop={handleStop}
                                  onReturn={handleReturn}
                                />
                              );
                            }

                            if (item.drinkType === "drink") {
                              const count = getCountInCart(item.id);

                              return (
                                <DrinkCard
                                  key={item.id}
                                  item={item}
                                  role={role}
                                  isAuthorized={isAuthorized}
                                  countInCart={count}
                                  onAdd={handleAddDrink}
                                  onDecrease={handleDecreaseDrink}
                                  onEdit={(item) => setEditItem(item)}
                                  onStop={handleStop}
                                  onReturn={handleReturn}
                                />
                              );
                            }

                            return null;
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
        <AddBarItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            showBanner("Напиток добавлен");
            fetchItems();
          }}
        />
      )}

      {editItem && (
        <EditBarItemModal
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

export default BarMenu;
