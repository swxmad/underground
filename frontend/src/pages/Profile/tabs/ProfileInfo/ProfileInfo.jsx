import React, { useState } from "react";
import styles from "./ProfileInfo.module.css";
import EditProfileModal from "../../modals/EditProfileModal/EditProfileModal";
import ChangePasswordModal from "../../modals/ChangePasswordModal/ChangePasswordModal";
import DeleteAccountModal from "../../modals/DeleteAccountModal/DeleteAccountModal";

const ProfileInfo = ({ user }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [showPassword, setShowPassword] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className={styles.block}>
      <h2>Ваши данные</h2>
      <div className={styles.userInfo}>
        <p><strong>ФИО: </strong> {currentUser.fullname}</p>
        <p><strong>Телефон: </strong> {currentUser.phone}</p>
        <p><strong>Email: </strong> {currentUser.email}</p>
        <p><strong>Дата рождения: </strong> {currentUser.birthdate}</p>
      </div>

      <div className={styles.buttons}>
        <button className={styles.edit} onClick={() => setShowEdit(true)}>
          Редактировать данные
        </button>

        <button className={styles.edit} onClick={() => setShowPassword(true)}>
          Изменить пароль
        </button>

        <button className={styles.edit} onClick={() => setShowDelete(true)}>
          Удалить
        </button>

        <button className={styles.logout} onClick={handleLogout}>
          Выйти
        </button>
      </div>

      {showEdit && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => setCurrentUser(updated)}
        />
      )}

      {showPassword && (
        <ChangePasswordModal onClose={() => setShowPassword(false)} />
      )}

      {showDelete && (
        <DeleteAccountModal onClose={() => setShowDelete(false)} />
      )}
    </div>
  );
};

export default ProfileInfo;
