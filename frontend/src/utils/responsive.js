/** Возвращает calc(N * var(--r)) для адаптивных inline-стилей в JSX */
export const r = (n) => `calc(${n} * var(--r))`;
