import { useEffect } from "react";
import { socket } from "../socket";

export const useRealtime = (events, handler) => {
  const eventKey = events.join(",");

  useEffect(() => {
    if (!events.length || !handler) return;

    events.forEach((event) => socket.on(event, handler));

    return () => {
      events.forEach((event) => socket.off(event, handler));
    };
  }, [eventKey, handler]);
};
