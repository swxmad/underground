import React, { useState, useEffect, useRef } from "react";

import styles from "./Booking.module.css";

import Header from "../../components/Header/Header";

import Footer from "../../components/Footer/Footer";

import { useNotification } from "../../components/Notifications/NotificationProvider";

import { r } from "../../utils/responsive";



const API_URL = "https://underground-server.onrender.com/api";



const Booking = ({ unreadChats }) => {

  const { showNotification } = useNotification();



  const user = JSON.parse(localStorage.getItem("user"));

  const token = localStorage.getItem("token");



  const isUser = user?.role === "user";
  const useViewportFill = !user || user?.role === "admin";

  const tablesAreaRef = useRef(null);
  const tablesContentRef = useRef(null);
  const [tablesLayout, setTablesLayout] = useState({
    scale: 1,
    naturalH: 0,
    naturalW: 0,
  });

  useEffect(() => {
    if (!useViewportFill) return;

    const updateScale = () => {
      const area = tablesAreaRef.current;
      const content = tablesContentRef.current;
      if (!area || !content) return;

      setTablesLayout({ scale: 1, naturalH: 0, naturalW: 0 });

      requestAnimationFrame(() => {
        const availableH = area.clientHeight;
        const availableW = area.clientWidth;
        const naturalH = content.offsetHeight;
        const naturalW = content.offsetWidth;
        if (!naturalH || !naturalW) return;

        const scale = Math.min(
          availableH / naturalH,
          availableW / naturalW
        );

        setTablesLayout({ scale, naturalH, naturalW });
      });
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    if (tablesAreaRef.current) observer.observe(tablesAreaRef.current);

    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [useViewportFill]);



  const [occupied, setOccupied] = useState([]);

  const [cards, setCards] = useState([]);



  const [form, setForm] = useState({

    name: "",

    date: "",

    table: "",

    guests: "",

    time: "",

    cardId: ""

  });



  const ZONE_LAYOUT = {

    bar: { top: 0, left: 250, width: 500, height: 400 },

    pesok: { top: 460, left: 0, width: 600, height: 500 },

    chill: { top: 460, left: 620, width: 380, height: 400 },

  };



  const tablesBar = [{ id: 1, top: 328, left: 456 }];



  const tablesPesok = [

    { id: 2, top: 979, left: 527 },

    { id: 4, top: 1014, left: 240 },

    { id: 5, top: 742, left: 240 },

    { id: 6, top: 775, left: 489 },

    { id: 7, top: 885, left: 677 },

    { id: 8, top: 1053, left: 677 },

    { id: 9, top: 980, left: 418 },

    { id: 14, top: 904, left: 223 },

  ];



  const tablesChill = [

    { id: 10, top: 870, left: 835 },

    { id: 11, top: 760, left: 835 },

    { id: 12, top: 747, left: 940 },

    { id: 13, top: 747, left: 1047 },

    { id: 15, top: 952, left: 1015 },

  ];



  useEffect(() => {

    if (!form.date || !form.time) return;



    fetch(`${API_URL}/bookings/occupied?date=${form.date}&time=${form.time}`, {

      headers: { Authorization: `Bearer ${token}` }

    })

      .then((res) => res.json())

      .then((data) => setOccupied(data))

      .catch(() => { });

  }, [form.date, form.time, token]);



  useEffect(() => {

    if (!isUser) return;



    fetch(`${API_URL}/cards`, {

      headers: { Authorization: `Bearer ${token}` }

    })

      .then((res) => res.json())

      .then((data) => setCards(data))

      .catch(() => { });

  }, [isUser, token]);



  const formatDate = (value) => {

    let cleaned = value.replace(/\D/g, "").slice(0, 8);

    let formatted = "";

    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);

    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);

    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);

    return formatted;

  };



  const formatTime = (value) => {

    let cleaned = value.replace(/\D/g, "").slice(0, 4);

    let formatted = "";

    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);

    if (cleaned.length >= 3) formatted += ":" + cleaned.slice(2, 4);

    return formatted;

  };



  const validate = () => {

    if (!/^[А-Яа-яЁё]{1,20}$/.test(form.name))

      return "Имя должно быть на русском, до 20 символов";



    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(form.date))

      return "Дата должна быть в формате ДД.ММ.ГГГГ";



    const [d, m, y] = form.date.split(".").map(Number);

    const selected = new Date(y, m - 1, d);

    const today = new Date();

    today.setHours(0, 0, 0, 0);



    if (selected < today) return "Дата не может быть в прошлом";



    if (!/^[0-9,\sи]{1,10}$/i.test(form.table))

      return "Столы должны быть в формате: 7, 11 или 7 и 11";



    if (!/^\d+$/.test(form.guests) || Number(form.guests) < 1)

      return "Количество гостей должно быть числом";



    if (form.time) {

      if (!/^\d{2}:\d{2}$/.test(form.time))

        return "Время должно быть в формате ЧЧ:ММ";



      const [hh, mm] = form.time.split(":").map(Number);

      if (hh > 23 || mm > 59) return "Введите реальное время";

    }



    if (!form.cardId) return "Выберите карту для оплаты";



    return null;

  };



  const handleChange = (e) => {

    const { name, value } = e.target;



    if (name === "date") {

      setForm({ ...form, date: formatDate(value) });

      return;

    }



    if (name === "time") {

      setForm({ ...form, time: formatTime(value) });

      return;

    }



    setForm({ ...form, [name]: value });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();



    const error = validate();

    if (error) {

      showNotification("error", error);

      return;

    }



    const res = await fetch(`${API_URL}/bookings`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`

      },

      body: JSON.stringify(form)

    });



    const data = await res.json();



    if (!res.ok) {

      showNotification("error", data.message || "Ошибка при бронировании");

      return;

    }



    showNotification("success", "Заявка на бронь отправлена");



    setForm({

      name: "",

      date: "",

      table: "",

      guests: "",

      time: "",

      cardId: ""

    });

  };



  const renderTable = (t, zone) => {

    const layout = ZONE_LAYOUT[zone];

    return (

    <div

      key={t.id}

      className={`${styles.table} ${occupied.includes(t.id) ? styles.busy : styles.free}`}

      style={{
        top: r(t.top - layout.top),
        left: r(t.left - layout.left),
      }}

      onClick={() => {

        if (occupied.includes(t.id)) return;

        setForm({ ...form, table: t.id.toString() });

      }}

    >

      {t.id}

    </div>

    );

  };



  return (

    <div className={`${styles.page} ${useViewportFill ? styles.pageFill : ""}`}>

      <Header unreadChats={unreadChats} />

      <main className={`${styles.main} ${useViewportFill ? styles.mainFill : ""}`}>

        <div className={`${styles.container} ${useViewportFill ? styles.containerFill : ""}`}>

          <div
            ref={tablesAreaRef}
            className={`${styles.tables} ${useViewportFill ? styles.tablesFill : ""}`}
          >
            <div
              className={useViewportFill ? styles.tablesScaleBox : undefined}
              style={
                useViewportFill && tablesLayout.naturalH
                  ? { height: tablesLayout.naturalH * tablesLayout.scale }
                  : undefined
              }
            >
              <div
                ref={tablesContentRef}
                className={useViewportFill ? styles.tablesScaler : undefined}
                style={
                  useViewportFill
                    ? {
                        transform: `scale(${tablesLayout.scale})`,
                        transformOrigin: "top center",
                      }
                    : undefined
                }
              >

            <div className={styles.bar}>

              {tablesBar.map((t) => renderTable(t, "bar"))}

            </div>



            <div className={styles.tableRow}>

              <div className={styles.zone}>

                <p className={styles.zoneTitle}>ПЕСОЧКА</p>

                <div className={styles.pesokImg}>

                  {tablesPesok.map((t) => renderTable(t, "pesok"))}

                </div>

              </div>



              <div className={styles.zone}>

                <p className={styles.zoneTitle}>ЧИЛЛАУТ</p>

                <div className={styles.chillImg}>

                  {tablesChill.map((t) => renderTable(t, "chill"))}

                </div>

              </div>

            </div>

            </div>
            </div>
          </div>



          <p className={`${styles.warning} ${useViewportFill ? styles.warningFill : ""}`}>

            <span className={styles.warningAccent}>ВНИМАНИЕ!</span><br />

            Если компания состоит из 7 и более человек, бронируются 2 стола.

          </p>



          {!isUser && (

            <div className={`${styles.authMessage} ${useViewportFill ? styles.authMessageFill : ""}`}>

              Чтобы забронировать столик, необходимо авторизоваться

            </div>

          )}



          {isUser && (

            <form className={styles.form} onSubmit={handleSubmit}>

              <div className={styles.block}>

                <p className={styles.blockTitle}>Данные брони</p>

                <div className={styles.inputs}>

                  <input type="text" name="name" placeholder="Имя*" value={form.name} onChange={handleChange} required />

                  <input type="text" name="date" placeholder="Дата* (дд.мм.гггг)" value={form.date} onChange={handleChange} required />

                  <input type="text" name="table" placeholder="Стол(-ы)*" value={form.table} onChange={handleChange} required />

                  <input type="number" name="guests" placeholder="Количество людей*" value={form.guests} onChange={handleChange} required />

                  <input type="text" name="time" placeholder="Время (чч:мм)" value={form.time} onChange={handleChange} />

                </div>

              </div>



              <div className={styles.block}>

                <p className={styles.blockTitle}>Оплата</p>

                <p className={styles.sum}>Сумма: 1500 руб.</p>

                <div className={styles.inputs}>

                  {cards.length > 0 ? (

                    <select name="cardId" value={form.cardId} onChange={handleChange} required>

                      <option value="">Выберите карту</option>

                      {cards.map((c) => (

                        <option key={c.id} value={c.id}>

                          •••• {c.cardNumber.slice(-4)} ({c.expiry})

                        </option>

                      ))}

                    </select>

                  ) : (

                    <p className={styles.noCards}>

                      У вас нет карт. Добавьте карту в личном кабинете.

                    </p>

                  )}

                </div>

              </div>



              <button type="submit" className={styles.submit}>

                Забронировать

              </button>

            </form>

          )}

        </div>

      </main>

      <Footer />

    </div>

  );

};



export default Booking;


