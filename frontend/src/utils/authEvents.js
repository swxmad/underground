export const notifyAuthChange = () => {
  window.dispatchEvent(new Event("auth-changed"));
};
