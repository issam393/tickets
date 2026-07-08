import { useEffect, useMemo, useState } from "react";
import { API_ORIGIN } from "../../../lib/apiConfig";
import {
  Clock, CheckCircle2, Calendar as CalendarIcon, AlertCircle,
  X, Check, User, Users, MapPin, Ticket, Plus, Pencil, Trash2, Building
} from "lucide-react";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Meetings.css";

const API_BASE = API_ORIGIN;
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

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, month: "current", iso, date: new Date(year, month, day) });
  }

  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, month: "next", iso, date });
  }

  return cells;
};

const formatDateKeyLocal = (isoValue) => {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateTimeRange = (meeting) => {
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  return `${start.toLocaleString()} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const toLocalInputValue = (isoValue) => {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getEventTone = (status) => {
  if (status === "Pending") return "orange";
  if (status === "Accepted") return "green";
  return "red";
};

const statusClass = (status) => {
  if (status === "Accepted") return "status-accepted";
  if (status === "Rejected") return "status-rejected";
  return "status-pendingg";
};

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

function ScheduleMeetingModal({ isOpen, onClose, onSubmit, invitees, tickets, meetingRooms, initialValues, isSubmitting, isReadOnly }) {
  const [formData, setFormData] = useState({
    inviteeId: "",
    title: "",
    ticketId: "",
    meetingRoomId: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      setFormData({
        inviteeId: initialValues.inviteeId ? String(initialValues.inviteeId) : "",
        title: initialValues.title || "",
        ticketId: initialValues.ticketId ? String(initialValues.ticketId) : "",
        meetingRoomId: initialValues.meetingRoomId ? String(initialValues.meetingRoomId) : "",
        startTime: toLocalInputValue(initialValues.startTime),
        endTime: toLocalInputValue(initialValues.endTime),
        location: initialValues.location || "",
        description: initialValues.description || "",
      });
      return;
    }
    setFormData({ inviteeId: "", title: "", ticketId: "", meetingRoomId: "", startTime: "", endTime: "", location: "", description: "" });
  }, [isOpen, initialValues]);

  const isFormValid = formData.inviteeId && formData.title.trim() && formData.startTime && formData.endTime;

  const handleSubmit = () => {
    if (!isFormValid || isSubmitting) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="schedule-modal-overlay" onClick={onClose} />
      <div className="schedule-modal">
        <div className="schedule-modal-header">
          <div>
            <h2>{initialValues ? "Edit Meeting" : "Schedule New Meeting"}</h2>
            <p className="schedule-modal-subtitle">All times are stored in UTC and displayed in your local timezone.</p>
          </div>
          <button className="schedule-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="schedule-modal-body">
          <div className="form-group">
            <label>Invite Team Member <span className="required">*</span></label>
            <select className="custom-select-trigger" value={formData.inviteeId} onChange={(e) => setFormData(prev => ({ ...prev, inviteeId: e.target.value }))} disabled={isReadOnly}>
              <option value="">Select team member...</option>
              {invitees.map(member => (
                <option key={member.id} value={member.id}>{member.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Meeting Title <span className="required">*</span></label>
            <input type="text" placeholder="Enter meeting title..." value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} disabled={isReadOnly} />
          </div>

          <div className="form-group">
            <label>Related Ticket (Optional)</label>
            <select className="custom-select-trigger" value={formData.ticketId} onChange={e => setFormData(prev => ({ ...prev, ticketId: e.target.value }))} disabled={isReadOnly}>
              <option value="">No ticket (general meeting)</option>
              {tickets.map(ticket => (
                <option key={ticket.id} value={ticket.id}>{ticket.requestCode}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Start Time <span className="required">*</span></label>
              <input type="datetime-local" value={formData.startTime} onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))} disabled={isReadOnly} />
            </div>
            <div className="form-group half-width">
              <label>End Time <span className="required">*</span></label>
              <input type="datetime-local" value={formData.endTime} onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} disabled={isReadOnly} />
            </div>
          </div>

          <div className="form-group">
            <label>Location (Optional)</label>
            <input type="text" placeholder="Meeting room, virtual meeting, etc..." value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} disabled={isReadOnly} />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea placeholder="Meeting agenda and details..." rows={6} style={{ height: "120px" }} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} disabled={isReadOnly} />
          </div>
        </div>

        <div className="schedule-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          {!isReadOnly && (
            <button className={`btn-create ${!isFormValid || isSubmitting ? "disabled" : ""}`} onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
              <Plus size={16} />
              {isSubmitting ? "Saving..." : initialValues ? "Save Changes" : "Create Meeting"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function MeetingDetailsDialog({ open, onOpenChange, meeting, onAccept, onReject, onDelete, onEdit, isProcessing, meetingRooms, isReadOnly }) {
  const [mode, setMode] = useState("view");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) { setMode("view"); setReason(""); }
  }, [open]);

  if (!meeting) return null;

  const roomName = meetingRooms.find(r => r.id === meeting.meetingRoomId)?.name || meeting.location || "-";

  return (
    <div className={`dialog-overlay ${open ? "open" : ""}`} onClick={() => onOpenChange(false)}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{meeting.title}</h2>
          <button className="dialog-close" onClick={() => onOpenChange(false)}>✕</button>
        </div>

        <div className="dialog-body">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className={`status-badge ${statusClass(meeting.status)}`}>{meeting.status}</span>
            {meeting.isAssignedToCurrentUser && <span className="meeting-assignee-badge">Assigned to you</span>}
          </div>

          <div className="info-grid">
            <div className="info-item"><div className="info-icon"><User size={16} /></div><div><span className="info-label">Organizer</span><br />{meeting.organizer}</div></div>
            <div className="info-item"><div className="info-icon"><Users size={16} /></div><div><span className="info-label">Invitee</span><br />{meeting.invitee || "-"}</div></div>
            <div className="info-item"><div className="info-icon"><Building size={16} /></div><div><span className="info-label">Room</span><br />{roomName}</div></div>
            <div className="info-item"><div className="info-icon"><Clock size={16} /></div><div><span className="info-label">Date & Time</span><br />{formatDateTimeRange(meeting)}</div></div>
            {meeting.ticketCode && (
              <div className="info-item"><div className="info-icon"><Ticket size={16} /></div><div><span className="info-label">Related Ticket</span><br /><span className="ticket-link">{meeting.ticketCode}</span></div></div>
            )}
          </div>

          <div className="description-box">
            <span className="info-label">Description</span>
            <p>{meeting.description || "No description provided."}</p>
          </div>

          {meeting.status === "Rejected" && meeting.rejectionReason && (
            <div className="alert-box alert-rejected"><AlertCircle size={18} /><div><strong>Rejection Reason</strong><br />{meeting.rejectionReason}</div></div>
          )}

          {meeting.canRespond && meeting.status === "Pending" && mode === "rejecting" && (
            <div className="reject-box">
              <label>Rejection Reason <span className="required">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Please provide a motive..." />
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {meeting.canRespond && meeting.status === "Pending" && mode === "view" && (
            <div className="action-group">
              <button className="btn-reject" onClick={() => setMode("rejecting")} disabled={isProcessing}><X size={14} /> Reject</button>
              <button className="btn-accept" onClick={() => onAccept(meeting)} disabled={isProcessing}><Check size={14} /> Accept</button>
            </div>
          )}

          {meeting.canRespond && meeting.status === "Pending" && mode === "rejecting" && (
            <div className="action-group">
              <button className="btn-secondary" onClick={() => { setMode("view"); setReason(""); }} disabled={isProcessing}>Cancel</button>
              <button className="btn-confirm-reject" disabled={!reason.trim() || isProcessing} onClick={() => onReject(meeting, reason)}><X size={14} /> Confirm Rejection</button>
            </div>
          )}

          {!isReadOnly && meeting.canManage && (
            <div className="action-group">
              <button className="btn-secondary" onClick={() => onEdit(meeting)} disabled={isProcessing}><Pencil size={14} /> Edit</button>
              <button className="btn-reject" onClick={() => onDelete(meeting)} disabled={isProcessing}><Trash2 size={14} /> Delete</button>
            </div>
          )}

          <button className="btn-close" onClick={() => onOpenChange(false)} disabled={isProcessing}>Close</button>
        </div>
      </div>
    </div>
  );
}

const Meetings = () => {
  const token = localStorage.getItem("token");
  const role = getUserRole();
  const isSD = role === 'SD';
  const isManager = role === 'Manager';
  const isReadOnly = !isSD;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [invitees, setInvitees] = useState([]);
  const [ticketOptions, setTicketOptions] = useState([]);
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { day: "numeric", month: "long", year: "numeric" });
  const grid = buildGrid(year, month);

  const meetingsByDate = useMemo(() => {
    const map = {};
    meetings.forEach(meeting => {
      const key = formatDateKeyLocal(meeting.startTime);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(meeting);
    });
    return map;
  }, [meetings]);

  const stats = useMemo(() => {
    const pending = meetings.filter(m => m.status === "Pending").length;
    const accepted = meetings.filter(m => m.status === "Accepted").length;
    const total = meetings.length;
    return { pending, accepted, total };
  }, [meetings]);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const sortMeetings = items => [...items].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const loadMeetings = async () => {
    if (!token) { setError("Please login first."); return; }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/meetings`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load meetings");
      setMeetings(sortMeetings(payload.data || []));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    if (!token || !isSD) return;
    try {
      const [metaRes, roomsRes] = await Promise.all([
        fetch(`${API_BASE}/api/meetings/meta`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/meeting-rooms`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const metaPayload = await metaRes.json();
      if (metaRes.ok) {
        setInvitees(metaPayload.data?.invitees || []);
        setTicketOptions(metaPayload.data?.tickets || []);
      }
      const roomsPayload = await roomsRes.json();
      if (roomsRes.ok) setMeetingRooms(roomsPayload.data || []);
    } catch (metaError) {
      setError(metaError.message);
    }
  };

  useEffect(() => { loadMeetings(); loadMeta(); }, [token, isSD]);

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleEventClick = (meeting, event) => {
    event.stopPropagation();
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  const handleDateClick = (events) => {
    if (!events.length) return;
    setSelectedDateMeetings(events);
    setShowDateModal(true);
  };

  const toIsoWithSeconds = (localDateTimeValue) => {
    if (!localDateTimeValue) return localDateTimeValue;
    return localDateTimeValue.length === 16 ? `${localDateTimeValue}:00` : localDateTimeValue;
  };

  const handleCreateOrUpdateMeeting = async (formData) => {
    if (!isSD) { toast.error("Action non autorisée."); return; }
    try {
      setIsProcessing(true);
      const payload = {
        inviteeId: formData.inviteeId ? Number(formData.inviteeId) : null,
        title: formData.title,
        ticketId: formData.ticketId ? Number(formData.ticketId) : null,
        meetingRoomId: formData.meetingRoomId ? Number(formData.meetingRoomId) : null,
        startTime: toIsoWithSeconds(formData.startTime),
        endTime: toIsoWithSeconds(formData.endTime),
        location: formData.location,
        description: formData.description,
      };
      const endpoint = editingMeeting ? `${API_BASE}/api/meetings/${editingMeeting.id}` : `${API_BASE}/api/meetings`;
      const method = editingMeeting ? "PUT" : "POST";
      const response = await fetch(endpoint, { method, headers: authHeaders, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save meeting");
      setMeetings(prev => editingMeeting ? sortMeetings(prev.map(m => m.id === result.data.id ? result.data : m)) : sortMeetings([...prev, result.data]));
      setEditingMeeting(null);
      setShowScheduleModal(false);
      setDialogOpen(false);
      setSelectedMeeting(null);
      setError("");
      await loadMeetings();
      toast.success(editingMeeting ? "Meeting updated successfully." : "Meeting created successfully.");
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async (meeting) => {
    if (!meeting.canRespond) { toast.error("Action non autorisée."); return; }
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_BASE}/api/meetings/${meeting.id}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ status: "Accepted", rejectionReason: null }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to accept meeting");
      setMeetings(prev => prev.map(item => item.id === result.data.id ? result.data : item));
      setSelectedMeeting(result.data);
      toast.success("Meeting accepted");
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (meeting, rejectionReason) => {
    if (!meeting.canRespond) { toast.error("Action non autorisée."); return; }
    if (!rejectionReason.trim()) { toast.error("Rejection reason is required."); return; }
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_BASE}/api/meetings/${meeting.id}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ status: "Rejected", rejectionReason }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to reject meeting");
      setMeetings(prev => prev.map(item => item.id === result.data.id ? result.data : item));
      setSelectedMeeting(result.data);
      toast.success("Meeting rejected");
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (meeting) => {
    if (!isSD) { toast.error("Action non autorisée."); return; }
    const confirmed = window.confirm(`Delete meeting "${meeting.title}"?`);
    if (!confirmed) return;
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_BASE}/api/meetings/${meeting.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete meeting");
      setMeetings(prev => prev.filter(item => item.id !== meeting.id));
      setDialogOpen(false);
      setSelectedMeeting(null);
      toast.success("Meeting deleted");
    } catch (actionError) {
      toast.error(actionError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (meeting) => {
    if (!isSD) { toast.error("Action non autorisée."); return; }
    setEditingMeeting(meeting);
    setShowScheduleModal(true);
  };

  return (
    <div className="meetings-page">
      <main className="meetings-main">
        <div className="meetings-container">
          <div className="meetings-header-wrapper">
            <header className="meetings-header">
              <div>
                <div className="header-icon-title"><FaRegCalendarAlt className="page-icon" /><h1 className="meetings-title">Meetings</h1></div>
                <p className="meetings-description">{isManager ? "Review all meetings and respond only to your assigned requests" : isReadOnly ? "View team meetings" : "Schedule and manage team meetings"}</p>
              </div>
            </header>
            {!isReadOnly && isSD && (
              <button className="schedule-meeting-btn" onClick={() => { setEditingMeeting(null); setShowScheduleModal(true); }}>
                <Plus size={18} /> Schedule Meeting
              </button>
            )}
          </div>

          {error && (
            <div className="permission-banner"><AlertCircle size={18} /><div><p className="permission-title">Action required</p><p className="permission-text">{error}</p></div></div>
          )}

          {isManager && (
            <div className="meeting-assignment-legend">
              <span className="meeting-assignment-marker" />
              <span><strong>Assigned to you</strong> meetings can be accepted or rejected. All other meetings are view-only.</span>
            </div>
          )}

          <div className="stats-grid">
            <StatCard label="Pending" value={stats.pending} Icon={Clock} tone="warning" />
            <StatCard label="Accepted" value={stats.accepted} Icon={CheckCircle2} tone="success" />
            <StatCard label="Rejected" value={stats.total - stats.accepted - stats.pending} Icon={AlertCircle} tone="error" />
            <StatCard label="Total Meetings" value={stats.total} Icon={CalendarIcon} tone="primary" />
          </div>

          <section className="calendar-section">
            <div className="calendar-controls">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={goToday}>Today</button>
                <button className="nav-btn" onClick={goPrevMonth}>Back</button>
                <button className="nav-btn" onClick={goNextMonth}>Next</button>
              </div>
              <h2 className="calendar-month">{monthName}</h2>
            </div>

            <div className="weekdays">{weekdays.map(day => <div key={day} className="weekday">{day}</div>)}</div>

            <div className="calendar-grid">
              {grid.map((cell, idx) => {
                const isOther = cell.month !== "current";
                const events = meetingsByDate[cell.iso] || [];
                const isLastRow = idx >= 35;
                return (
                  <div key={`${cell.iso}-${idx}`} className={`calendar-cell ${isOther ? "calendar-cell--other" : ""} ${isLastRow ? "calendar-cell--last-row" : ""} ${events.length > 0 ? "has-events" : ""}`} onClick={() => handleDateClick(events)}>
                    <div className={`calendar-day ${isOther ? "calendar-day--other" : ""}`}>{String(cell.day).padStart(2, "0")}</div>
                    <div className="calendar-events">
                      {events.slice(0, 2).map(meeting => (
                        <div key={meeting.id} className={`event-tag event-tag--${getEventTone(meeting.status)} ${meeting.isAssignedToCurrentUser ? "event-tag--assigned" : ""}`} onClick={(event) => handleEventClick(meeting, event)} title={meeting.isAssignedToCurrentUser ? `${meeting.title} - Assigned to you` : meeting.title}>
                          {meeting.title.length > 22 ? `${meeting.title.slice(0, 19)}…` : meeting.title}
                        </div>
                      ))}
                      {events.length > 2 && <div className="more-events">+{events.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && <p style={{ marginTop: "1rem", color: "var(--muted-foreground)" }}>Loading meetings...</p>}
          </section>
        </div>
      </main>

      {showDateModal && (
        <div className="dialog-overlay open" onClick={() => setShowDateModal(false)}>
          <div className="dialog-content date-modal" onClick={e => e.stopPropagation()}>
            <div className="dialog-header"><h3 className="dialog-title">Meetings for {selectedDateMeetings[0] ? new Date(selectedDateMeetings[0].startTime).toDateString() : ""}</h3><button className="dialog-close" onClick={() => setShowDateModal(false)}>✕</button></div>
            <div className="dialog-body">
              {selectedDateMeetings.map(meeting => (
                <div key={meeting.id} className="date-meeting-item" onClick={() => { setSelectedMeeting(meeting); setDialogOpen(true); setShowDateModal(false); }}>
                  <div className={`event-tag event-tag--${getEventTone(meeting.status)} ${meeting.isAssignedToCurrentUser ? "event-tag--assigned" : ""}`} style={{ display: "inline-block", width: "auto", marginBottom: "8px" }}>{meeting.status}</div>
                  <p className="meeting-title">{meeting.title}</p>
                  <p className="meeting-time">{formatDateTimeRange(meeting)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MeetingDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meeting={selectedMeeting}
        onAccept={handleAccept}
        onReject={handleReject}
        onDelete={handleDelete}
        onEdit={openEditModal}
        isProcessing={isProcessing}
        meetingRooms={meetingRooms}
        isReadOnly={isReadOnly}
      />

      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setEditingMeeting(null); }}
        onSubmit={handleCreateOrUpdateMeeting}
        invitees={invitees}
        tickets={ticketOptions}
        meetingRooms={meetingRooms}
        initialValues={editingMeeting}
        isSubmitting={isProcessing}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default Meetings;
