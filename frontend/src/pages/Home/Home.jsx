import React, { useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import HomeHeader from "../../pages/Home/HomeHeader/HomeHeader";
import Footer from "../../components/Footer/Footer";
import AddEventModal from "../../components/Event/AddEventModal/AddEventModal";
import EditEventModal from "../../components/Event/EditEventModal/EditEventModal";
import DeleteConfirm from "../../components/Event/DeleteConfirm/DeleteConfirm";


const API_URL = "https://underground-server.onrender.com/api";

const Home = ({ unreadChats }) => {
  const aboutImagesRef = useRef([]);
  const [aboutIndex, setAboutIndex] = useState(0);
  const fadeRefs = useRef([]);

  // СОБЫТИЯ
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // загрузка событий
  const fetchEvents = async () => {
    const res = await fetch(`${API_URL}/events`);
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // удаление события
  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/events/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setMessage("Событие удалено");
    fetchEvents();
    setDeleteId(null);

    setTimeout(() => setMessage(""), 2000);
  };

  // ТВОИ АНИМАЦИИ
  useEffect(() => {
    const interval = setInterval(() => {
      setAboutIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    aboutImagesRef.current.forEach((img, i) => {
      if (img) img.style.opacity = i === aboutIndex ? "1" : "0";
    });
  }, [aboutIndex]);

  useEffect(() => {
    const handleFade = () => {
      fadeRefs.current.forEach((el) => {
        if (!el) return;
        const pos = el.getBoundingClientRect().top;
        const screen = window.innerHeight / 1.25;
        if (pos < screen) el.classList.add(styles.visible);
      });
    };

    window.addEventListener("scroll", handleFade);
    window.addEventListener("load", handleFade);

    return () => {
      window.removeEventListener("scroll", handleFade);
      window.removeEventListener("load", handleFade);
    };
  }, []);

  // -----------------------------
  // СЛАЙДЕР (оставляю как есть)
  // -----------------------------
  const mainSlideRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const thumbnailSliderRef = useRef(null);

  useEffect(() => {
    const images = [
      "/images/с1.png",
      "/images/с2.png",
      "/images/с3.png",
      "/images/с4.png",
      "/images/с5.png",
      "/images/с6.png",
      "/images/с7.png",
      "/images/с8.png",
      "/images/с9.png",
    ];

    const mainSlide = mainSlideRef.current;
    const prevBtn = prevBtnRef.current;
    const nextBtn = nextBtnRef.current;
    const thumbnailSlider = thumbnailSliderRef.current;

    let thumbnails = [];
    let currentIndex = 0;
    const thumbnailCount = 5;

    const initialImg = document.createElement("img");
    initialImg.src = images[currentIndex];
    initialImg.classList.add(styles.mainSlideImg);
    mainSlide.appendChild(initialImg);

    function initializeThumbnails() {
      thumbnailSlider.innerHTML = "";
      thumbnails = [];

      for (let i = 0; i < thumbnailCount; i++) {
        const imgIndex = (currentIndex + i) % images.length;

        const thumbnail = document.createElement("div");
        thumbnail.classList.add(styles.thumbnail);

        if (imgIndex === currentIndex) {
          thumbnail.classList.add(styles.activeThumb);
        }

        const img = document.createElement("img");
        img.src = images[imgIndex];
        img.dataset.index = imgIndex;

        thumbnail.appendChild(img);
        thumbnailSlider.appendChild(thumbnail);
        thumbnails.push(thumbnail);

        thumbnail.addEventListener("click", () => {
          const newIndex = parseInt(img.dataset.index);
          if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            updateSlider();
          }
        });
      }
    }

    function updateSlider() {
      const newImg = document.createElement("img");
      newImg.src = images[currentIndex];
      newImg.classList.add(styles.mainSlideImg);
      newImg.style.opacity = "0";

      mainSlide.appendChild(newImg);

      requestAnimationFrame(() => {
        newImg.style.opacity = "1";
      });

      const allImgs = mainSlide.querySelectorAll("img");
      allImgs.forEach((img) => {
        if (img !== newImg) {
          setTimeout(() => img.remove(), 600);
        }
      });

      initializeThumbnails();
    }

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateSlider();
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateSlider();
    });

    initializeThumbnails();
  }, []);

  return (
    <>
      <HomeHeader unreadChats={unreadChats} />

      <div className={styles.home}>

        {/* уведомление */}
        {message && <div className={styles.notification}>{message}</div>}

        {/* о кафе */}
        <section className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={styles.about}>
              <div className={styles.text}>
                <p className={styles.barTitle}>О кафе</p>
                <p className={styles.description}>
                  Рок-кафе Underground, который находится в городе Оренбург. Если ты в Оренбурге, то тебе крупно повезло, ведь ты можешь полностью окунуться в мир рок музыки, заказать вкусную еду, а так же насладиться ассортиментом  коктейлей и десертов.
                </p>
              </div>

              <div className={styles.imgContainer}>
                {[
                  "/images/photo_2025-09-13_18-06-10.jpg",
                  "/images/о баре.png",
                  "/images/photo_2025-09-13_18-06-07.jpg",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    ref={(el) => (aboutImagesRef.current[i] = el)}
                    className={styles.img}
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* вас ждут */}
        <section className={styles.waitingSection}>
          <div className={styles.container}>
            <p className={styles.barTitle}>Вас ждут...</p>

            <div className={styles.waitingCards}>
              {[
                ["муз.png", "Живая музыка"],
                ["караоке.png", "Рок-караоке"],
                ["квиз.png", "Квизы и мероприятия"],
                ["кухня.png", "Кухня"],
              ].map(([img, text], i) => (
                <div className={styles.card} key={i}>
                  <img src={`/images/${img}`} className={styles.cardImg} />
                  <p className={styles.cardText}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* слайдер */}
        <div className={styles.container}>
          <section className={styles.sliderContainer}>
            <div className={styles.mainSlide} ref={mainSlideRef}></div>

            <div className={styles.controls}>
              <button id="prevBtn" ref={prevBtnRef}>&lt;</button>
              <button id="nextBtn" ref={nextBtnRef}>&gt;</button>
            </div>

            <div className={styles.thumbnailContainer}>
              <div className={styles.thumbnailSlider} ref={thumbnailSliderRef}></div>
            </div>
          </section>
        </div>

        {/* на неделе */}
        <section className={styles.weekSection}>
          <div className={styles.container}>
            <p className={styles.barTitleNew}>На этой неделе</p>

            {/* кнопка только для админа */}
            {role === "admin" && (
              <button
                className={styles.addBtn}
                onClick={() => setShowAddModal(true)}
              >
                Добавить событие
              </button>
            )}

            <div className={styles.weekList}>
              {events.length === 0 && (
                <div className={styles.fakeEvent}>Событий пока нет</div>
              )}
              {events.map((ev) => (
                <div key={ev.id} className={styles.eventItem}>
                  <div className={styles.INfo}>
                    <img
                      src={`http://localhost:5000${ev.image}`}
                      className={styles.eventImg}
                    />
                    <p>{ev.date}<br />{ev.time}</p>
                    <hr className={styles.line} />
                  </div>
                  <div className={styles.titleRow}>
                    <h3>{ev.title}</h3>

                    {role === "admin" && (
                      <div className={styles.eventActions}>
                        <button onClick={() => setEditEvent(ev)}>Редактировать</button>
                        <button onClick={() => setDeleteId(ev.id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {showAddModal && (
            <AddEventModal
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setMessage("Событие добавлено");
                fetchEvents();
                setTimeout(() => setMessage(""), 2000);
              }}
              onError={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(""), 2000);
              }}
            />
          )}

          {editEvent && (
            <EditEventModal
              event={editEvent}
              onClose={() => setEditEvent(null)}
              onSuccess={() => {
                setMessage("Событие обновлено");
                fetchEvents();
                setTimeout(() => setMessage(""), 2000);
              }}
              onError={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(""), 2000);
              }}
            />
          )}

          {deleteId && (
            <DeleteConfirm
              onConfirm={handleDelete}
              onCancel={() => setDeleteId(null)}
            />
          )}

        </section>
      </div>

      <Footer />
    </>
  );
};

export default Home;
