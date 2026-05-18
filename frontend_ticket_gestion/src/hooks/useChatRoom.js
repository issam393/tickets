import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:2300";

function normalizeMessage(message) {
  return {
    id: message.id,
    roomId: Number(message.roomId),
    senderId: Number(message.senderId),
    senderName: message.senderName,
    text: message.text,
    timestamp: message.timestamp,
  };
}

export default function useChatRoom(activeRoomId) {
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);
  const activeRoomRef = useRef(activeRoomId);
  const [messages, setMessages] = useState([]);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsSocketReady(true);
      setError("");
    });

    socket.on("disconnect", () => {
      setIsSocketReady(false);
    });

    socket.on("connect_error", (connectionError) => {
      setError(connectionError.message || "Socket connection failed.");
    });

    socket.on("receive_message", (payload) => {
      const normalized = normalizeMessage(payload);
      if (Number(activeRoomRef.current) !== normalized.roomId) return;

      setMessages((prev) => [...prev, normalized]);
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsSocketReady(false);
    };
  }, [token]);

  const joinRoom = useCallback((roomId) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        reject(new Error("Socket is not connected."));
        return;
      }

      socket.emit("join_room", { roomId }, (response) => {
        if (!response?.success) {
          reject(new Error(response?.error || "Could not join room."));
          return;
        }

        resolve(response);
      });
    });
  }, []);

  useEffect(() => {
    if (!activeRoomId) {
      return;
    }

    if (!isSocketReady) return;

    joinRoom(activeRoomId)
      .then((result) => {
        setError("");
        setMessages((result.history || []).map(normalizeMessage));
        setJoinedRoomId(Number(activeRoomId));
      })
      .catch((joinError) => {
        setMessages([]);
        setJoinedRoomId(null);
        setError(joinError.message);
      });
  }, [activeRoomId, isSocketReady, joinRoom]);

  const isJoining =
    Boolean(activeRoomId) &&
    isSocketReady &&
    Number(joinedRoomId) !== Number(activeRoomId);

  const sendMessage = useCallback(
    (messageText) => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !socket.connected) {
          reject(new Error("Socket is not connected."));
          return;
        }

        if (!activeRoomId) {
          reject(new Error("No active room selected."));
          return;
        }

        socket.emit("send_message", { roomId: activeRoomId, messageText }, (response) => {
          if (!response?.success) {
            reject(new Error(response?.error || "Message could not be sent."));
            return;
          }

          resolve(response.data);
        });
      });
    },
    [activeRoomId]
  );

  return {
    messages,
    sendMessage,
    isSocketReady,
    isJoining,
    joinedRoomId,
    error: token ? error : "Please login first.",
  };
}
