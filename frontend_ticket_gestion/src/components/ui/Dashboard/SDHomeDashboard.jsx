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

const kpis = [
  { icon: Ticket, label: 'Total Tickets', value: 482, helper: 'across all teams', tone: 'cyan' },
  { icon: Inbox, label: 'New Tickets Today', value: 24, helper: '+5 created today', tone: 'blue' },
  { icon: ClipboardList, label: 'Pending Assignment', value: 12, helper: '12 waiting review', tone: 'amber' },
  { icon: Building2, label: 'Active Organizations', value: 38, helper: '4 added this month', tone: 'indigo' },
  { icon: Users, label: 'Registered Clients', value: 1264, helper: '+18 this week', tone: 'purple' },
  { icon: AlertTriangle, label: 'Critical Tickets', value: 3, helper: '3 require attention', tone: 'red' },
];

const assignment = [
  { team: 'SD',              count: 142, pct: 38, tone: 'cyan' },
  { team: 'IT',              count: 96,  pct: 26, tone: 'blue' },
  { team: 'PKI',             count: 64,  pct: 17, tone: 'indigo' },
  { team: 'External Vendor', count: 28,  pct: 8,  tone: 'purple' },
  { team: 'Resolved',        count: 152, pct: 41, tone: 'green' },
];

const recentTickets = [
  { id: 'TKT-4821', client: 'Aymen Belhadj', org: 'Orange Tunisie',  type: 'Certificate Renewal', team: 'PKI', sla: 'P1', status: 'open',       time: '2 min ago' },
  { id: 'TKT-4820', client: 'Sonia Kchaou',  org: 'BIAT',            type: 'Access Issue',        team: 'IT',  sla: 'P2', status: 'in-progress', time: '14 min ago' },
  { id: 'TKT-4819', client: 'Mehdi Trabelsi',org: 'Tunisie Telecom', type: 'New Org Onboarding',  team: 'SD',  sla: 'P3', status: 'open',       time: '38 min ago' },
  { id: 'TKT-4818', client: 'Ines Khalfaoui',org: 'STB Bank',        type: 'Token Replacement',   team: 'PKI', sla: 'P1', status: 'pending',    time: '1 h ago' },
  { id: 'TKT-4817', client: 'Karim Saidi',   org: 'Attijari Bank',   type: 'Email Configuration', team: 'IT',  sla: 'P3', status: 'in-progress', time: '2 h ago' },
  { id: 'TKT-4816', client: 'Hela Mansouri', org: 'Poulina Group',   type: 'Hardware Delivery',   team: 'External Vendor', sla: 'P2', status: 'pending', time: '3 h ago' },
  { id: 'TKT-4815', client: 'Oussama Riahi', org: 'Ooredoo',         type: 'Password Reset',      team: 'SD',  sla: 'P4', status: 'resolved',   time: '4 h ago' },
];

const alerts = [
  { icon: ShieldAlert, severity: 'critical', message: 'Ticket TKT-4818 not acknowledged for 60 min', time: '5 min ago' },
  { icon: Clock,       severity: 'high',     message: 'SLA breach in 12 min on TKT-4821',           time: '8 min ago' },
  { icon: Users,       severity: 'medium',   message: 'Client Sonia Kchaou has 4 open tickets',     time: '22 min ago' },
  { icon: Activity,    severity: 'medium',   message: 'Auto-assignment failed for TKT-4810',         time: '1 h ago' },
];

const messages = [
  { sender: 'Yassine (IT Lead)', preview: 'Routing rule updated for STB Bank tickets.', time: '3 min', unread: true },
  { sender: 'Lina (PKI)',        preview: 'Need clarification on TKT-4818 token model.', time: '21 min', unread: true },
  { sender: 'Hatem (Manager)',   preview: 'Great job clearing the backlog today.',       time: '1 h',   unread: false },
  { sender: 'Rim (SD)',          preview: 'Taking over Orange Tunisie escalations.',     time: '2 h',   unread: false },
];

const meetings = [
  { title: 'SLA review with BIAT', time: 'Today · 14:30', related: 'BIAT — Sonia Kchaou' },
  { title: 'PKI weekly sync',      time: 'Tomorrow · 10:00', related: 'Internal · PKI Team' },
  { title: 'Onboarding kickoff',   time: 'Wed · 09:00', related: 'Tunisie Telecom — Mehdi T.' },
];

