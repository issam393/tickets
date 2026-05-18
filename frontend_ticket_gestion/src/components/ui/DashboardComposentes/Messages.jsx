import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { TiMessages } from "react-icons/ti";
import { Search, Plus, MessageSquare, Send, ArrowLeftRight, ChevronDown } from "lucide-react";
import "./Messages.css";

// Utilitaire pour générer des IDs uniques
let messageCounter = 0;
const generateUniqueId = () => {
  return `${Date.now()}-${messageCounter++}-${Math.random().toString(36).substr(2, 9)}`;
};

// Demo data
const initialConversations = [
  {
    id: "1",
    title: "Login Issue Resolution – TKT-001",
    user: "Fatima Ahmed",
    tag: "TKT-001",
    tagTone: "purple",
    timestamp: "Mar 28, 12:00 PM",
    dateObj: new Date(2026, 2, 28, 12, 0),
  },
  {
    id: "2",
    title: "Signature Validation Analysis – TKT-003",
    user: "Omar Rashid",
    tag: "TKT-003",
    tagTone: "purple",
    timestamp: "Mar 30, 11:20 AM",
    dateObj: new Date(2026, 2, 30, 11, 20),
  },
  {
    id: "3",
    title: "General Team Discussion",
    user: "Amira Khalil",
    tag: "No Ticket",
    tagTone: "muted",
    timestamp: "Mar 31, 10:15 AM",
    dateObj: new Date(2026, 2, 31, 10, 15),
  },
];

const initialMessagesMap = {
  "1": [
    { id: "m1", author: "me", text: "Starting investigation on login issue.", timestamp: "Mar 28, 10:25 AM", read: true },
    { id: "m2", author: "other", sender: "Fatima Ahmed", text: "I can help with authentication layer.", timestamp: "Mar 28, 10:40 AM", read: false },
    { id: "m3", author: "other", sender: "Fatima Ahmed", text: "Have you checked the logs?", timestamp: "Mar 29, 09:15 AM", read: false },
  ],
  "2": [
    { id: "m5", author: "me", text: "Analyzing signature validation logs.", timestamp: "Mar 30, 11:25 AM", read: true },
    { id: "m6", author: "other", sender: "Omar Rashid", text: "I found something in the certificate chain.", timestamp: "Mar 30, 02:30 PM", read: false },
  ],
  "3": [
    { id: "m8", author: "me", text: "Reminder: sync meeting at 3 PM.", timestamp: "Mar 31, 10:20 AM", read: true },
  ],
};

// Fonction optimisée pour calculer les compteurs de messages non lus
const calculateUnreadCount = (messages) => {
  return messages.filter(msg => msg.author !== "me" && !msg.read).length;
};

