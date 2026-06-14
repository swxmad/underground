import React from "react";
import styles from "../../AdminUsers/AdminUsers.module.css";
import formStyles from "./CourierAdd.module.css";
import PasswordInput from "../../../../components/Password/PasswordInput";

const CourierAdd = ({
  mode,
  newCourier,
  setNewCourier,
  onClose,
  onSubmit,
  handlePhoneMask,
  handleBirthdateMask
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Добавить курьера</h3>

        <form onSubmit={onSubmit} className={formStyles.form}>
          {mode === "local" && (
            <>
              <input
                type="text"
                placeholder="ФИО"
                value={newCourier.fullname}
                onChange={(e) =>
                  setNewCourier({ ...newCourier, fullname: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Дата рождения (ДД.ММ.ГГГГ)"
                value={newCourier.birthdate}
                onChange={(e) =>
                  setNewCourier({
                    ...newCourier,
                    birthdate: handleBirthdateMask(e.target.value)
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="+7(XXX) XXX-XX-XX"
                value={newCourier.phone}
                onChange={(e) =>
                  setNewCourier({
                    ...newCourier,
                    phone: handlePhoneMask(e.target.value)
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={newCourier.email}
                onChange={(e) =>
                  setNewCourier({ ...newCourier, email: e.target.value })
                }
                required
              />

              <PasswordInput
                name="password"
                placeholder="Пароль"
                value={newCourier.password}
                onChange={(e) =>
                  setNewCourier({ ...newCourier, password: e.target.value })
                }
                required
              />
            </>
          )}

          {mode === "production" && (
            <input
              type="email"
              placeholder="Email"
              value={newCourier.email}
              onChange={(e) =>
                setNewCourier({ ...newCourier, email: e.target.value })
              }
              required
            />
          )}

          <div className={styles.modalButtons}>
            <button type="submit" className={styles.save}>
              {mode === "local" ? "Создать" : "Отправить приглашение"}
            </button>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourierAdd;
