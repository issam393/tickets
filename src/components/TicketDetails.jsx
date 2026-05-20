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
  SkipForward,
  CircleDot,
} from "lucide-react";
import toast from "react-hot-toast";
import "./TicketDetails.css";

// Status options for the selector
const STATUS_OPTIONS = [
  { value: "Resolved", label: "Resolved", icon: CheckCircle2 },
  { value: "Critical", label: "Critical", icon: X },
  { value: "Warning",  label: "Warning",  icon: Clock },
];

// Role options for assignment
const ROLE_OPTIONS = [
  { value: "IT", label: "IT" },
  { value: "PKI", label: "PKI" },
];

// Returns the CSS class for the status button (used by the new selector)
function statusButtonClass(status) {
  const map = {
    Resolved: "status-resolved",
    Critical: "status-critical",
    Warning:  "status-warning",
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
      <p className="field-value">{value}</p>
    </div>
  );
}

function TicketDetails({ ticketId, onBack, onViewConversation }) {
  const [expanded, setExpanded] = useState(false);
  const [teamDiscussionCollapsed, setTeamDiscussionCollapsed] = useState(false);
  const [assignedRole, setAssignedRole] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Now ticket.status is editable
  const [ticket, setTicket] = useState({
    application: "Web RA",
    issueType: "Login",
    issueLevel: "Level 1 Assistance",
    timeOfReceipt: "30/03/2026 12:30:00",
    timeOfCreation: "30/03/2026 12:35:00",
    resolutionTime: "30/03/2026 14:08:00",
    description:
      "OTP not received on registered mobile number. User has tried multiple times to authenticate via the Web RA portal without success. The verification code SMS is not being delivered to the registered UAE mobile number.",
    resolution:
      "Identified an outage with the SMS provider serving the UAE region. Traffic was rerouted through the secondary gateway, and OTP delivery was restored. User confirmed successful login at 14:08 UTC.",
    status: "Resolved",
  });

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
    {
      user: "USR-002",
      role: "user",
      time: "30/03/2026 13:42:00",
      text: "Yes, I can receive SMS from my bank and other services normally. Only the OTP from your platform is not arriving.",
    },
    {
      user: "SUP-002",
      role: "support",
      time: "30/03/2026 14:08:00",
      text: "Thank you for confirming. We have identified an issue with our SMS provider for the UAE region and have rerouted traffic. Please try again now.",
    },
  ]);

  const [newComment, setNewComment] = useState("");

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setIsRoleDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAssignRole = (role) => {
    setAssignedRole(role);
    setIsRoleDropdownOpen(false);
    toast.success(`Ticket assigned to ${role} team`);
  };

  const handleViewConversation = () => {
    if (onViewConversation) {
      onViewConversation(ticketId);
    }
  };

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
                <p className="detail-id">{ticketId}</p>
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
            {/* Header with status and role selectors */}
            <div className="ticket-info-header">
              <div>
                <h2 className="section-title">Ticket Information</h2>
                <p className="ticket-id-sub">{ticketId}</p>
              </div>

              <div className="ticket-header-controls">
                {/* Status selector */}
                <div className="status-selector-wrapper" ref={statusDropdownRef}>
                  <button
                    className={`status-selector-btn ${statusButtonClass(ticket.status)}`}
                    onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  >
                    {(() => {
                      const current = STATUS_OPTIONS.find((o) => o.value === ticket.status);
                      const Icon = current ? current.icon : CheckCircle2;
                      return <Icon className="status-btn-icon" />;
                    })()}
                    {ticket.status}
                    <ChevronDown className="status-chevron" />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="status-dropdown">
                      {STATUS_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isActive = ticket.status === option.value;
                        return (
                          <button
                            key={option.value}
                            className={`status-dropdown-option ${isActive ? "active" : ""}`}
                            onClick={() => {
                              setTicket({ ...ticket, status: option.value });
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

                {/* Role assignment selector */}
                <div className="role-selector-wrapper" ref={roleDropdownRef}>
                  <button
                    className={`role-selector-btn ${assignedRole ? "assigned" : ""}`}
                    onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                  >
                    <Users size={16} />
                    {assignedRole ? assignedRole : "Assign Role"}
                    <ChevronDown className="role-chevron" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="role-dropdown">
                      {ROLE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`role-dropdown-option ${assignedRole === option.value ? "active" : ""}`}
                          onClick={() => handleAssignRole(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="ticket-fields-grid">
              <Field label="Application" value={ticket.application} />
              <Field label="Issue Type" value={ticket.issueType} />
              <Field label="Issue Level" value={ticket.issueLevel} />
              <Field label="Time of Receipt" value={ticket.timeOfReceipt} />
              <Field label="Time of Creation" value={ticket.timeOfCreation} />
              <Field label="Resolution Time" value={ticket.resolutionTime} />
            </div>

            <div className="description-section">
              <h3 className="description-title">Issue Description</h3>
              <p className="description-text">{ticket.description}</p>
            </div>

            <div className="resolution-section">
              <h3 className="resolution-title">
                <CheckCircle2 className="resolution-icon" />
                Resolution / Comment
              </h3>
              <p className="resolution-text">{ticket.resolution}</p>
            </div>
          </GlassCard>

          {/* COMMENTS & MEETINGS CARD */}
          <GlassCard className="discussions-card">
            <div className="comments-header">
              <h2 className="section-title">Comments & Meetings</h2>
              <button onClick={handleViewConversation} className="view-conversation-btn">
                <MessageSquare size={16} />
                View Conversation
              </button>
            </div>

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