export default function SDHomeDashboard({
  onCreateTicket,
  onManageOrganizations,
  onManageClients,
  onReviewAssignments,
  onMessages,
  onMeetings,
}) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sd-home-page">
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
          {kpis.map((k) => {
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
              {assignment.map((a) => (
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
              <p className="sd-panel-sub">Latest items across the work queue</p>
            </div>
            <button className="sd-link-btn">
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
                {recentTickets.map((t) => (
                  <tr key={t.id} className="sd-ticket-row">
                    <td className="sd-ticket-id">{t.id}</td>
                    <td>{t.client}</td>
                    <td className="sd-muted">{t.org}</td>
                    <td>{t.type}</td>
                    <td>
                      <span className={`sd-team-badge sd-team-${t.team.toLowerCase().replace(/\s/g, '-')}`}>
                        {t.team}
                      </span>
                    </td>
                    <td>
                      <span className={`sd-sla-badge sd-sla-${t.sla.toLowerCase()}`}>{t.sla}</span>
                    </td>
                    <td>
                      <span className={`sd-status-badge sd-status-${t.status}`}>
                        {t.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="sd-muted">{t.time}</td>
                    <td>
                      <button className="sd-row-action">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORG + CLIENTS */}
        <section className="sd-row sd-row-2">
          <div className="sd-panel sd-summary-card">
            <div className="sd-summary-head">
              <div className="sd-summary-icon"><Building2 size={18} /></div>
              <div>
                <h3 className="sd-summary-title">Organizations</h3>
                <p className="sd-panel-sub">CRM directory</p>
              </div>
            </div>
            <div className="sd-summary-stats">
              <div><span className="sd-stat-num">38</span><span className="sd-stat-lbl">Total</span></div>
              <div><span className="sd-stat-num">24</span><span className="sd-stat-lbl">With open tickets</span></div>
              <div><span className="sd-stat-num">Poulina</span><span className="sd-stat-lbl">Recently added</span></div>
            </div>
            <button className="sd-panel-btn" onClick={onManageOrganizations}>
              Manage Organizations <ArrowRight size={14} />
            </button>
          </div>

          <div className="sd-panel sd-summary-card">
            <div className="sd-summary-head">
              <div className="sd-summary-icon"><Users size={18} /></div>
              <div>
                <h3 className="sd-summary-title">Clients</h3>
                <p className="sd-panel-sub">Across all organizations</p>
              </div>
            </div>
            <div className="sd-summary-stats">
              <div><span className="sd-stat-num">1,264</span><span className="sd-stat-lbl">Total</span></div>
              <div><span className="sd-stat-num">+18</span><span className="sd-stat-lbl">New this week</span></div>
              <div><span className="sd-stat-num">87</span><span className="sd-stat-lbl">With open tickets</span></div>
            </div>
            <button className="sd-panel-btn" onClick={onManageClients}>
              Manage Clients <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* ALERTS + MESSAGES + MEETINGS */}
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
                <h2 className="sd-panel-title">Team Communication</h2>
                <p className="sd-panel-sub">Recent internal messages</p>
              </div>
              <MessageSquare size={16} className="sd-panel-icon" />
            </div>
            <ul className="sd-msg-list">
              {messages.map((m, i) => (
                <li key={i} className="sd-msg-item">
                  <div className="sd-msg-avatar">{m.sender.charAt(0)}</div>
                  <div className="sd-msg-body">
                    <div className="sd-msg-top">
                      <span className="sd-msg-sender">{m.sender}</span>
                      <span className="sd-muted sd-msg-time">{m.time}</span>
                    </div>
                    <p className="sd-msg-preview">{m.preview}</p>
                  </div>
                  {m.unread && <span className="sd-msg-dot" />}
                </li>
              ))}
            </ul>
            <button className="sd-panel-btn" onClick={onMessages}>
              Open Messages <ArrowRight size={14} />
            </button>
          </div>

          <div className="sd-panel">
            <div className="sd-panel-header">
              <div>
                <h2 className="sd-panel-title">Meetings & Follow-ups</h2>
                <p className="sd-panel-sub">Coming up</p>
              </div>
              <Calendar size={16} className="sd-panel-icon" />
            </div>
            <ul className="sd-meet-list">
              {meetings.map((m, i) => (
                <li key={i} className="sd-meet-item">
                  <div className="sd-meet-icon"><Briefcase size={14} /></div>
                  <div className="sd-meet-body">
                    <p className="sd-meet-title">{m.title}</p>
                    <span className="sd-muted sd-meet-meta">{m.time} · {m.related}</span>
                  </div>
                  <CheckCircle2 size={14} className="sd-meet-check" />
                </li>
              ))}
            </ul>
            <button className="sd-panel-btn" onClick={onMeetings}>
              View Meetings <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}