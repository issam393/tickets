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
import toast from "react-hot-toast";
import "./TicketDetails.css";

// Status options for the selector
const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", icon: Clock },
  { value: "In Progress", label: "In Progress", icon: RefreshCw },
  { value: "Resolved", label: "Resolved", icon: CheckCircle2 },
  { value: "Critical", label: "Critical", icon: X },
  { value: "Warning", label: "Warning", icon: Clock },
];

// Returns the CSS class for the status button
function statusButtonClass(status) {
  const map = {
    Resolved: "status-resolved",
    Critical: "status-critical",
    Warning: "status-warning",
    Pending: "status-pending",
    "In Progress": "status-progress",
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
  const getRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.service;
      return String(role).toUpperCase() === "MANAGER" ? "Manager" : role;
    } catch {
      return null;
    }
  };
  const role = getRole();
  const canManageTicket = role === "SD";
  const [expanded, setExpanded] = useState(false);
  const [teamDiscussionCollapsed, setTeamDiscussionCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const isLevelOneTicket = ticket?.issue_level === "Level 1 Assistance";

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const statusDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Comments state
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [newComment, setNewComment] = useState("");

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
            Authorization: `Bearer ${token}`,
          },
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

  // Fetch comments whenever ticketId changes. Resolved tickets keep their history visible.
  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem("token");
      if (!token || !ticketId) return;
      try {
        setCommentsLoading(true);
        setCommentsError("");
        const response = await fetch(
          `http://localhost:2300/api/tickets/${ticketId}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || payload.error || "Failed to load comments");
        }
        setCommentsList(payload.data || []);
      } catch (err) {
        setCommentsList([]);
        setCommentsError(err.message || "Failed to load comments");
        toast.error(err.message || "Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [ticketId, ticket?.status]);

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

  // Send a comment
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    if (ticket?.status === "Resolved") {
      toast.error("Cannot add comment because the ticket is resolved.");
      return;
    }
    if (role === "Manager") {
      toast.error("Action non autorisée.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:2300/api/tickets/${ticketId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment.trim() }),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || "Failed to add comment");
      }
      // Append the new comment (returned by backend with full user info)
      setCommentsList((previous) => [...previous, payload.data]);
      setNewComment("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!canManageTicket) {
      toast.error("Action non autorisée.");
      return;
    }
    if (ticket?.status === "Resolved") {
      toast.error("Cannot reopen a resolved ticket.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:2300/api/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || "Failed to update status");
      }
      setTicket(payload.data);
      toast.success(newStatus === "Resolved" ? "Ticket resolved successfully." : "Ticket updated successfully.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignTeam = async (team) => {
    if (!canManageTicket) {
      toast.error("Action non autorisée.");
      return;
    }
    if (ticket?.status === "Resolved") {
      toast.error("Ticket already resolved.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:2300/api/tickets/${ticketId}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ team }),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.error || "Failed to assign ticket");
      }
      setTicket(payload.data);
      setIsRoleDropdownOpen(false);
      toast.success(`Ticket assigned successfully to ${team}.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getAssignedTeamName = () => {
    if (!ticket || !ticket.allowed_services) return "Unassigned";
    if (ticket.issue_level === "Level 1 Assistance") return "Service Delivery";
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
          <div
            className="ticket-detail-container"
            style={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <p style={{ color: "var(--foreground)" }}>
              Loading ticket details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-detail-page">
        <main className="ticket-detail-main">
          <div
            className="ticket-detail-container"
            style={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <p style={{ color: "var(--critical)" }}>Error: {error}</p>
            <button
              onClick={onBack}
              className="back-button"
              style={{ marginTop: "1rem" }}
            >
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
            {(() => {
              const creatorName = ticket?.created_by_username || "—";
              const initials =
                creatorName !== "—"
                  ? creatorName.slice(0, 2).toUpperCase()
                  : "??";
              return (
                <>
                  <div className="client-card-inner">
                    <div className="client-avatar">{initials}</div>
                    <div className="client-info">
                      <div className="client-name-row">
                        <h2 className="client-name">{creatorName}</h2>
                        <span className="verified-badge">
                          <Shield className="verified-icon" />
                          Verified
                        </span>
                      </div>
                      <div className="client-meta">
                        <span className="client-id">
                          ID-
                          {String(ticket?.created_by || "—").padStart(3, "0")}
                        </span>
                        <span className="separator">•</span>
                        <span>{ticket?.issue_type || "—"}</span>
                        <span className="separator">•</span>
                        <span>{ticket?.application || "—"}</span>
                      </div>
                    </div>
                    <div className="client-actions">
                      <span
                        className={`status-active ${
                          ticket?.status === "Resolved"
                            ? "status-resolved-badge"
                            : ""
                        }`}
                      >
                        <span className="status-dot active-dot" />
                        {ticket?.status || "Active"}
                      </span>
                      <button
                        onClick={() => setExpanded((v) => !v)}
                        className="expand-btn"
                      >
                        {expanded ? "Show Less" : "Read More"}
                        {expanded ? (
                          <ChevronUp className="expand-icon" />
                        ) : (
                          <ChevronDown className="expand-icon" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="contact-strip">
                    <div className="contact-item">
                      <div className="contact-icon">
                        <Mail className="contact-svg" />
                      </div>
                      <div>
                        <p className="contact-label">Request Code</p>
                        <p className="contact-value">
                          {ticket?.request_code || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <div className="contact-icon">
                        <Phone className="contact-svg" />
                      </div>
                      <div>
                        <p className="contact-label">Issue Level</p>
                        <p className="contact-value">
                          {ticket?.issue_level || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <div className="contact-icon dept-icon">
                        <Briefcase className="contact-svg" />
                      </div>
                      <div>
                        <p className="contact-label">Application</p>
                        <p className="contact-value">
                          {ticket?.application || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`expandable-details ${
                      expanded ? "expanded" : ""
                    }`}
                  >
                    <div className="expandable-content">
                      <div className="details-grid">
                        <Field
                          label="Created By"
                          value={ticket?.created_by_username || "—"}
                        />
                        <Field
                          label="Ticket ID"
                          value={ticket?.id ? `TKT-${ticket.id}` : "—"}
                        />
                        <Field
                          label="Issue Type"
                          value={ticket?.issue_type || "—"}
                          icon={Shield}
                        />
                        <Field
                          label="Issue Level"
                          value={ticket?.issue_level || "—"}
                          icon={Briefcase}
                        />
                        <Field
                          label="Application"
                          value={ticket?.application || "—"}
                        />
                        <Field
                          label="Created At"
                          value={
                            ticket?.createdAt
                              ? new Date(ticket.createdAt).toLocaleString()
                              : "—"
                          }
                          icon={Clock}
                        />
                        <Field
                          label="Updated At"
                          value={
                            ticket?.updatedAt
                              ? new Date(ticket.updatedAt).toLocaleString()
                              : "—"
                          }
                          icon={RefreshCw}
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </GlassCard>

          {/* TICKET INFORMATION CARD */}
          <GlassCard className="ticket-info-card">
            <div className="ticket-info-header">
              <div>
                <h2 className="section-title">Ticket Information</h2>
                <p className="ticket-id-sub">{ticket?.request_code}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {ticket?.status === "Resolved" ? (
                  <span className="ticket-resolved-lock-badge">
                    <CheckCircle2 size={14} />
                    Resolved — Read Only
                  </span>
                ) : (
                  <>
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
                    {canManageTicket && !isLevelOneTicket && (
                    <div className="role-assignment-wrapper" ref={roleDropdownRef}>
                      <button
                        className="role-assignment-btn"
                        onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                      >
                        <Users size={14} />
                        {getAssignedTeamName()}
                        <ChevronDown size={14} />
                      </button>
                      {isRoleDropdownOpen && (
                        <div className="role-dropdown">
                          <button
                            className={`role-dropdown-option ${
                              ticket?.allowed_services?.includes("IT")
                                ? "active"
                                : ""
                            }`}
                            onClick={() => handleAssignTeam("IT")}
                          >
                            IT Team
                          </button>
                          <button
                            className={`role-dropdown-option ${
                              ticket?.allowed_services?.includes("PKI")
                                ? "active"
                                : ""
                            }`}
                            onClick={() => handleAssignTeam("PKI")}
                          >
                            PKI Team
                          </button>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Status selector */}
                    {canManageTicket && (
                    <div
                      className="status-selector-wrapper"
                      ref={statusDropdownRef}
                    >
                      <button
                        className={`status-selector-btn ${statusButtonClass(
                          ticket?.status
                        )}`}
                        onClick={() =>
                          setIsStatusDropdownOpen((prev) => !prev)
                        }
                      >
                        {(() => {
                          const current = STATUS_OPTIONS.find(
                            (o) => o.value === ticket?.status
                          );
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
                                className={`status-dropdown-option ${
                                  isActive ? "active" : ""
                                }`}
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
                    )}
                  </>
                )}
              </div>
            </div>

            {ticket?.status === "Resolved" && (
              <div className="ticket-resolved-banner">
                <CheckCircle2 size={16} />
                <span>
                  This ticket has been resolved and is now{" "}
                  <strong>read-only</strong>. No modifications are permitted.
                </span>
              </div>
            )}

            <div className="ticket-fields-grid">
              <Field label="Application" value={ticket?.application} />
              <Field label="Issue Type" value={ticket?.issue_type} />
              <Field label="Issue Level" value={ticket?.issue_level} />
              <Field
                label="Time of Receipt"
                value={
                  ticket
                    ? new Date(ticket.createdAt).toLocaleString()
                    : ""
                }
              />
              <Field
                label="Time of Creation"
                value={
                  ticket
                    ? new Date(ticket.createdAt).toLocaleString()
                    : ""
                }
              />
              <Field
                label="Resolution Time"
                value={
                  ticket && ticket.status === "Resolved"
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "N/A"
                }
              />
            </div>

            <div className="description-section">
              <h3 className="description-title">Issue Description</h3>
              <p className="description-text">{ticket?.issue_description}</p>
            </div>

          </GlassCard>

          {/* COMMENTS & MEETINGS CARD */}
          <GlassCard className="discussions-card">
            <h2 className="section-title">Comments & Meetings</h2>

            <div className="team-discussion">
              <div
                className="discussion-header clickable"
                onClick={() =>
                  setTeamDiscussionCollapsed(!teamDiscussionCollapsed)
                }
              >
                <h3 className="discussion-subtitle">
                  <MessageSquare className="discussion-icon" />
                  Comments
                </h3>
                <div className="discussion-meta">
                  <button className="collapse-toggle">
                    {teamDiscussionCollapsed ? (
                      <ChevronDown size={30} />
                    ) : (
                      <ChevronUp size={30} />
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`collapsible-content ${
                  teamDiscussionCollapsed ? "collapsed" : ""
                }`}
              >
                <div className="discussion-thread">
                  {commentsLoading ? (
                    <p
                      style={{
                        padding: "1rem",
                        color: "var(--foreground)",
                      }}
                    >
                      Loading comments...
                    </p>
                  ) : commentsList.length === 0 ? (
                    <p
                      style={{
                        padding: "1rem",
                        color: commentsError ? "var(--critical)" : "var(--foreground)",
                      }}
                    >
                      {commentsError || "No comments yet."}
                    </p>
                  ) : (
                    commentsList.map((comment, idx) => (
                      <div
                        key={comment.id || idx}
                        className="thread-message"
                      >
                        <div className="thread-message-header">
                          <span
                            className={`thread-author ${
                              comment.service_name === "SD"
                                ? "support-user"
                                : "user-user"
                            }`}
                          >
                            {comment.firstName} {comment.lastName} (
                            {comment.userName})
                          </span>
                          <span className="thread-time">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="thread-text">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {ticket?.status === "Resolved" ? (
                <div className="ticket-resolved-banner">
                  <CheckCircle2 size={16} />
                  This ticket is resolved. New comments are disabled.
                </div>
              ) : role === "Manager" ? (
                <div className="ticket-resolved-banner">
                  <Shield size={16} />
                  Manager access is read-only.
                </div>
              ) : (
                <div className="comment-input-area">
                  <textarea
                    className="comment-textarea"
                    rows="3"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                  />
                  <div className="comment-actions">
                    <button className="attach-btn" type="button">
                      <Paperclip className="attach-icon" />
                      Attach
                    </button>
                    <button onClick={handleSendComment} className="post-btn" type="button">
                      <Send className="post-icon" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

export default TicketDetails;
