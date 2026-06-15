import React, { useState, useEffect } from "react";
import styles from "./Booking.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNotification } from "../../components/Notifications/NotificationProvider";

const API_URL = "https://underground-server.onrender.com/api";

const TABLE_ZONES = [
  { id: "bar", title: "Бар", tables: [1] },
  { id: "pesok", title: "Песочка", tables: [2, 4, 5, 6, 7, 8, 9, 14] },
  { id: "chill", title: "Чиллаут", tables: [10, 11, 12, 13, 15] },
];

const ALL_TABLES = TABLE_ZONES.flatMap((z) => z.tables);

const parseTables = (value) =>
  value
    .split(/[,и\s]+/)
    .map((n) => Number(n.trim()))
    .filter(Boolean);

const Booking = ({ unreadChats }) => {
  const { showNotification } = useNotification();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isUser = user?.role === "user";

  const [occupied, setOccupied] = useState([]);
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({
    name: "",
    date: "",
    table: "",
    guests: "",
    time: "",
    cardId: "",
  });

  const selectedTables = parseTables(form.table);

  useEffect(() => {
    if (!form.date || !form.time) {
      setOccupied([]);
      return;
    }

    fetch(`${API_URL}/bookings/occupied?date=${form.date}&time=${form.time}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setOccupied(data) : setOccupied([])))
      .catch(() => setOccupied([]));
  }, [form.date, form.time, token]);

  useEffect(() => {
    if (!isUser) return;

    fetch(`${API_URL}/cards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch(() => {});
  }, [isUser, token]);

  const formatDate = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);
    return formatted;
  };

  const formatTime = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
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

    const requested = parseTables(form.table);
    if (!requested.length || requested.some((t) => !ALL_TABLES.includes(t)))
      return "Выберите существующий стол из списка";

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

  const toggleTable = (id) => {
    if (occupied.includes(id)) return;

    const current = parseTables(form.table);
    const next = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id].sort((a, b) => a - b);

    setForm({ ...form, table: next.join(", ") });
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
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
      cardId: "",
    });
  };

  const hasDateTime = form.date.length === 10 && form.time.length === 5;
  const freeTables = ALL_TABLES.filter((t) => !occupied.includes(t));

  return (
    <div className={styles.page}>
      <Header unreadChats={unreadChats} />

      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hallSection}>
            <p className={styles.hallHint}>Схема зала — для ориентира</p>

            <div className={styles.hallMap}>
              <div className={styles.bar} aria-hidden="true" />

              <div className={styles.tableRow}>
                <div className={styles.zone}>
                  <p className={styles.zoneTitle}>ПЕСОЧКА</p>
                  <div className={styles.pesokImg} aria-hidden="true" />
                </div>

                <div className={styles.zone}>
                  <p className={styles.zoneTitle}>ЧИЛЛАУТ</p>
                  <div className={styles.chillImg} aria-hidden="true" />
                </div>
              </div>
            </div>
          </section>

          {isUser && (
            <section className={styles.tablePicker}>
              <p className={styles.tablePickerTitle}>Выбор стола</p>

              {!hasDateTime && (
                <p className={styles.tablePickerHint}>
                  Укажите дату и время в форме ниже — покажем, какие столы заняты
                </p>
              )}

              {hasDateTime && (
                <div className={styles.availabilitySummary}>
                  <span className={styles.availabilityDate}>
                    {form.date}, {form.time}
                  </span>
                  {occupied.length > 0 ? (
                    <span className={styles.occupiedBadge}>
                      Заняты: {occupied.sort((a, b) => a - b).join(", ")}
                    </span>
                  ) : (
                    <span className={styles.freeBadge}>Все столы свободны</span>
                  )}
                </div>
              )}

              <div className={styles.tablePickerLegend}>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendFree}`} />
                  Свободен
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendBusy}`} />
                  Занят
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendSelected}`} />
                  Выбран
                </span>
              </div>

              {TABLE_ZONES.map((zone) => (
                <div key={zone.id} className={styles.tableZone}>
                  <p className={styles.tableZoneTitle}>{zone.title}</p>
                  <div className={styles.tableChips}>
                    {zone.tables.map((id) => {
                      const isBusy = occupied.includes(id);
                      const isSelected = selectedTables.includes(id);

                      return (
                        <button
                          key={id}
                          type="button"
                          className={`${styles.tableChip} ${
                            isBusy
                              ? styles.tableChipBusy
                              : isSelected
                                ? styles.tableChipSelected
                                : styles.tableChipFree
                          }`}
                          disabled={isBusy}
                          onClick={() => toggleTable(id)}
                          title={
                            isBusy
                              ? `Стол ${id} занят на выбранное время`
                              : `Выбрать стол ${id}`
                          }
                        >
                          <span className={styles.tableChipNumber}>{id}</span>
                          {isBusy && (
                            <span className={styles.tableChipStatus}>занят</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {hasDateTime && freeTables.length > 0 && (
                <p className={styles.tablePickerFooter}>
                  Свободно: {freeTables.join(", ")}
                </p>
              )}
            </section>
          )}

          <p className={styles.warning}>
            <span className={styles.warningAccent}>ВНИМАНИЕ!</span>
            <br />
            Если компания состоит из 7 и более человек, бронируются 2 стола.
          </p>

          {!isUser && (
            <div className={styles.authMessage}>
              Чтобы забронировать столик, необходимо авторизоваться
            </div>
          )}

          {isUser && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.block}>
                <p className={styles.blockTitle}>Данные брони</p>
                <div className={styles.inputs}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Имя*"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="date"
                    placeholder="Дата* (дд.мм.гггг)"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="time"
                    placeholder="Время* (чч:мм)"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="table"
                    placeholder="Стол(-ы)* — выберите выше или введите"
                    value={form.table}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="number"
                    name="guests"
                    placeholder="Количество людей*"
                    value={form.guests}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.block}>
                <p className={styles.blockTitle}>Оплата</p>
                <p className={styles.sum}>Сумма: 1500 руб.</p>
                <div className={styles.inputs}>
                  {cards.length > 0 ? (
                    <select
                      name="cardId"
                      value={form.cardId}
                      onChange={handleChange}
                      required
                    >
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
