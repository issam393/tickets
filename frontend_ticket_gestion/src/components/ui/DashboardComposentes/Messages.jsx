import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TiMessages } from "react-icons/ti";
import { MessageSquare, Search, Send, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import useChatRoom from "../../../hooks/useChatRoom";
import "./Messages.css";

import { API_ORIGIN } from "../../../lib/apiConfig";
const API_BASE = API_ORIGIN;

function formatTimestamp(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.service;
    return String(role).toUpperCase() === 'MANAGER' ? 'Manager' : role;
  } catch {
    return null;
  }
}

function getUserId() {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("userId");
  if (stored) return Number(stored);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.id || payload.userId);
  } catch {
    return null;
  }
}

function ConversationCard({ room, selected, onSelect }) {
  const unreadCount = selected ? 0 : Number(room.unread_count || 0);

  return (
    <button
      type="button"
      className={`conversation-card ${selected ? "conversation-card--selected" : ""} ${
        unreadCount > 0 ? "unread-conversation" : ""
      }`}
      onClick={() => onSelect(room.id)}
    >
      <div className="conversation-heading">
        <h3 className={`conversation-title ${unreadCount > 0 ? "unread-title" : ""}`}>{room.name}</h3>
        {unreadCount > 0 && (
          <span className="conversation-unread-badge" aria-label={`${unreadCount} unread messages`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      <div className="conversation-tag">
        <span className="tag tag--purple">{room.request_code}</span>
      </div>
      <div className="conversation-meta">
        <span>{room.issue_type}</span>
        <span>{formatTimestamp(room.last_message_time || room.createdAt)}</span>
      </div>
    </button>
  );
}

function ChatThread({ room, messages, onSend, currentUserId, isJoining, isReadOnly }) {
  const [inputText, setInputText] = useState("");
  const messagesAreaRef = useRef(null);

  useEffect(() => {
    if (isJoining) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      const list = messagesAreaRef.current;
      if (!list) return;

      list.scrollTo({
        top: list.scrollHeight,
        behavior: messages.length ? "smooth" : "auto",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isJoining, messages.length, room.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text || isReadOnly) return;

    try {
      await onSend(text);
      setInputText("");
    } catch (error) {
      toast.error(error.message || "Message could not be sent.");
    }
  };

  return (
    <div className="chat-thread">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-title">{room.name}</h2>
          <div className="chat-participants">
            <span>Ticket: {room.request_code}</span>
            <span className="chat-ticket-tag">{room.issue_level}</span>
          </div>
        </div>
      </div>

      <div className="messages-area" ref={messagesAreaRef}>
        {isJoining ? (
          <div className="empty-state">Joining room...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">No messages yet.</div>
        ) : (
          messages.map((message) => {
            const isMe = Number(message.senderId) === Number(currentUserId);
            return (
              <div
                key={message.id}
                className={`message-row ${isMe ? "message-row--me" : "message-row--other"}`}
              >
                <div className="message-bubble-wrapper">
                  {!isMe && <span className="message-sender">{message.senderName}</span>}
                  <div className={`message-bubble ${isMe ? "message-bubble--me" : "message-bubble--other"}`}>
                    {message.text}
                  </div>
                  <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isReadOnly && (
        <form className="message-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message…"
            className="message-input"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
          <button type="submit" className="send-btn" aria-label="Send">
            <Send size={16} />
          </button>
          <button
            type="button"
            className="latest-btn"
            aria-label="Scroll to latest message"
            onClick={() => {
              const list = messagesAreaRef.current;
              if (list) {
                list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
              }
            }}
          >
            <ChevronDown size={16} />
            Latest
          </button>
        </form>
      )}
    </div>
  );
}

export default function Messages() {
  const token = localStorage.getItem("token");
  const currentUserId = getUserId();
  const role = getUserRole();
  const isReadOnly = role === 'Manager';

  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  const { messages, sendMessage, isJoining, roomsRevision, error: socketError } = useChatRoom(selectedRoomId);

  const loadRooms = useCallback(async (showLoading = false) => {
      if (!token) {
        setRoomsError("Please login first.");
        return;
      }

      try {
        if (showLoading) setRoomsLoading(true);
        setRoomsError("");

        const response = await fetch(`${API_BASE}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load chat rooms.");
        }

        const roomsList = payload.data || [];
        setRooms(roomsList);

        const preselected = localStorage.getItem("preselectedRoomId");
        if (preselected) {
          setSelectedRoomId(Number(preselected));
          localStorage.removeItem("preselectedRoomId");
        } else {
          setSelectedRoomId((previous) => previous || roomsList[0]?.id || null);
        }
      } catch (loadError) {
        setRoomsError(loadError.message);
      } finally {
        if (showLoading) setRoomsLoading(false);
      }
    }, [token]);

  useEffect(() => {
    loadRooms(true);
  }, [loadRooms]);

  useEffect(() => {
    if (roomsRevision > 0) loadRooms();
  }, [loadRooms, roomsRevision]);

  const selectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setRooms((currentRooms) => currentRooms.map((room) => (
      Number(room.id) === Number(roomId) ? { ...room, unread_count: 0 } : room
    )));
  };

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rooms;

    return rooms.filter((room) => {
      return (
        String(room.request_code || "").toLowerCase().includes(query) ||
        String(room.name || "").toLowerCase().includes(query) ||
        String(room.issue_type || "").toLowerCase().includes(query)
      );
    });
  }, [rooms, searchQuery]);

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => Number(room.id) === Number(selectedRoomId)) || null;
  }, [rooms, selectedRoomId]);

  const totalUnread = rooms.reduce((total, room) => {
    if (Number(room.id) === Number(selectedRoomId)) return total;
    return total + Number(room.unread_count || 0);
  }, 0);

  return (
    <div className="messages-page">
      <main className="messages-main">
        <div className="messages-container">
          <header className="messages-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                <div style={{ fontSize: "2.5em", position: "relative" }}>
                  <TiMessages />
                  {totalUnread > 0 && <span className="header-unread-badge">{totalUnread}</span>}
                </div>
                <h1 className="messages-title">Messages</h1>
              </div>
              <p className="messages-description">
                {isReadOnly ? "View ticket conversations" : "Real-time ticket rooms"}
              </p>
            </div>
          </header>

          {(roomsError || socketError) && (
          <div className="empty-state" style={{ marginBottom: "1rem" }}>
            {roomsError || socketError}
          </div>
          )}

          <div className="split-layout">
            <section className="left-panel">
              <div className="search-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  type="search"
                  placeholder="Search conversations…"
                  className="search-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="conversations-list">
                {roomsLoading ? (
                  <div className="empty-state">Loading rooms...</div>
                ) : filteredRooms.length === 0 ? (
                  <div className="empty-state">No rooms found.</div>
                ) : (
                  filteredRooms.map((room) => (
                    <ConversationCard
                      key={room.id}
                      room={room}
                      selected={Number(selectedRoomId) === Number(room.id)}
                      onSelect={selectRoom}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="right-panel">
              {selectedRoom ? (
                <ChatThread
                  room={selectedRoom}
                  messages={messages}
                  onSend={sendMessage}
                  currentUserId={currentUserId}
                  isJoining={isJoining}
                  isReadOnly={isReadOnly}
                />
              ) : (
                <div className="empty-selection">
                  <div className="empty-icon">
                    <MessageSquare size={32} />
                  </div>
                  <p className="empty-title">No conversation selected</p>
                  <p className="empty-subtitle">Select a room to start messaging</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
