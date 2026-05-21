import { useEffect, useState } from 'react';
import {
  Ticket,
  Inbox,
  UserPlus,
  Building2,
  Users,
  AlertTriangle,
  Activity,
  ShieldAlert,
  MessageSquare,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  Send,
  Briefcase,
  ClipboardList,
  Zap,
} from 'lucide-react';
import './SDHomeDashboard.css';

const API_BASE = 'http://localhost:2300';

function getUserToken() {
  return localStorage.getItem('token');
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
  const [now, setNow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    newToday: 0,
    pendingAssignment: 0,
    activeOrgs: 0,
    registeredClients: 0,
    critical: 0,
  });
  const [assignments, setAssignments] = useState([]); // dynamic
  const [recentTickets, setRecentTickets] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Dynamic time
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const token = getUserToken();
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch tickets, organizations, contacts
        const [ticketsRes, orgsRes, contactsRes] = await Promise.all([
          fetch(`${API_BASE}/api/tickets`, { headers }),
          fetch(`${API_BASE}/api/organizations`, { headers }),
          fetch(`${API_BASE}/api/contacts`, { headers }),
        ]);

        const ticketsPayload = await ticketsRes.json();
        const orgsPayload = await orgsRes.json();
        const contactsPayload = await contactsRes.json();

        const tickets = ticketsPayload.data || [];
        const orgs = orgsPayload.data || [];
        const contacts = contactsPayload.data || [];

        // Compute KPIs
        const total = tickets.length;
        const newToday = tickets.filter(t => {
          const created = new Date(t.createdAt);
          const today = new Date();
          return created.toDateString() === today.toDateString();
        }).length;
        const pendingAssign = tickets.filter(t => t.status === 'Pending' && (!t.allowed_services || t.allowed_services.length === 0)).length;
        const critical = tickets.filter(t => t.issue_level?.toLowerCase() === 'critical').length;
        const activeOrgs = orgs.filter(o => o.status === 'Active').length;
        const totalContacts = contacts.length;

        setStats({
          totalTickets: total,
          newToday,
          pendingAssignment: pendingAssign,
          activeOrgs,
          registeredClients: totalContacts,
          critical,
        });

        // Recent 7 tickets
        const sorted = [...tickets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTickets(sorted.slice(0, 7));

        // Assignment overview (simplified: count by service from allowed_services)
        const assignMap = { SD: 0, IT: 0, PKI: 0, Resolved: 0 };
        tickets.forEach(t => {
          if (t.status === 'Resolved') assignMap.Resolved++;
          else if (t.allowed_services) {
            const services = Array.isArray(t.allowed_services) ? t.allowed_services : JSON.parse(t.allowed_services);
            if (services.includes('IT')) assignMap.IT++;
            if (services.includes('PKI')) assignMap.PKI++;
            if (services.includes('SD') || (!services.includes('IT') && !services.includes('PKI'))) assignMap.SD++;
          } else {
            assignMap.SD++;
          }
        });
        // Remove External Vendor, keep only SD, IT, PKI, Resolved
        const assignmentList = ['SD', 'IT', 'PKI', 'Resolved'].map(team => ({
          team,
          count: assignMap[team],
          pct: total ? Math.round((assignMap[team] / total) * 100) : 0,
          tone: team === 'SD' ? 'cyan' : team === 'IT' ? 'blue' : team === 'PKI' ? 'indigo' : 'green',
        }));
        setAssignments(assignmentList);

        // Alerts: generate from critical tickets
        const criticalTickets = tickets.filter(t => t.issue_level?.toLowerCase() === 'critical' && t.status !== 'Resolved');
        const alertItems = criticalTickets.slice(0, 4).map(t => ({
          icon: ShieldAlert,
          severity: 'critical',
          message: `Ticket ${t.request_code} requires immediate attention`,
          time: new Date(t.createdAt).toLocaleString(),
        }));
        // Add a couple more static alerts if needed
        if (alertItems.length < 4) {
          alertItems.push(
            { icon: Clock, severity: 'high', message: 'SLA review pending for some tickets', time: '' },
            { icon: Activity, severity: 'medium', message: 'Auto-assignment may need attention', time: '' },
          );
        }
        setAlerts(alertItems.slice(0, 4));
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rotating cylinder animation styles
  const rotationStyle = `
    @keyframes rotateCylinder {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
  `;

  return (
    <div className="sd-home-page">
      <style>{rotationStyle}</style>
      <div className="sd-home-container">
        {/* HEADER */}
        <header className="sd-home-header">
          <div className="sd-home-header-left">
            <div className="sd-home-greeting">
              <span className="sd-home-greet-dot" />
              Welcome back, Sara
              <span className="sd-home-role-badge">SD Operator</span>
            </div>
            <h1 className="sd-home-title">Support Desk Overview</h1>
            <p className="sd-home-subtitle">
              Manage tickets, organizations, clients, and team assignments.
            </p>
          </div>
          <div className="sd-home-header-right">
            <div className="sd-home-status-pill">
              <span className="sd-home-status-dot" />
              Today’s operations
            </div>
            <div className="sd-home-date">
              {now
                ? now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : ''}
            </div>
          </div>
        </header>

        {/* KPI GRID */}
        <section className="sd-kpi-grid">
          {[
            { icon: Ticket, label: 'Total Tickets', value: stats.totalTickets, helper: 'across all teams', tone: 'cyan' },
            { icon: Inbox, label: 'New Tickets Today', value: stats.newToday, helper: `+${stats.newToday} created today`, tone: 'blue' },
            { icon: ClipboardList, label: 'Pending Assignment', value: stats.pendingAssignment, helper: `${stats.pendingAssignment} waiting review`, tone: 'amber' },
            { icon: Building2, label: 'Active Organizations', value: stats.activeOrgs, helper: `${stats.activeOrgs} active`, tone: 'indigo' },
            { icon: Users, label: 'Registered Clients', value: stats.registeredClients, helper: `${stats.registeredClients} total`, tone: 'purple' },
            { icon: AlertTriangle, label: 'Critical Tickets', value: stats.critical, helper: `${stats.critical} require attention`, tone: 'red' },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className={`sd-kpi-card sd-tone-${k.tone}`}>
                <div className="sd-kpi-icon">
                  <Icon size={18} />
                </div>
                <div className="sd-kpi-body">
                  <span className="sd-kpi-label">{k.label}</span>
                  <span className="sd-kpi-value">{k.value.toLocaleString()}</span>
                  <span className="sd-kpi-helper">{k.helper}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ASSIGNMENT + QUICK ACTIONS */}
        <section className="sd-row sd-row-2-1">
          <div className="sd-panel sd-assignment-card">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Ticket Assignment Overview</h2>
                <p className="sd-panel-sub">Live distribution across teams</p>
              </div>
              <button className="sd-link-btn" onClick={onReviewAssignments}>
                Review Assignments <ArrowRight size={14} />
              </button>
            </div>
            <div className="sd-assign-list">
              {assignments.map((a) => (
                <div key={a.team} className="sd-assign-row">
                  <div className="sd-assign-meta">
                    <span className={`sd-team-badge sd-tone-${a.tone}`}>{a.team}</span>
                    <span className="sd-assign-count">{a.count} tickets</span>
                  </div>
                  <div className="sd-assign-bar">
                    <div
                      className={`sd-assign-fill sd-tone-${a.tone}`}
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                  <span className="sd-assign-pct">{a.pct}%</span>
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
              <button className="sd-qa-btn sd-qa-primary" onClick={onCreateTicket}>
                <Plus size={16} /> Create Ticket
              </button>
              <button className="sd-qa-btn" onClick={onManageOrganizations}>
                <Building2 size={16} /> Add Organization
              </button>
              <button className="sd-qa-btn" onClick={onManageClients}>
                <UserPlus size={16} /> Add Client
              </button>
              <button className="sd-qa-btn" onClick={onReviewAssignments}>
                <ClipboardList size={16} /> Review Assignments
              </button>
              <button className="sd-qa-btn" onClick={onMessages}>
                <Send size={16} /> Open Messages
              </button>
              <button className="sd-qa-btn" onClick={onMeetings}>
                <Calendar size={16} /> Schedule Meeting
              </button>
            </div>
          </div>
        </section>

        {/* RECENT TICKETS */}
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
                  <th>SLA</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="sd-muted">Loading tickets...</td></tr>
                ) : recentTickets.length === 0 ? (
                  <tr><td colSpan="9" className="sd-muted">No recent tickets.</td></tr>
                ) : (
                  recentTickets.map((t) => (
                    <tr key={t.id} className="sd-ticket-row">
                      <td className="sd-ticket-id">{t.request_code || `TKT-${t.id}`}</td>
                      <td>{t.created_by_username || t.client || '—'}</td>
                      <td className="sd-muted">{t.organization || '—'}</td>
                      <td>{t.issue_type}</td>
                      <td>
                        <span className={`sd-team-badge sd-team-${(t.allowed_services?.[0] || 'sd').toLowerCase()}`}>
                          {t.allowed_services?.join(', ') || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className={`sd-sla-badge sd-sla-${t.sla?.toLowerCase() || 'p4'}`}>{t.sla || 'P4'}</span>
                      </td>
                      <td>
                        <span className={`sd-status-badge sd-status-${t.status.toLowerCase().replace(' ','-')}`}>
                          {t.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="sd-muted">{new Date(t.createdAt).toLocaleString()}</td>
                      <td>
                        <button className="sd-row-action">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORG + CLIENTS with cylinder rotation */}
        <section className="sd-row sd-row-2">
          <div className="sd-panel sd-summary-card" style={{ perspective: '1000px' }}>
            <div className="sd-summary-inner" style={{ animation: 'rotateCylinder 5s infinite linear', transformStyle: 'preserve-3d' }}>
              <div className="sd-summary-front" style={{ backfaceVisibility: 'hidden' }}>
                <div className="sd-summary-head">
                  <div className="sd-summary-icon"><Building2 size={18} /></div>
                  <div>
                    <h3 className="sd-summary-title">Organizations</h3>
                    <p className="sd-panel-sub">CRM directory</p>
                  </div>
                </div>
                <div className="sd-summary-stats">
                  <div><span className="sd-stat-num">{stats.activeOrgs}</span><span className="sd-stat-lbl">Active</span></div>
                  <div><span className="sd-stat-num">—</span><span className="sd-stat-lbl">With open tickets</span></div>
                  <div><span className="sd-stat-num">—</span><span className="sd-stat-lbl">Recently added</span></div>
                </div>
              </div>
              <div className="sd-summary-back" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {/* Empty or mirrored content if needed */}
              </div>
            </div>
            <button className="sd-panel-btn" onClick={onManageOrganizations}>
              Manage Organizations <ArrowRight size={14} />
            </button>
          </div>

          <div className="sd-panel sd-summary-card" style={{ perspective: '1000px' }}>
            <div className="sd-summary-inner" style={{ animation: 'rotateCylinder 5s infinite linear', transformStyle: 'preserve-3d' }}>
              <div className="sd-summary-front" style={{ backfaceVisibility: 'hidden' }}>
                <div className="sd-summary-head">
                  <div className="sd-summary-icon"><Users size={18} /></div>
                  <div>
                    <h3 className="sd-summary-title">Clients</h3>
                    <p className="sd-panel-sub">Across all organizations</p>
                  </div>
                </div>
                <div className="sd-summary-stats">
                  <div><span className="sd-stat-num">{stats.registeredClients}</span><span className="sd-stat-lbl">Total</span></div>
                  <div><span className="sd-stat-num">—</span><span className="sd-stat-lbl">New this week</span></div>
                  <div><span className="sd-stat-num">—</span><span className="sd-stat-lbl">With open tickets</span></div>
                </div>
              </div>
              <div className="sd-summary-back" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              </div>
            </div>
            <button className="sd-panel-btn" onClick={onManageClients}>
              Manage Clients <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* ALERTS + MEETINGS (Team Communication removed) */}
        <section className="sd-row sd-row-3">
          <div className="sd-panel sd-alert-card">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Critical Attention</h2>
                <p className="sd-panel-sub">Needs your action</p>
              </div>
              <Bell size={16} className="sd-panel-icon" />
            </div>
            <ul className="sd-alert-list">
              {alerts.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={i} className={`sd-alert-item sd-sev-${a.severity}`}>
                    <div className="sd-alert-icon"><Icon size={14} /></div>
                    <div className="sd-alert-body">
                      <p className="sd-alert-msg">{a.message}</p>
                      <div className="sd-alert-meta">
                        <span className={`sd-sev-badge sd-sev-${a.severity}`}>{a.severity}</span>
                        <span className="sd-muted">{a.time}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sd-panel">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Meetings & Follow-ups</h2>
                <p className="sd-panel-sub">Coming up</p>
              </div>
              <Calendar size={16} className="sd-panel-icon" />
            </div>
            {/* We keep a static placeholder or fetch real meetings */}
            <ul className="sd-meet-list">
              <li className="sd-meet-item">
                <div className="sd-meet-icon"><Briefcase size={14} /></div>
                <div className="sd-meet-body">
                  <p className="sd-meet-title">SLA review with BIAT</p>
                  <span className="sd-muted sd-meet-meta">Today · 14:30</span>
                </div>
                <CheckCircle2 size={14} className="sd-meet-check" />
              </li>
              <li className="sd-meet-item">
                <div className="sd-meet-icon"><Briefcase size={14} /></div>
                <div className="sd-meet-body">
                  <p className="sd-meet-title">PKI weekly sync</p>
                  <span className="sd-muted sd-meet-meta">Tomorrow · 10:00</span>
                </div>
                <CheckCircle2 size={14} className="sd-meet-check" />
              </li>
            </ul>
            <button className="sd-panel-btn" onClick={onMeetings}>
              View Meetings <ArrowRight size={14} />
            </button>
          </div>

          {/* Empty third column or another widget if needed, but removed team comm */}
        </section>
      </div>
    </div>
  );
}