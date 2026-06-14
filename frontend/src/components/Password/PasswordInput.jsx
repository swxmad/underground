import React, { useState } from "react";
import styles from "./PasswordInput.module.css";

const PasswordInput = ({ value, onChange, placeholder, name }) => {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        required
      />

      <span
        className={styles.eye}
        onClick={() => setShow(!show)}
      >
        {show ? "👁️" : "👁️‍🗨️"}
      </span>
    </div>
  );
};

export default PasswordInput;
