import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://underground-server.onrender.com";

export const socket = io(SOCKET_URL, { autoConnect: true });

export const joinRealtimeRooms = () => {
  const token = localStorage.getItem("token");
  if (token) {
    socket.emit("joinRooms", token);
  }
};

socket.on("connect", joinRealtimeRooms);
