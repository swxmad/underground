import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import BarMenu from "./pages/BarMenu/BarMenu";
import KitchenMenu from "./pages/KitchenMenu/KitchenMenu";
import Booking from "./pages/Booking/Booking";
import Login from './pages/Auth/Login/Login';
import Register from "./pages/Auth/Register/Register";
import CourierActivate from "./pages/Auth/CourierActivate/CourierActivate";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/Profile/Profile";
import Cart from './pages/Cart/CartPage';
import CourierDashboard from "./pages/Courier/CourierDashboard";
import Chats from "./pages/Chats/Chats";

import { NotificationProvider } from "./components/Notifications/NotificationProvider";
import { CartProvider } from "./context/CartContext";

import ChatWidget from "./components/ChatWidget/ChatWidget";

import { socket } from "./socket";

const API_URL = "https://underground-server.onrender.com/api";

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [unreadChats, setUnreadChats] = useState(0);

  // Загружаем количество непрочитанных чатов
  const loadUnreadChats = async () => {
    if (!user || user.role !== "admin") return;

    const res = await fetch(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const count = data.filter(c => c.unread > 0).length;
    setUnreadChats(count);
  };

  // Загружаем при входе
  useEffect(() => {
    loadUnreadChats();
  }, []);

  // Обновляем при новых сообщениях
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const handler = () => loadUnreadChats();

    socket.on("newMessage", handler);
    socket.on("messagesRead", handler);

    return () => {
      socket.off("newMessage", handler);
      socket.off("messagesRead", handler);
    };
  }, []);

  return (
    <NotificationProvider>
      <CartProvider>
        <Router>

          {/* Чат-виджет для пользователя и курьера */}
          {user && (user.role === "user" || user.role === "courier") && (
            <ChatWidget user={user} />
          )}

          <Routes>
            {/* Главная страница сама рендерит HomeHeader */}
            <Route path="/" element={<Home unreadChats={unreadChats}/>} />

            {/* Все остальные страницы сами рендерят Header внутри себя */}
            <Route path="/bar" element={<BarMenu unreadChats={unreadChats} />} />
            <Route path="/kitchen" element={<KitchenMenu unreadChats={unreadChats} />} />
            <Route path="/booking" element={<Booking unreadChats={unreadChats} />} />
            <Route path="/login" element={<Login unreadChats={unreadChats} />} />
            <Route path="/register" element={<Register unreadChats={unreadChats} />} />
            <Route path="/courier/activate/:token" element={<CourierActivate />} />

            <Route
              path="/admin"
              element={
                <AdminDashboard
                  unreadChats={unreadChats}
                  onUnreadChange={setUnreadChats}
                />
              }
            />

            <Route path="/profile" element={<Profile unreadChats={unreadChats} />} />
            <Route path="/cart" element={<Cart unreadChats={unreadChats} />} />

            <Route
              path="/courier"
              element={<CourierDashboard unreadChats={unreadChats} />}
            />

            <Route
              path="/chats"
              element={<Chats onUnreadChange={setUnreadChats} />}
            />
          </Routes>

        </Router>
      </CartProvider>
    </NotificationProvider>
  );
};

export default App;