const ConversationCard = ({ c, selected, onSelect, unreadCount }) => {
  const tagMap = {
    purple: "tag tag--purple",
    muted: "tag tag--muted",
  };
  
  return (
    <div
      className={`conversation-card ${selected ? "conversation-card--selected" : ""} ${unreadCount > 0 ? "unread-conversation" : ""}`}
      onClick={() => onSelect(c.id)}
    >
      {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      <h3 className={`conversation-title ${unreadCount > 0 ? "unread-title" : ""}`}>{c.title}</h3>
      <div className="conversation-tag">
        <span className={tagMap[c.tagTone]}>{c.tag}</span>
      </div>
      <div className="conversation-meta">
        <span>{c.user}</span>
        <span>{c.timestamp}</span>
      </div>
    </div>
  );
};

const ChatThread = ({ conversation, messages, onSendMessage, scrollPositions, onScrollChange, onMarkConversationAsRead }) => {
  const [inputText, setInputText] = useState("");
  const messagesContainerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const previousMessagesLength = useRef(messages.length);
  const lastScrollTopRef = useRef(0);
  const autoScrollEnabledRef = useRef(true);

  // Marquer tous les messages non lus comme lus dès que la conversation s'ouvre
  useEffect(() => {
    const hasUnreadMessages = messages.some(msg => msg.author !== "me" && !msg.read);
    if (hasUnreadMessages) {
      onMarkConversationAsRead(conversation.id);
    }
  }, [conversation.id, messages, onMarkConversationAsRead]);

  // Gestion du scroll automatique pour les nouveaux messages (y compris ceux de l'autre utilisateur)
  useEffect(() => {
    const hasNewMessage = messages.length > previousMessagesLength.current;
    
    if (hasNewMessage && messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      
      // Si l'utilisateur était en bas OU si le scroll automatique est activé, scroller vers le bas
      if (isAtBottom || autoScrollEnabledRef.current) {
        // Petit délai pour permettre au DOM de se mettre à jour
        setTimeout(() => {
          if (messagesContainerRef.current && !isUserScrollingRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            onScrollChange(conversation.id, messagesContainerRef.current.scrollTop);
            // Réactiver le scroll automatique
            autoScrollEnabledRef.current = true;
          }
        }, 100);
      }
      
      // Si c'est un message de l'autre utilisateur, le marquer comme lu immédiatement
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.author !== "me" && lastMessage.read === false) {
        onMarkConversationAsRead(conversation.id);
      }
    }
    
    previousMessagesLength.current = messages.length;
  }, [messages, conversation.id, onScrollChange, onMarkConversationAsRead]);

  // Détection du scroll manuel de l'utilisateur
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    
    // Mettre à jour le flag de scroll utilisateur
    if (!isAtBottom) {
      isUserScrollingRef.current = true;
      autoScrollEnabledRef.current = false; // Désactiver le scroll automatique quand l'utilisateur scroll vers le haut
    } else {
      isUserScrollingRef.current = false;
      autoScrollEnabledRef.current = true; // Réactiver quand l'utilisateur est en bas
    }
    
    // Sauvegarder la position de scroll
    onScrollChange(conversation.id, scrollTop);
    lastScrollTopRef.current = scrollTop;
    
    // Réinitialiser le flag après 2 secondes sans scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesContainerRef.current) {
        const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNowAtBottom = scrollHeight - currentScrollTop <= clientHeight + 50;
        if (isNowAtBottom) {
          isUserScrollingRef.current = false;
          autoScrollEnabledRef.current = true;
        }
      }
    }, 2000);
  }, [conversation.id, onScrollChange]);

  // Restaurer la position de scroll lors du changement de conversation
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      const savedPosition = scrollPositions[conversation.id];
      
      if (savedPosition !== undefined) {
        // Restaurer la position sauvegardée
        messagesContainerRef.current.scrollTop = savedPosition;
        // Vérifier si la position restaurée est en bas
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
        autoScrollEnabledRef.current = isAtBottom;
      } else {
        // Si pas de position sauvegardée, scroller en bas
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        autoScrollEnabledRef.current = true;
      }
    }
    
    // Cleanup du timeout
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [conversation.id, scrollPositions]);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;
    
    const newMessage = {
      id: generateUniqueId(),
      author: "me",
      text: inputText.trim(),
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      read: true,
    };
    
    onSendMessage(newMessage);
    setInputText("");
    
    // Scroll en bas après l'envoi
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        onScrollChange(conversation.id, messagesContainerRef.current.scrollTop);
        autoScrollEnabledRef.current = true;
      }
    }, 50);
  }, [inputText, onSendMessage, conversation.id, onScrollChange]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      isUserScrollingRef.current = false;
      autoScrollEnabledRef.current = true;
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      onScrollChange(conversation.id, messagesContainerRef.current.scrollTop);
    }
  }, [conversation.id, onScrollChange]);

  return (
    <div className="chat-thread">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-title">{conversation.title}</h2>
          <div className="chat-participants">
            <span>Participants: {conversation.user} + you</span>
            <span className="chat-ticket-tag">{conversation.tag}</span>
          </div>
        </div>
      </div>

      <div 
        className="messages-area" 
        ref={messagesContainerRef} 
        onScroll={handleScroll}
      >
        {messages.map((m) => {
          const isMe = m.author === "me";
          const isUnread = !isMe && !m.read;
          return (
            <div key={m.id} className={`message-row ${isMe ? "message-row--me" : "message-row--other"}`}>
              <div className="message-bubble-wrapper">
                {!isMe && m.sender && <span className="message-sender">{m.sender}</span>}
                <div className={`message-bubble ${isMe ? "message-bubble--me" : "message-bubble--other"} ${isUnread ? "message-unread" : ""}`}>
                  {m.text}
                </div>
                <span className="message-time">{m.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form className="message-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your message…"
          className="message-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="send-btn" aria-label="Send">
          <Send size={16} />
        </button>
        <button type="button" className="latest-btn" aria-label="Scroll to latest message" onClick={scrollToBottom}>
          <ChevronDown size={16} />
          Latest
        </button>
      </form>
    </div>
  );
};

const Messages = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [messagesMap, setMessagesMap] = useState(initialMessagesMap);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [scrollPositions, setScrollPositions] = useState({});

  // Optimisation: Calcul des compteurs de messages non lus avec useMemo
  const unreadMap = useMemo(() => {
    const map = {};
    Object.keys(messagesMap).forEach(convId => {
      map[convId] = calculateUnreadCount(messagesMap[convId]);
    });
    return map;
  }, [messagesMap]);

  // Calcul du nombre total de messages non lus
  const totalUnread = useMemo(() => {
    return Object.values(unreadMap).reduce((a, b) => a + b, 0);
  }, [unreadMap]);

  // Filtrer les conversations en fonction de la recherche
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Vérifier que la conversation sélectionnée existe toujours après le filtrage
  const selectedConversation = useMemo(() => {
    if (!selectedId) return null;
    return filteredConversations.find((c) => c.id === selectedId);
  }, [selectedId, filteredConversations]);

  // Réinitialiser la sélection si la conversation n'existe plus
  useEffect(() => {
    if (selectedId && !selectedConversation) {
      setSelectedId(null);
    }
  }, [selectedId, selectedConversation]);

  const currentMessages = selectedId ? (messagesMap[selectedId] || []) : [];

  const handleSelectConversation = useCallback((id) => {
    setSelectedId(id);
  }, []);

  // Marquer tous les messages d'une conversation comme lus
  const handleMarkConversationAsRead = useCallback((convId) => {
    setMessagesMap(prev => {
      const updatedMessages = { ...prev };
      if (updatedMessages[convId]) {
        const hasUnread = updatedMessages[convId].some(msg => msg.author !== "me" && !msg.read);
        if (hasUnread) {
          updatedMessages[convId] = updatedMessages[convId].map(msg => 
            msg.author !== "me" ? { ...msg, read: true } : msg
          );
        }
      }
      return updatedMessages;
    });
  }, []);

  const handleSendMessage = useCallback((newMessage) => {
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage],
    }));
  }, [selectedId]);

  // Simuler l'arrivée d'un nouveau message d'un autre utilisateur
  const simulateIncomingMessage = useCallback(() => {
    if (!selectedId) return;
    
    const newMessage = {
      id: generateUniqueId(),
      author: "other",
      sender: selectedConversation?.user || "Team Member",
      text: `New message received at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      read: false, // Nouveau message non lu
    };
    
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage],
    }));
  }, [selectedId, selectedConversation]);

  const handleScrollChange = useCallback((convId, scrollTop) => {
    setScrollPositions((prev) => ({ ...prev, [convId]: scrollTop }));
  }, []);

  return (
    <div className="messages-page">
      <main className="messages-main">
        <div className="messages-container">
          {/* Header with unread badge */}
          <header className="messages-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                <div style={{ fontSize: "2.5em", position: "relative" }}>
                  <TiMessages />
                  {totalUnread > 0 && (
                    <span className="header-unread-badge">{totalUnread}</span>
                  )}
                </div>
                <h1 className="messages-title">Messages</h1>
              </div>
              <p className="messages-description">Team conversations and ticket discussions</p>
            </div>
            {/* Bouton de test pour simuler un message entrant */}
            {selectedId && (
              <button 
                onClick={simulateIncomingMessage}
                style={{
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Test: New Message
              </button>
            )}
          </header>

          {/* Split layout */}
          <div className="split-layout">
            <section className="left-panel">
              <div className="search-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  type="search"
                  placeholder="Search conversations…"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="conversations-list">
                {filteredConversations.map((c) => (
                  <ConversationCard
                    key={c.id}
                    c={c}
                    selected={selectedId === c.id}
                    onSelect={handleSelectConversation}
                    unreadCount={unreadMap[c.id] || 0}
                  />
                ))}
                {filteredConversations.length === 0 && (
                  <div className="empty-state">No conversations match</div>
                )}
              </div>
            </section>

            <section className="right-panel">
              {selectedConversation ? (
                <ChatThread
                  conversation={selectedConversation}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  scrollPositions={scrollPositions}
                  onScrollChange={handleScrollChange}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                />
              ) : (
                <div className="empty-selection">
                  <div className="empty-icon">
                    <MessageSquare size={32} />
                  </div>
                  <p className="empty-title">No conversation selected</p>
                  <p className="empty-subtitle">Select a conversation from the left panel to start messaging</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;