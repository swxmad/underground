import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const API = "https://underground-server.onrender.com/api/cart";
  const token = localStorage.getItem("token");

  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
  const loadCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) setCart(data);
    } catch (e) {
      console.error("Ошибка загрузки корзины:", e);
    }
  };
  useEffect(() => {
    loadCart();
  }, [token]);
  const addToCart = async (item) => {
    if (!token) return;

    await fetch(`${API}/add`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        itemId: item.id,
      }),
    });

    await loadCart();
  };
  const decrease = async (itemId) => {
    if (!token) return;

    await fetch(`${API}/decrease`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ itemId }),
    });

    await loadCart();
  };
  const removeFromCart = async (itemId) => {
    if (!token) return;

    await fetch(`${API}/remove/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await loadCart();
  };
  const clearCart = async () => {
    if (!token) return;

    await fetch(`${API}/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await loadCart();
  };
  const totalPrice = cart.reduce((sum, item) => {
    const data = item?.Item;

    if (!data || typeof data.price !== "number") {
      return sum;
    }
    return sum + data.price * item.count;
  }, 0);
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decrease,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
