// useSocket.js — real-time connection to backend
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

let socket = null;

export function useSocket(onNotification) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("notification", (data) => {
      callbackRef.current?.(data);
    });

    socket.on("stock-update", (data) => {
      callbackRef.current?.({ ...data, type: "stock" });
    });

    socket.on("low-stock-alert", (data) => {
      callbackRef.current?.({ ...data, type: "warning", icon: "⚠️" });
    });

    socket.on("out-of-stock", (data) => {
      callbackRef.current?.({ ...data, type: "danger", icon: "🚨" });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const emit = useCallback((event, data) => {
    socket?.emit(event, data);
  }, []);

  return { emit };
}

export function getSocket() { return socket; }
