import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ORIGIN } from "../../../lib/apiConfig";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GitBranch,
  Inbox,
  Plus,
  Send,
  Ticket,
  UserPlus,
  Zap,
} from 'lucide-react';
import './SDHomeDashboard.css';

const API_BASE = API_ORIGIN;

function getUserToken() {
  return localStorage.getItem('token');
}

function safeNumber(value) {
  return Number(value) || 0;
}

function minutesToHours(minutes, emptyLabel = 'No data') {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return emptyLabel;
  const value = Number(minutes);
  if (value === 0) return '<1m';
  if (value < 60) return `${Math.round(value)}m`;
  return `${(value / 60).toFixed(1)}h`;
}

function formatDate(date) {
  if (!date) return 'Not available';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(status = 'Pending') {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function getSeverityClass(level = 'Normal') {
  return String(level || 'normal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="sd-muted sd-empty-cell">{children}</td>
    </tr>
  );
}

export default function SDHomeDashboard({
  onCreateTicket,
  onManageOrganizations,
  onManageClients,
  onReviewAssignments,
  onMessages,
  onMeetings,
  onViewAllTickets,
}) {
  const [now, setNow] = useState(new Date());
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  const loadDashboard = async () => {
    const token = getUserToken();
    if (!token) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/dashboard/sd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Service Delivery dashboard could not be loaded.');
      }

      setDashboard(payload.data);
    } catch (err) {
      const message = err.message || 'Service Delivery dashboard could not be loaded.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const clock = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(clock);
  }, []);

  const handleAssign = async (ticketId, team) => {
    const token = getUserToken();
    if (!token) {
      toast.error('Session expired. Please login again.');
      return;
    }

    try {
      setAssigningId(`${ticketId}-${team}`);
      const response = await fetch(`${API_BASE}/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || `Ticket assignment to ${team} failed.`);
      }

      toast.success(`Ticket assigned successfully to ${team}`);
      await loadDashboard();
    } catch (err) {
      toast.error(err.message || 'Ticket assignment failed.');
    } finally {
      setAssigningId(null);
    }
  };

  const stats = dashboard?.ticketStats || {};
  const workflow = dashboard?.workflowAnalytics || {};
  const contacts = dashboard?.contactsSummary || {};
  const queue = dashboard?.pendingAssignmentQueue || [];
  const recentTickets = dashboard?.recentTickets || [];
  const delayedTickets = dashboard?.delayedTickets || [];
  const currentUser = dashboard?.currentUser || {};

  const assignmentRows = useMemo(() => {
    const total = safeNumber(stats.totalTickets);
    return [
      { team: 'Waiting', count: safeNumber(stats.notAssigned), tone: 'amber' },
      { team: 'IT', count: safeNumber(stats.assignedToIT), tone: 'blue' },
      { team: 'PKI', count: safeNumber(stats.assignedToPKI), tone: 'indigo' },
      { team: 'Resolved', count: safeNumber(stats.resolvedTickets), tone: 'green' },
    ].map((row) => ({
      ...row,
      pct: total ? Math.round((row.count / total) * 100) : 0,
    }));
  }, [stats]);

  const kpis = [
    { icon: Ticket, label: 'Total Tickets', value: safeNumber(stats.totalTickets), helper: `${safeNumber(stats.createdToday)} created today`, tone: 'cyan' },
    { icon: Inbox, label: 'Pending Tickets', value: safeNumber(stats.pendingTickets), helper: `${safeNumber(stats.createdThisWeek)} this week`, tone: 'blue' },
    { icon: GitBranch, label: 'Waiting Assignment', value: safeNumber(stats.notAssigned), helper: `${minutesToHours(stats.avgAssignmentMinutes)} avg assignment`, tone: 'amber' },
    { icon: CheckCircle2, label: 'Resolved Tickets', value: safeNumber(stats.resolvedTickets), helper: 'closed by support teams', tone: 'green' },
    { icon: AlertTriangle, label: 'Critical / Warning', value: safeNumber(stats.criticalTickets) + safeNumber(stats.warningTickets), helper: `${safeNumber(workflow.delayed24h)} delayed over 24h`, tone: 'red' },
  ];

  if (loading) {
    return (
      <div className="sd-home-page">
        <div className="sd-home-container">
          <div className="sd-panel sd-dashboard-state">Loading Service Delivery dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-home-page">
        <div className="sd-home-container">
          <div className="sd-panel sd-dashboard-state">
            <AlertTriangle />
            <p>{error}</p>
            <button className="sd-panel-btn" onClick={loadDashboard}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-home-page">
      <div className="sd-home-container">
        <header className="sd-home-header">
          <div className="sd-home-header-left">
            <div className="sd-home-greeting">
              <span className="sd-home-greet-dot" />
              Welcome back, {currentUser.name || currentUser.username || 'Service Delivery'}
              <span className="sd-home-role-badge">{currentUser.service || currentUser.role || 'SD Operator'}</span>
            </div>
            <h1 className="sd-home-title">Support Desk Overview</h1>
            <p className="sd-home-subtitle">Manage tickets, organizations, clients, and team assignments.</p>
          </div>
          <div className="sd-home-header-right">
            <div className="sd-home-status-pill">
              <span className="sd-home-status-dot" />
              Today's operations
            </div>
            <div className="sd-home-date">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <section className="sd-kpi-grid">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className={`sd-kpi-card sd-tone-${kpi.tone}`}>
                <div className="sd-kpi-icon"><Icon size={18} /></div>
                <div className="sd-kpi-body">
                  <span className="sd-kpi-label">{kpi.label}</span>
                  <span className="sd-kpi-value">{kpi.value}</span>
                  <span className="sd-kpi-helper">{kpi.helper}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="sd-row sd-row-2-1">
          <div className="sd-panel sd-assignment-card">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Ticket Assignment Overview</h2>
                <p className="sd-panel-sub">Live distribution across teams</p>
              </div>
              <button className="sd-link-btn" onClick={onReviewAssignments || onViewAllTickets}>
                Review Assignments <ArrowRight size={14} />
              </button>
            </div>
            <div className="sd-assign-list">
              {assignmentRows.map((row) => (
                <div key={row.team} className="sd-assign-row">
                  <div className="sd-assign-meta">
                    <span className={`sd-team-badge sd-tone-${row.tone}`}>{row.team}</span>
                    <span className="sd-assign-count">{row.count} tickets</span>
                  </div>
                  <div className="sd-assign-bar">
                    <div className={`sd-assign-fill sd-tone-${row.tone}`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="sd-assign-pct">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sd-panel sd-quick-actions">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Quick Actions</h2>
                <p className="sd-panel-sub">Work faster</p>
              </div>
              <Zap size={16} className="sd-panel-icon" />
            </div>
            <div className="sd-quick-grid">
              <button className="sd-qa-btn sd-qa-primary" onClick={onCreateTicket}><Plus size={16} /> Create Ticket</button>
              <button className="sd-qa-btn" onClick={onManageOrganizations}><Building2 size={16} /> Add Organization</button>
              <button className="sd-qa-btn" onClick={onManageClients}><UserPlus size={16} /> Add Client</button>
              <button className="sd-qa-btn" onClick={onViewAllTickets}><Ticket size={16} /> View Tickets</button>
              <button className="sd-qa-btn" onClick={onMessages}><Send size={16} /> Open Messages</button>
              <button className="sd-qa-btn" onClick={onMeetings}><Calendar size={16} /> Schedule Meeting</button>
            </div>
          </div>
        </section>

        <section className="sd-panel sd-tickets-panel">
          <div className="sd-panel-header">
            <div>
              <h2 className="sd-panel-title">Recent Ticket Activity</h2>
              <p className="sd-panel-sub">Latest 7 items across the work queue</p>
            </div>
            <button className="sd-link-btn" onClick={onViewAllTickets}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="sd-table-wrap">
            <table className="sd-ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Client</th>
                  <th>Organization</th>
                  <th>Issue</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.length === 0 ? (
                  <EmptyRow colSpan={7}>No recent tickets.</EmptyRow>
                ) : (
                  recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="sd-ticket-row">
                      <td className="sd-ticket-id">{ticket.request_code || `TKT-${ticket.id}`}</td>
                      <td className="sd-muted">{ticket.client || ticket.client_id || 'Not linked'}</td>
                      <td className="sd-muted">{ticket.organization || 'Not linked'}</td>
                      <td>{ticket.issue_type || ticket.application}</td>
                      <td><span className={`sd-team-badge sd-team-${String(ticket.assignedService || 'unassigned').toLowerCase()}`}>{ticket.assignedService || 'Unassigned'}</span></td>
                      <td><span className={`sd-status-badge sd-status-${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                      <td className="sd-muted">{formatDate(ticket.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sd-panel sd-tickets-panel sd-assignment-queue-panel">
          <div className="sd-panel-header">
            <div>
              <h2 className="sd-panel-title">Tickets Waiting For Assignment</h2>
              <p className="sd-panel-sub">Assign active pending tickets to IT or PKI</p>
            </div>
            <button className="sd-link-btn" onClick={loadDashboard}>
              Refresh <ArrowRight size={14} />
            </button>
          </div>
          <div className="sd-table-wrap">
            <table className="sd-ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Organization</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Pending</th>
                  <th>Assign</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <EmptyRow colSpan={7}>No tickets are waiting for assignment.</EmptyRow>
                ) : (
                  queue.map((ticket) => (
                    <tr key={ticket.id} className="sd-ticket-row">
                      <td className="sd-ticket-id">{ticket.request_code || `TKT-${ticket.id}`}</td>
                      <td>{ticket.issue_type || ticket.application}</td>
                      <td className="sd-muted">{ticket.organization || 'Not linked'}</td>
                      <td>
                        <span className={`sd-sev-badge sd-assignment-severity-text sd-sev-${getSeverityClass(ticket.issue_level)}`}>{ticket.issue_level || 'Normal'}</span>
                      </td>
                      <td><span className={`sd-status-badge sd-status-${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                      <td className="sd-muted">{safeNumber(ticket.pendingHours)}h</td>
                      <td>
                        <div className="sd-inline-actions">
                          <button className="sd-row-action" disabled={assigningId === `${ticket.id}-IT`} onClick={() => handleAssign(ticket.id, 'IT')}>IT</button>
                          <button className="sd-row-action" disabled={assigningId === `${ticket.id}-PKI`} onClick={() => handleAssign(ticket.id, 'PKI')}>PKI</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sd-row sd-row-2">
          <div className="sd-panel">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Contacts & Organizations</h2>
                <p className="sd-panel-sub">Live CRM summary</p>
              </div>
              <Building2 size={16} className="sd-panel-icon" />
            </div>
            <div className="sd-summary-stats">
              <div><span className="sd-stat-num">{safeNumber(contacts.totalOrganizations)}</span><span className="sd-stat-lbl">Organizations</span></div>
              <div><span className="sd-stat-num">{safeNumber(contacts.newOrganizationsThisWeek)}</span><span className="sd-stat-lbl">New orgs this week</span></div>
              <div><span className="sd-stat-num">{safeNumber(contacts.organizationsWithOpenTickets)}</span><span className="sd-stat-lbl">With open tickets</span></div>
              <div><span className="sd-stat-num">{safeNumber(contacts.totalContacts)}</span><span className="sd-stat-lbl">Contacts</span></div>
              <div><span className="sd-stat-num">{safeNumber(contacts.newContactsThisWeek)}</span><span className="sd-stat-lbl">New contacts this week</span></div>
              <div><span className="sd-stat-num">{safeNumber(contacts.contactsWithUnresolvedTickets)}</span><span className="sd-stat-lbl">With unresolved tickets</span></div>
            </div>
            <button className="sd-panel-btn" onClick={onManageClients}>Open Contacts <ArrowRight size={14} /></button>
          </div>

          <div className="sd-panel">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Timing Analytics</h2>
                <p className="sd-panel-sub">Operational bottleneck indicators</p>
              </div>
              <Clock size={16} className="sd-panel-icon" />
            </div>
            <div className="sd-summary-stats">
              <div><span className="sd-stat-num">{safeNumber(workflow.delayed24h)}</span><span className="sd-stat-lbl">Pending 24h+</span></div>
              <div><span className="sd-stat-num">{safeNumber(workflow.delayed48h)}</span><span className="sd-stat-lbl">Pending 48h+</span></div>
              <div><span className="sd-stat-num">{safeNumber(workflow.activeInIT)}</span><span className="sd-stat-lbl">Active in IT</span></div>
              <div><span className="sd-stat-num">{safeNumber(workflow.activeInPKI)}</span><span className="sd-stat-lbl">Active in PKI</span></div>
            </div>
          </div>
        </section>

        <section className="sd-panel sd-tickets-panel sd-delayed-tickets-panel">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Delayed Tickets</h2>
                <p className="sd-panel-sub">Real tickets delayed or still unassigned</p>
              </div>
              <AlertTriangle size={16} className="sd-panel-icon" />
            </div>
            <div className="sd-table-wrap">
              <table className="sd-ticket-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Issue</th>
                    <th>Severity</th>
                    <th>Team</th>
                    <th>Delayed</th>
                  </tr>
                </thead>
                <tbody>
                  {delayedTickets.length === 0 ? (
                    <EmptyRow colSpan={5}>No delayed tickets right now.</EmptyRow>
                  ) : delayedTickets.map((ticket) => (
                    <tr key={ticket.id} className="sd-ticket-row">
                      <td className="sd-ticket-id">{ticket.request_code || `Ticket #${ticket.id}`}</td>
                      <td>{ticket.issue_type || ticket.application}</td>
                      <td>
                        <span className={`sd-sev-badge sd-sev-${getSeverityClass(ticket.issue_level || 'medium')}`}>{ticket.issue_level || 'Medium'}</span>
                      </td>
                      <td>
                        <span className={`sd-team-badge sd-team-${String(ticket.assignedService || 'unassigned').toLowerCase()}`}>{ticket.assignedService || 'Unassigned'}</span>
                      </td>
                      <td className="sd-muted">{safeNumber(ticket.ageHours)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </section>

      </div>
    </div>
  );
}
