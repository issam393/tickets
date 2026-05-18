import { useState } from "react";
import { Info, Clock, CheckCircle2, Calendar as CalendarIcon, AlertCircle, MessageCircle, X, Check, User, Users, MapPin, Ticket, Plus } from "lucide-react";
import { FaRegCalendarAlt } from "react-icons/fa";
import "./Meetings.css";

// --- Dialog Component ---
function MeetingDetailsDialog({ open, onOpenChange, meeting }) {
  const [mode, setMode] = useState("view");
  const [reason, setReason] = useState("");
  const [contextRequested, setContextRequested] = useState(false);

  if (!meeting) return null;

  const statusStyles = {
    Accepted: "status-accepted",
    Pending: "status-pending",
    Rejected: "status-rejected",
  };

  const handleAccept = () => {
    alert(`Accepted meeting: ${meeting.title}`);
    onOpenChange(false);
  };

  const handleConfirmRejection = () => {
    if (!reason.trim()) return;
    alert(`Rejected meeting: ${meeting.title}\nReason: ${reason}`);
    onOpenChange(false);
  };

  return (
    <div className={`dialog-overlay ${open ? "open" : ""}`} onClick={() => onOpenChange(false)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{meeting.title}</h2>
          <button className="dialog-close" onClick={() => onOpenChange(false)}>✕</button>
        </div>
        <div className="dialog-body">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className={`status-badge ${statusStyles[meeting.status]}`}>{meeting.status}</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><User size={16} /></div>
              <div><span className="info-label">Organizer</span><br />{meeting.organizer}</div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Users size={16} /></div>
              <div><span className="info-label">Invitee</span><br />{meeting.invitee}</div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Clock size={16} /></div>
              <div><span className="info-label">Date & Time</span><br />{meeting.dateTime}</div>
            </div>
            <div className="info-item">
              <div className="info-icon"><MapPin size={16} /></div>
              <div><span className="info-label">Location</span><br />{meeting.location}</div>
            </div>
            {meeting.relatedTicket && (
              <div className="info-item">
                <div className="info-icon"><Ticket size={16} /></div>
                <div><span className="info-label">Related Ticket</span><br />
                  <button className="ticket-link">{meeting.relatedTicket}</button>
                </div>
              </div>
            )}
          </div>

          <div className="description-box">
            <span className="info-label">Description</span>
            <p>{meeting.description}</p>
          </div>

          {meeting.status === "Rejected" && meeting.rejectionReason && (
            <div className="alert-box alert-rejected">
              <AlertCircle size={18} />
              <div><strong>Rejection Reason</strong><br />{meeting.rejectionReason}</div>
            </div>
          )}

         

          {meeting.status === "Pending" && mode === "rejecting" && (
            <div className="reject-box">
              <label>Rejection Reason <span className="required">*</span></label>
              <textarea style={{ width: "100%" , fontSize: "1rem" , margin: "1.2rem 0" }} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Please provide a motive..." />
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {meeting.status === "Pending" && mode === "view" && (
            <>
              <div className="action-group">
                <button className="btn-reject" onClick={() => setMode("rejecting")}>
                  <X size={14} /> Reject
                </button>
                <button className="btn-accept" onClick={handleAccept}>
                  <Check size={14} /> Accept
                </button>
                <button className="btn-close" onClick={() => onOpenChange(false)}>Close</button>
              </div>
            </>
          )}
          {meeting.status === "Pending" && mode === "rejecting" && (
            <div className="action-group">
              <button className="btn-secondary" onClick={() => { setMode("view"); setReason(""); }}>Cancel</button>
              <button className="btn-confirm-reject" disabled={!reason.trim()} onClick={handleConfirmRejection}>
                <X size={14} /> Confirm Rejection
              </button>
            </div>
          )}
          {meeting.status !== "Pending" && (
            <button className="btn-close" onClick={() => onOpenChange(false)}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Schedule Meeting Modal Component ---
function ScheduleMeetingModal({ isOpen, onClose, onCreateMeeting }) {
  const [formData, setFormData] = useState({
    invitee: "",
    title: "",
    relatedTicket: "",
    startTime: "",
    endTime: "",
    location: "",
    description: ""
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTicketDropdownOpen, setIsTicketDropdownOpen] = useState(false);

  const teamMembers = [
    "Fatima Ahmed - PKI",
    "Mohammed Salem - Manager",
    "Amira Khalil - Delivery",
    "Omar Rashid - PKI",
    "Layla Ibrahim - IT Support",
    "Youssef Al-Farsi - PKI Supervisor",
    "Mariam Al-Mansoori - IT Support Supervisor",
    "Ahmed Al-Hashimi - Admin"
  ];

  const tickets = [
    "No Ticket (General)",
    "TKT-001 - Login",
    "TKT-002 - OTP Problem",
    "TKT-003 - Signature Problem",
    "TKT-004 - Account Activation",
    "TKT-005 - Bug in Application",
    "TKT-006 - Accessibility",
    "TKT-007 - Undeliverable Email",
    "TKT-008 - Functionality Problem"
  ];

  const isFormValid = () => {
    return formData.invitee && formData.title && formData.startTime && formData.endTime;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onCreateMeeting(formData);
      onClose();
      setFormData({
        invitee: "",
        title: "",
        relatedTicket: "",
        startTime: "",
        endTime: "",
        location: "",
        description: ""
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="schedule-modal-overlay" onClick={onClose} />
      <div className="schedule-modal">
        <div className="schedule-modal-header">
          <div>
            <h2>Schedule New Meeting</h2>
            <p className="schedule-modal-subtitle">Create a new meeting and invite a team member</p>
          </div>
          <button className="schedule-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="schedule-modal-body">
          {/* Invite Team Member */}
          <div className="form-group">
            <label>Invite Team Member <span className="required">*</span></label>
            <div className="custom-select">
              <div 
                className="custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={formData.invitee ? "" : "placeholder"}>
                  {formData.invitee || "Select team member..."}
                </span>
                <span className="custom-select-arrow">▼</span>
              </div>
              {isDropdownOpen && (
                <div className="custom-select-dropdown">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="custom-select-option"
                      onClick={() => {
                        setFormData({ ...formData, invitee: member });
                        setIsDropdownOpen(false);
                      }}
                    >
                      {member}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meeting Title */}
          <div className="form-group">
            <label>Meeting Title <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Enter meeting title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Related Ticket */}
          <div className="form-group">
            <label>Related Ticket (Optional)</label>
            <div className="custom-select">
              <div 
                className="custom-select-trigger"
                onClick={() => setIsTicketDropdownOpen(!isTicketDropdownOpen)}
              >
                <span>{formData.relatedTicket || "No ticket (general meeting)"}</span>
                <span className="custom-select-arrow">▼</span>
              </div>
              {isTicketDropdownOpen && (
                <div className="custom-select-dropdown">
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="custom-select-option"
                      onClick={() => {
                        setFormData({ ...formData, relatedTicket: ticket });
                        setIsTicketDropdownOpen(false);
                      }}
                    >
                      {ticket}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="form-row">
            <div className="form-group half-width">
              <label>Start Time <span className="required">*</span></label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="form-group half-width">
              <label>End Time <span className="required">*</span></label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location (Optional)</label>
            <input
              type="text"
              placeholder="Meeting room, virtual meeting, etc..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Meeting agenda and details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              style={{ height: "120px" }}
            />
          </div>
        </div>

        <div className="schedule-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className={`btn-create ${!isFormValid() ? "disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            <Plus size={16} />
            Create Meeting
          </button>
        </div>
      </div>
    </>
  );
}

// --- Helper Functions for Calendar ---
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const buildGrid = (year, month) => {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, month: "prev", iso, date });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, month: "current", iso, date: new Date(year, month, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, month: "next", iso, date });
  }
  return cells;
};

// --- Demo Meeting Data ---
const meetingsData = [
  {
    id: "m1",
    title: "Maintenance Window Planning",
    status: "Pending",
    organizer: "Fatima Ahmed",
    invitee: "You",
    dateTime: "Apr 1, 2026 · 14:00",
    location: "Microsoft Teams",
    relatedTicket: "REQ-2026-0002",
    description: "Plan the upcoming maintenance window for PKI infrastructure, including rollback procedures.",
    dateObj: new Date(2026, 3, 1),
  },
  {
    id: "m2",
    title: "Signature Validation Investigation",
    status: "Accepted",
    organizer: "Omar Rashid",
    invitee: "You",
    dateTime: "Apr 2, 2026 · 11:00",
    location: "Conference Room A",
    relatedTicket: "REQ-2026-0003",
    description: "Deep dive into the signature validation failure and propose a fix.",
    dateObj: new Date(2026, 3, 2),
  },
  {
    id: "m3",
    title: "PKI Certificate Renewal Planning",
    status: "Pending",
    organizer: "Amira Khalil",
    invitee: "You",
    dateTime: "Apr 3, 2026 · 09:30",
    location: "Zoom",
    description: "Discuss the renewal of expiring intermediate CA certificates.",
    dateObj: new Date(2026, 3, 3),
  },
  {
    id: "m4",
    title: "OTP Service Provider Review",
    status: "Rejected",
    organizer: "Sami Benali",
    invitee: "You",
    dateTime: "Apr 4, 2026 · 15:00",
    location: "Board Room",
    relatedTicket: "REQ-2026-0005",
    description: "Review the performance of OTP providers and decide on failover strategy.",
    rejectionReason: "Conflict with another critical deployment.",
    dateObj: new Date(2026, 3, 4),
  },
];

// Helper to group meetings by date ISO
const getMeetingsByDate = () => {
  const map = {};
  meetingsData.forEach(m => {
    const iso = m.dateObj.toISOString().split('T')[0];
    if (!map[iso]) map[iso] = [];
    map[iso].push(m);
  });
  return map;
};

// Helper to compute stats
const getStats = () => {
  const pending = meetingsData.filter(m => m.status === "Pending").length;
  const accepted = meetingsData.filter(m => m.status === "Accepted").length;
  const total = meetingsData.length;
  return { pending, accepted, total };
};

// Helper to get event tone for visual tags
const getEventTone = (status) => {
  if (status === "Pending") return "orange";
  if (status === "Accepted") return "green";
  return "red";
};

// Stat Card Component
const StatCard = ({ label, value, Icon, tone }) => (
  <div className={`dashboard-card dashboard-card--${tone}`}>
    <div className="dashboard-card__info">
      <p className="dashboard-card__label">{label}</p>
      <p className="dashboard-card__value">{value}</p>
    </div>
    <div className="dashboard-card__icon">
      <Icon size={20} />
    </div>
  </div>
);

// --- Main Meetings Component ---
const Meetings = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { day: "numeric", month: "long", year: "numeric" });

  const grid = buildGrid(year, month);
  const meetingsByDate = getMeetingsByDate();
  const stats = getStats();

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleEventClick = (meeting, e) => {
    e.stopPropagation();
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  const handleDateClick = (iso, events) => {
    if (events.length === 0) return;
    setSelectedDateMeetings(events);
    setShowDateModal(true);
  };

  const handleCreateMeeting = (meetingData) => {
    console.log("New meeting created:", meetingData);
    alert(`Meeting "${meetingData.title}" created successfully!`);
  };

  return (
    <div className="meetings-page">
      <main className="meetings-main">
        <div className="meetings-container">
          {/* Header with Schedule Button */}
          <div className="meetings-header-wrapper">
            <header className="meetings-header">
              <div>
                <div className="header-icon-title">
                  <FaRegCalendarAlt className="page-icon" />
                  <h1 className="meetings-title">Meetings</h1>
                </div>
                <p className="meetings-description">Schedule and manage team meetings</p>
              </div>
            </header>
            <button className="schedule-meeting-btn" onClick={() => setShowScheduleModal(true)}>
              <Plus size={18} />
              Schedule Meeting
            </button>
          </div>


          {/* Stats Cards */}
          <div className="stats-grid">
            <StatCard label="Pending" value={stats.pending} Icon={Clock} tone="warning" />
            <StatCard label="Accepted" value={stats.accepted} Icon={CheckCircle2} tone="success" />
            <StatCard label="Rejected" value={stats.total - stats.accepted - stats.pending} Icon={AlertCircle} tone="error" />  
            <StatCard label="Total Meetings" value={stats.total} Icon={CalendarIcon} tone="primary" />
          </div>

          {/* Calendar Section */}
          <section className="calendar-section">
            <div className="calendar-controls">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={goToday}>Today</button>
                <button className="nav-btn" onClick={goPrevMonth}>Back</button>
                <button className="nav-btn" onClick={goNextMonth}>Next</button>
              </div>
              <h2 className="calendar-month">{monthName}</h2>
            </div>

            <div className="weekdays">
              {weekdays.map(d => <div key={d} className="weekday">{d}</div>)}
            </div>

            <div className="calendar-grid">
              {grid.map((cell, idx) => {
                const isOther = cell.month !== "current";
                const events = meetingsByDate[cell.iso] || [];
                const isLastRow = idx >= 35;
                return (
                  <div
                    key={`${cell.iso}-${idx}`}
                    className={`calendar-cell ${isOther ? "calendar-cell--other" : ""} ${isLastRow ? "calendar-cell--last-row" : ""} ${events.length > 0 ? "has-events" : ""}`}
                    onClick={() => handleDateClick(cell.iso, events)}
                  >
                    <div className={`calendar-day ${isOther ? "calendar-day--other" : ""}`}>
                      {String(cell.day).padStart(2, "0")}
                    </div>
                    <div className="calendar-events">
                      {events.slice(0, 2).map(e => (
                        <div
                          key={e.id}
                          className={`event-tag event-tag--${getEventTone(e.status)}`}
                          onClick={(ev) => handleEventClick(e, ev)}
                          title={e.title}
                        >
                          {e.title.length > 22 ? e.title.slice(0, 19) + "…" : e.title}
                        </div>
                      ))}
                      {events.length > 2 && <div className="more-events">+{events.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Date modal (list of meetings for a day) */}
      {showDateModal && (
        <div className="dialog-overlay open" onClick={() => setShowDateModal(false)}>
          <div className="dialog-content date-modal" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">Meetings for {selectedDateMeetings[0]?.dateObj.toDateString()}</h3>
              <button className="dialog-close" onClick={() => setShowDateModal(false)}>✕</button>
            </div>
            <div className="dialog-body">
              {selectedDateMeetings.map(m => (
                <div key={m.id} className="date-meeting-item" onClick={() => { setSelectedMeeting(m); setDialogOpen(true); setShowDateModal(false); }}>
                  <div className={`event-tag event-tag--${getEventTone(m.status)}`} style={{ display: "inline-block", width: "auto", marginBottom: "8px" }}>
                    {m.status}
                  </div>
                  <p className="meeting-title">{m.title}</p>
                  <p className="meeting-time">{m.dateTime}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog open={dialogOpen} onOpenChange={setDialogOpen} meeting={selectedMeeting} />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        onCreateMeeting={handleCreateMeeting}
      />
    </div>
  );
};

export default Meetings;