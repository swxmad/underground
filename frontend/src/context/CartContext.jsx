import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const CartContext = createContext();

const API = "https://underground-server.onrender.com/api/cart";

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const loadCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCart([]);
      return;
    }

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data)) setCart(data);
    } catch (e) {
      console.error("Ошибка загрузки корзины:", e);
    }
  }, []);

  useEffect(() => {
    loadCart();

    const onAuthChange = () => loadCart();
    window.addEventListener("auth-changed", onAuthChange);
    window.addEventListener("storage", onAuthChange);

    return () => {
      window.removeEventListener("auth-changed", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [loadCart]);

  const addToCart = async (item) => {
    if (!getToken()) return false;

    try {
      const res = await fetch(`${API}/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId: item.id }),
      });
      if (!res.ok) return false;

      await loadCart();
      return true;
    } catch (e) {
      console.error("Ошибка добавления в корзину:", e);
      return false;
    }
  };

  const decrease = async (itemId) => {
    if (!getToken()) return false;

    try {
      const res = await fetch(`${API}/decrease`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) return false;

      await loadCart();
      return true;
    } catch (e) {
      console.error("Ошибка уменьшения количества:", e);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    const token = getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${API}/remove/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;

      await loadCart();
      return true;
    } catch (e) {
      console.error("Ошибка удаления из корзины:", e);
      return false;
    }
  };

  const clearCart = async () => {
    const token = getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${API}/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;

      await loadCart();
      return true;
    } catch (e) {
      console.error("Ошибка очистки корзины:", e);
      return false;
    }
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
