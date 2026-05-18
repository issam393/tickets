import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Users,
  CheckCircle2,
} from "lucide-react";
import useChatRoom from "../../../../hooks/useChatRoom";
import "./TicketDetails.css";

const API_BASE = "http://localhost:2300";

function GlassCard({ children, className = "" }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

function Field({ label, value }) {
  return (
    <div className="field">
      <p className="field-label">{label}</p>
      <p className="field-value">{value || "-"}</p>
    </div>
  );
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function TicketDetails({ ticketId, onBack }) {
  const token = localStorage.getItem("token");
  const currentUserId = Number(localStorage.getItem("userId"));
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [teamDiscussionCollapsed, setTeamDiscussionCollapsed] = useState(false);
  const [discussionsCollapsed, setDiscussionsCollapsed] = useState(false);

  const roomId = ticket?.room_id ? Number(ticket.room_id) : null;
  const { messages, sendMessage, isJoining, error: chatError } = useChatRoom(roomId);

  useEffect(() => {
    const loadTicket = async () => {
      if (!token) {
        setError("Please login first.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load ticket.");
        }

        setTicket(payload.data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId, token]);

  const statusClass = useMemo(() => {
    if (!ticket?.status || ticket.status === "Pending") return "status-badge status-pending";
    if (ticket.status === "Resolved") return "status-badge status-resolved";
    return "status-badge status-skipped";
  }, [ticket]);

  const handleSendComment = async () => {
    const text = newComment.trim();
    if (!text || !roomId) return;

    try {
      await sendMessage(text);
      setNewComment("");
    } catch (sendError) {
      setError(sendError.message);
    }
  };

  return (
    <div className="ticket-detail-page">
      <main className="ticket-detail-main">
        <div className="ambient-glow" />
        <div className="ticket-detail-container">
          <header className="detail-header">
            <div className="detail-header-left">
              <button onClick={onBack} className="back-button">
                <ArrowLeft className="back-icon" />
                Back
              </button>
              <div>
                <h1 className="detail-title">Ticket Details</h1>
                <p className="detail-id">{ticket?.request_code || ticketId}</p>
              </div>
            </div>
          </header>

          {loading && <GlassCard className="ticket-info-card">Loading ticket...</GlassCard>}
          {(error || chatError) && <GlassCard className="ticket-info-card">{error || chatError}</GlassCard>}

          {ticket && (
            <>
              <GlassCard className="ticket-info-card">
                <div className="ticket-info-header">
                  <div>
                    <h2 className="section-title">Ticket Information</h2>
                    <p className="ticket-id-sub">{ticket.request_code}</p>
                  </div>
                  <span className={statusClass}>
                    <CheckCircle2 className="status-icon" />
                    {ticket.status}
                  </span>
                </div>

                <div className="ticket-fields-grid">
                  <Field label="Application" value={ticket.application} />
                  <Field label="Issue Type" value={ticket.issue_type} />
                  <Field label="Issue Level" value={ticket.issue_level} />
                  <Field label="Created At" value={formatTime(ticket.createdAt)} />
                  <Field label="Created By" value={ticket.created_by_username} />
                  <Field label="Room ID" value={ticket.room_id} />
                </div>

                <div className="description-section">
                  <h3 className="description-title">Issue Description</h3>
                  <p className="description-text">{ticket.issue_description}</p>
                </div>
              </GlassCard>

              <GlassCard className="discussions-card">
                <h2 className="section-title">Comments & Meetings</h2>

                <div className="team-discussion">
                  <div
                    className="discussion-header clickable"
                    onClick={() => setTeamDiscussionCollapsed(!teamDiscussionCollapsed)}
                  >
                    <h3 className="discussion-subtitle">
                      <MessageSquare className="discussion-icon" />
                      Room Chat {roomId ? `#${roomId}` : ""}
                    </h3>
                    <div className="discussion-meta">
                      <button className="collapse-toggle">
                        {teamDiscussionCollapsed ? <ChevronDown size={30} /> : <ChevronUp size={30} />}
                      </button>
                    </div>
                  </div>

                  <div className={`collapsible-content ${teamDiscussionCollapsed ? "collapsed" : ""}`}>
                    <div className="discussion-thread">
                      {isJoining ? (
                        <div className="thread-message">Joining room...</div>
                      ) : messages.length === 0 ? (
                        <div className="thread-message">No messages in this room yet.</div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="thread-message">
                            <div className="thread-message-header">
                              <span className={`thread-author ${Number(message.senderId) === currentUserId ? "support-user" : "user-user"}`}>
                                {Number(message.senderId) === currentUserId ? "You" : message.senderName}
                              </span>
                              <span className="thread-time">{formatTime(message.timestamp)}</span>
                            </div>
                            <p className="thread-text">{message.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="comment-input-area">
                    <textarea
                      className="comment-textarea"
                      rows="3"
                      placeholder={roomId ? "Write a message to this ticket room..." : "No room available for this ticket"}
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      disabled={!roomId}
                    />
                    <div className="comment-actions">
                      <button onClick={handleSendComment} className="post-btn" disabled={!roomId}>
                        <Send className="post-icon" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="discussions-card">
                <h2 className="section-title">Discussions & Meetings</h2>
                <div className="team-discussion">
                  <div
                    className="discussion-header clickable"
                    onClick={() => setDiscussionsCollapsed(!discussionsCollapsed)}
                  >
                    <h3 className="discussion-subtitle">
                      <Users className="discussion-icon" />
                      Internal Notes
                    </h3>
                    <div className="discussion-meta">
                      <button className="collapse-toggle">
                        {discussionsCollapsed ? <ChevronDown size={30} /> : <ChevronUp size={30} />}
                      </button>
                    </div>
                  </div>

                  <div className={`collapsible-content ${discussionsCollapsed ? "collapsed" : ""}`}>
                    <div className="discussion-thread">
                      <div className="thread-message">
                        <div className="thread-message-header">
                          <span className="thread-author">System</span>
                          <span className="thread-time">{formatTime(ticket.createdAt)}</span>
                        </div>
                        <p className="thread-text">Dedicated room provisioned for this ticket based on type and severity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default TicketDetails;
