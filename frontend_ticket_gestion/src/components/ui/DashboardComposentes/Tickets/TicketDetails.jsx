import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Clock,
  RefreshCw,
  Send,
  Users,
  X,
} from "lucide-react";
import "./TicketDetails.css";

// Status options for the selector
const STATUS_OPTIONS = [
  { value: "Resolved", label: "Resolved", icon: CheckCircle2 },
  { value: "Critical", label: "Critical", icon: X },
  { value: "Warning",  label: "Warning",  icon: Clock },
  { value: "Pending",  label: "Pending",  icon: Clock },
];

// Returns the CSS class for the status button (used by the new selector)
function statusButtonClass(status) {
  const map = {
    Resolved: "status-resolved",
    Critical: "status-critical",
    Warning:  "status-warning",
    Pending:  "status-pending",
  };
  return map[status] || "";
}

function GlassCard({ children, className = "" }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

function Field({ label, value, icon: Icon }) {
  return (
    <div className="field">
      <p className="field-label">
        {Icon && <Icon className="field-icon" />}
        {label}
      </p>
      <p className="field-value">{value || "N/A"}</p>
    </div>
  );
}

function TicketDetails({ ticketId, onBack, onMessages }) {
  const [expanded, setExpanded] = useState(false);
  const [teamDiscussionCollapsed, setTeamDiscussionCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const statusDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Fetch ticket details on mount or ID change
  useEffect(() => {
    const fetchTicket = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:2300/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load ticket details");
        }
        setTicket(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [commentsList, setCommentsList] = useState([
    {
      user: "USR-002",
      role: "user",
      time: "30/03/2026 12:37:00",
      text: "The OTP code is not arriving to my registered mobile number +971 52 987 6543. I have tried 5 times already.",
    },
    {
      user: "SUP-002",
      role: "support",
      time: "30/03/2026 13:15:00",
      text: "We are checking the SMS gateway logs. Can you confirm that your mobile number is still active and able to receive SMS from other services?",
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    const now = new Date();
    const formattedTime = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    const newCommentObj = {
      user: "SUP-001",
      role: "support",
      time: formattedTime,
      text: newComment.trim(),
    };
    setCommentsList([...commentsList, newCommentObj]);
    setNewComment("");
  };

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:2300/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update status");
      }
      setTicket(payload.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignTeam = async (team) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:2300/api/tickets/${ticketId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ team })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to assign ticket");
      }
      setTicket(payload.data);
      setIsRoleDropdownOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const getAssignedTeamName = () => {
    if (!ticket || !ticket.allowed_services) return "Unassigned";
    if (ticket.allowed_services.includes("IT")) return "IT Team";
    if (ticket.allowed_services.includes("PKI")) return "PKI Team";
    return "Unassigned";
  };

  const handleViewConversation = () => {
    if (ticket && ticket.room_id) {
      localStorage.setItem("preselectedRoomId", ticket.room_id);
      if (onMessages) {
        onMessages();
      }
    }
  };

  if (loading) {
    return (
      <div className="ticket-detail-page">
        <main className="ticket-detail-main">
          <div className="ticket-detail-container" style={{ justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <p style={{ color: "var(--foreground)" }}>Loading ticket details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-detail-page">
        <main className="ticket-detail-main">
          <div className="ticket-detail-container" style={{ justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <p style={{ color: "var(--critical)" }}>Error: {error}</p>
            <button onClick={onBack} className="back-button" style={{ marginTop: "1rem" }}>
              Back to List
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <main className="ticket-detail-main">
        <div className="ambient-glow" />
        <div className="ticket-detail-container">
          {/* HEADER */}
          <header className="detail-header">
            <div className="detail-header-left">
              <button onClick={onBack} className="back-button">
                <ArrowLeft className="back-icon" />
                Back
              </button>
              <div>
                <h1 className="detail-title">Ticket Details</h1>
                <p className="detail-id">{ticket?.request_code}</p>
              </div>
            </div>
          </header>

          {/* CLIENT CARD */}
          <GlassCard className="client-card">
            <div className="client-card-inner">
              <div className="client-avatar">AA</div>
              <div className="client-info">
                <div className="client-name-row">
                  <h2 className="client-name">Ahmed Al-Mansouri</h2>
                  <span className="verified-badge">
                    <Shield className="verified-icon" />
                    Verified
                  </span>
                </div>
                <div className="client-meta">
                  <span className="client-id">USR-002</span>
                  <span className="separator">•</span>
                  <span>Senior Security Analyst</span>
                  <span className="separator">•</span>
                  <span>AGCE — Algerian Government Cybersecurity Entity</span>
                </div>
              </div>
              <div className="client-actions">
                <span className="status-active">
                  <span className="status-dot active-dot" />
                  Active
                </span>
                <button onClick={() => setExpanded((v) => !v)} className="expand-btn">
                  {expanded ? "Show Less" : "Read More"}
                  {expanded ? <ChevronUp className="expand-icon" /> : <ChevronDown className="expand-icon" />}
                </button>
              </div>
            </div>

            <div className="contact-strip">
              <a href="mailto:ahmed.almansouri@agce.gov" className="contact-item">
                <div className="contact-icon"><Mail className="contact-svg" /></div>
                <div><p className="contact-label">Email</p><p className="contact-value">ahmed.almansouri@agce.gov</p></div>
              </a>
              <a href="tel:+971529876543" className="contact-item">
                <div className="contact-icon"><Phone className="contact-svg" /></div>
                <div><p className="contact-label">Phone</p><p className="contact-value">+971 52 987 6543</p></div>
              </a>
              <div className="contact-item">
                <div className="contact-icon dept-icon"><Briefcase className="contact-svg" /></div>
                <div><p className="contact-label">Department</p><p className="contact-value">Cybersecurity Operations</p></div>
              </div>
            </div>

            <div className={`expandable-details ${expanded ? "expanded" : ""}`}>
              <div className="expandable-content">
                <div className="details-grid">
                  <Field label="Full Name" value="Ahmed Al-Mansouri" />
                  <Field label="User ID" value="USR-002" />
                  <Field label="Role" value="End User / Verified" icon={Shield} />
                  <Field label="Job Title" value="Senior Security Analyst" icon={Briefcase} />
                  <Field label="Organization" value="AGCE" />
                  <Field label="Created At" value="15/01/2025 09:12:00" icon={Clock} />
                  <Field label="Updated At" value="30/03/2026 14:08:00" icon={RefreshCw} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* TICKET INFORMATION CARD */}
          <GlassCard className="ticket-info-card">
            {/* Header with new status & team selector */}
            <div className="ticket-info-header">
              <div>
                <h2 className="section-title">Ticket Information</h2>
                <p className="ticket-id-sub">{ticket?.request_code}</p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                {ticket?.room_id && (
                  <button 
                    onClick={handleViewConversation} 
                    className="view-conversation-btn"
                  >
                    <MessageSquare size={14} />
                    View Conversation
                  </button>
                )}

                {/* Team Assignment Selector */}
                <div className="role-assignment-wrapper" ref={roleDropdownRef}>
                  <button
                    className="role-assignment-btn"
                    onClick={() => setIsRoleDropdownOpen(prev => !prev)}
                  >
                    <Users size={14} />
                    {getAssignedTeamName()}
                    <ChevronDown size={14} />
                  </button>
                  {isRoleDropdownOpen && (
                    <div className="role-dropdown">
                      <button
                        className={`role-dropdown-option ${ticket?.allowed_services?.includes('IT') ? 'active' : ''}`}
                        onClick={() => handleAssignTeam('IT')}
                      >
                        IT Team
                      </button>
                      <button
                        className={`role-dropdown-option ${ticket?.allowed_services?.includes('PKI') ? 'active' : ''}`}
                        onClick={() => handleAssignTeam('PKI')}
                      >
                        PKI Team
                      </button>
                    </div>
                  )}
                </div>

                {/* Status selector */}
                <div className="status-selector-wrapper" ref={statusDropdownRef}>
                  <button
                    className={`status-selector-btn ${statusButtonClass(ticket?.status)}`}
                    onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  >
                    {(() => {
                      const current = STATUS_OPTIONS.find((o) => o.value === ticket?.status);
                      const Icon = current ? current.icon : CheckCircle2;
                      return <Icon className="status-btn-icon" />;
                    })()}
                    {ticket?.status}
                    <ChevronDown className="status-chevron" />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="status-dropdown">
                      {STATUS_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isActive = ticket?.status === option.value;
                        return (
                          <button
                            key={option.value}
                            className={`status-dropdown-option ${isActive ? "active" : ""}`}
                            onClick={() => {
                              handleStatusChange(option.value);
                              setIsStatusDropdownOpen(false);
                            }}
                          >
                            <Icon className="option-icon" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="ticket-fields-grid">
              <Field label="Application" value={ticket?.application} />
              <Field label="Issue Type" value={ticket?.issue_type} />
              <Field label="Issue Level" value={ticket?.issue_level} />
              <Field label="Time of Receipt" value={ticket ? new Date(ticket.createdAt).toLocaleString() : ""} />
              <Field label="Time of Creation" value={ticket ? new Date(ticket.createdAt).toLocaleString() : ""} />
              <Field label="Resolution Time" value={ticket && ticket.status === 'Resolved' ? new Date(ticket.updatedAt).toLocaleString() : "N/A"} />
            </div>

            <div className="description-section">
              <h3 className="description-title">Issue Description</h3>
              <p className="description-text">{ticket?.issue_description}</p>
            </div>

            <div className="resolution-section">
              <h3 className="resolution-title">
                <CheckCircle2 className="resolution-icon" />
                Resolution / Comment
              </h3>
              <p className="resolution-text">
                {ticket?.status === 'Resolved'
                  ? "Rerouted traffic and successfully verified resolution with secondary gateway configuration."
                  : "Under active investigation by our support specialists."}
              </p>
            </div>
          </GlassCard>

          {/* COMMENTS & MEETINGS CARD */}
          <GlassCard className="discussions-card">
            <h2 className="section-title">Comments & Meetings</h2>

            <div className="team-discussion">
              <div
                className="discussion-header clickable"
                onClick={() => setTeamDiscussionCollapsed(!teamDiscussionCollapsed)}
              >
                <h3 className="discussion-subtitle">
                  <MessageSquare className="discussion-icon" />
                  Comments
                </h3>
                <div className="discussion-meta">
                  <button className="collapse-toggle">
                    {teamDiscussionCollapsed ? <ChevronDown size={30} /> : <ChevronUp size={30} />}
                  </button>
                </div>
              </div>

              <div className={`collapsible-content ${teamDiscussionCollapsed ? "collapsed" : ""}`}>
                <div className="discussion-thread">
                  {commentsList.map((comment, idx) => (
                    <div key={idx} className="thread-message">
                      <div className="thread-message-header">
                        <span className={`thread-author ${comment.role === "support" ? "support-user" : "user-user"}`}>
                          {comment.user}
                        </span>
                        <span className="thread-time">{comment.time}</span>
                      </div>
                      <p className="thread-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="comment-input-area">
                <textarea
                  className="comment-textarea"
                  rows="3"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="comment-actions">
                  <button className="attach-btn">
                    <Paperclip className="attach-icon" />
                    Attach
                  </button>
                  <button onClick={handleSendComment} className="post-btn">
                    <Send className="post-icon" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

export default TicketDetails;