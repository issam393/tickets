import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  Clock,
  GitBranch,
  PieChart as PieChartIcon,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './ManagerDaschboard.css';

const API_BASE = 'http://localhost:2300';
const CHART_COLORS = ['#00d9ff', '#00f5a0', '#ffa500', '#7c3aed', '#ff4757', '#94a3b8'];

function getToken() {
  return localStorage.getItem('token');
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

function formatDay(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function safeNumber(value) {
  return Number(value) || 0;
}

function GlassCard({ children, className = '' }) {
  return <div className={`glass-card glass-card--hover ${className}`}>{children}</div>;
}

function StateCard({ type, message, onRetry }) {
  return (
    <div className="dashboard dashboard-state-page">
      <GlassCard className={`dashboard-state dashboard-state--${type}`}>
        <AlertOctagon />
        <h2>{type === 'loading' ? 'Loading dashboard' : 'Unable to load dashboard'}</h2>
        <p>{message}</p>
        {onRetry && <button onClick={onRetry}>Retry</button>}
      </GlassCard>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, helper, tone = 'primary' }) {
  return (
    <GlassCard className="kpi-card">
      <div className={`kpi-card__bg ${tone}-bg`} />
      <div className="kpi-card__content">
        <div className="kpi-card__text">
          <p className="kpi-card__label">{label}</p>
          <div className="kpi-card__value">
            <span className="kpi-card__number">{value}</span>
          </div>
          <p className="kpi-card__context">{helper}</p>
        </div>
        <div className={`kpi-card__icon-wrapper ${tone}`}>
          <Icon className="kpi-card__icon" />
        </div>
      </div>
    </GlassCard>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="manager-section-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {Icon && <Icon />}
    </div>
  );
}

function EmptyState({ children = 'No data available yet.' }) {
  return <div className="manager-empty-state">{children}</div>;
}

function StatusPie({ data, total }) {
  if (!data.length) return <EmptyState>No ticket status data yet.</EmptyState>;

  return (
    <div className="manager-chart-split">
      <ResponsiveContainer width={240} height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="manager-chart-legend">
        <strong>{total} tickets</strong>
        {data.map((item, index) => (
          <span key={item.name}>
            <i style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
            {item.name}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  if (!data.length) return <EmptyState>No created/resolved trend yet.</EmptyState>;

  const normalized = data.map((item) => ({
    ...item,
    day: formatDay(item.day),
    created: safeNumber(item.created),
    resolved: safeNumber(item.resolved),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={normalized} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="managerCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#00d9ff" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="managerResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#00f5a0" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" />
        <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="created" name="Created" stroke="#00d9ff" fill="url(#managerCreated)" strokeWidth={3} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#00f5a0" fill="url(#managerResolved)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActivityFeed({ items }) {
  if (!items.length) return <EmptyState>No recent activity has been recorded.</EmptyState>;

  return (
    <div className="manager-activity-list">
      {items.map((item) => (
        <div className="manager-activity-item" key={item.id}>
          <span className="manager-activity-dot" />
          <div>
            <p>{item.description}</p>
            <small>{item.actorName || item.actorRole || 'System'} · {formatDate(item.createdAt)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    const token = getToken();
    if (!token) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/dashboard/manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Dashboard data could not be loaded.');
      }

      setDashboard(payload.data);
    } catch (err) {
      const message = err.message || 'Dashboard data could not be loaded.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = useMemo(() => {
    const stats = dashboard?.ticketStats || {};
    const workflow = dashboard?.workflowAnalytics || {};
    const total = safeNumber(stats.totalTickets);
    const resolved = safeNumber(stats.resolvedTickets);
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

    return [
      { icon: Ticket, label: 'Total tickets', value: total, helper: `${safeNumber(stats.createdToday)} created today`, tone: 'primary' },
      { icon: ShieldCheck, label: 'Resolved tickets', value: resolved, helper: `${resolutionRate}% resolution rate`, tone: 'success' },
      { icon: AlertOctagon, label: 'Critical + Warning', value: safeNumber(stats.criticalTickets) + safeNumber(stats.warningTickets), helper: 'Tickets requiring supervision', tone: 'warning' },
      {
        icon: Clock,
        label: 'Avg resolution',
        value: minutesToHours(stats.avgResolutionMinutes),
        helper: safeNumber(stats.resolvedTickets) ? `${safeNumber(stats.resolvedTickets)} resolved tickets` : 'No resolved tickets yet',
        tone: 'accent'
      },
      { icon: GitBranch, label: 'Waiting assignment', value: safeNumber(workflow.waitingForAssignment), helper: `${minutesToHours(stats.avgAssignmentMinutes)} avg assignment`, tone: 'warning' },
      { icon: Users, label: 'Contacts', value: safeNumber(dashboard?.contactsSummary?.totalContacts), helper: `${safeNumber(dashboard?.contactsSummary?.totalOrganizations)} organizations`, tone: 'primary' },
    ];
  }, [dashboard]);

  if (loading) return <StateCard type="loading" message="Real analytics are being loaded from the backend." />;
  if (error) return <StateCard type="error" message={error} onRetry={loadDashboard} />;
  if (!dashboard) return <StateCard type="error" message="No dashboard payload returned by the backend." onRetry={loadDashboard} />;

  const stats = dashboard.ticketStats || {};
  const workflow = dashboard.workflowAnalytics || {};
  const charts = dashboard.charts || {};
  const contacts = dashboard.contactsSummary || {};
  const crud = dashboard.crudSummary || {};
  const currentUser = dashboard.currentUser || {};

  return (
    <div className="dashboard manager-dynamic-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon-box">
              <BarChart3 className="header-icon" />
              <span className="pulse-dot" />
            </div>
            <div className="header-text">
              <p className="header-eyebrow">Manager Cockpit · Read only</p>
              <h1 className="header-title">Manager Analytics <span className="text-gradient">Dashboard</span></h1>
              <p className="header-description">
                {currentUser.name || 'Manager'} · {currentUser.role || 'Manager'} · {currentUser.service || 'Supervision'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="section">
          <span className="section-label">Dynamic KPI cards</span>
          <div className="kpi-grid">
            {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
          </div>
        </section>

        <section className="section manager-grid manager-grid--charts">
          <GlassCard>
            <SectionHeader title="Ticket status distribution" subtitle="Calculated from current database rows" icon={PieChartIcon} />
            <StatusPie data={charts.statusDistribution || []} total={safeNumber(stats.totalTickets)} />
          </GlassCard>
          <GlassCard>
            <SectionHeader title="Created vs resolved" subtitle="Real ticket lifecycle trend" icon={Activity} />
            <TrendChart data={charts.createdVsResolved || []} />
          </GlassCard>
        </section>

        <section className="section manager-grid manager-grid--three">
          <GlassCard>
            <SectionHeader title="Assignment distribution" subtitle="IT, PKI and unassigned workload" icon={GitBranch} />
            <div className="manager-mini-metrics">
              <span><strong>{safeNumber(stats.assignedToIT)}</strong> IT</span>
              <span><strong>{safeNumber(stats.assignedToPKI)}</strong> PKI</span>
              <span><strong>{safeNumber(stats.notAssigned)}</strong> Unassigned</span>
            </div>
          </GlassCard>
          <GlassCard>
            <SectionHeader title="Workflow timing" subtitle="Average operational timing" icon={Clock} />
            <div className="manager-mini-metrics">
              <span><strong>{minutesToHours(workflow.avgCreationToAssignmentMinutes)}</strong> creation to assignment</span>
              <span><strong>{minutesToHours(workflow.avgAssignmentToResolutionMinutes)}</strong> assignment to resolution</span>
              <span><strong>{safeNumber(workflow.delayed48h)}</strong> delayed over 48h</span>
            </div>
          </GlassCard>
          <GlassCard>
            <SectionHeader title="CRUD activity" subtitle="Objects created in the system" icon={Building2} />
            <div className="manager-mini-metrics">
              <span><strong>{safeNumber(crud.organizationsCreated)}</strong> organizations</span>
              <span><strong>{safeNumber(crud.contactsCreated)}</strong> contacts</span>
              <span><strong>{safeNumber(crud.meetingsCreated)}</strong> meetings</span>
              <span><strong>{safeNumber(crud.commentsCreated) + safeNumber(crud.messagesCreated)}</strong> comments/messages</span>
            </div>
          </GlassCard>
        </section>

        <section className="section">
          <GlassCard>
            <SectionHeader title="Recent activity feed" subtitle="CRUD and workflow activity" icon={Activity} />
            <ActivityFeed items={dashboard.recentActivity || []} />
          </GlassCard>
        </section>

        <section className="section manager-grid manager-grid--two">
          <GlassCard>
            <SectionHeader title="Read-only contacts overview" subtitle="Organizations and clients without CRUD actions" icon={Users} />
            <div className="manager-mini-metrics">
              <span><strong>{safeNumber(contacts.totalOrganizations)}</strong> total organizations</span>
              <span><strong>{safeNumber(contacts.totalContacts)}</strong> total contacts</span>
              <span><strong>{safeNumber(contacts.newOrganizationsThisWeek)}</strong> new organizations this week</span>
              <span><strong>{safeNumber(contacts.contactsWithUnresolvedTickets)}</strong> contacts with unresolved tickets</span>
            </div>
            <div className="manager-readonly-list">
              {(contacts.organizations || []).slice(0, 5).map((org) => (
                <div key={org.id}>
                  <strong>{org.name}</strong>
                  <span>{safeNumber(org.contactsCount)} contacts · {safeNumber(org.ticketsCount)} tickets</span>
                </div>
              ))}
              {!(contacts.organizations || []).length && <EmptyState>No organizations yet.</EmptyState>}
            </div>
          </GlassCard>
          <GlassCard>
            <SectionHeader title="Delayed tickets" subtitle="Open tickets requiring attention" icon={AlertOctagon} />
            <div className="manager-readonly-list">
              {(dashboard.delayedTickets || []).map((ticket) => (
                <div key={ticket.id}>
                  <strong>{ticket.request_code || `Ticket #${ticket.id}`} · {ticket.assignedService}</strong>
                  <span>{ticket.issue_type} · {ticket.issue_level} · {safeNumber(ticket.ageHours)}h pending</span>
                </div>
              ))}
              {!(dashboard.delayedTickets || []).length && <EmptyState>No delayed tickets.</EmptyState>}
            </div>
          </GlassCard>
        </section>

        <section className="section">
          <GlassCard>
            <SectionHeader title="Employee activity summary" subtitle="Created tickets, comments and assignments" icon={Users} />
            <div className="manager-employee-grid">
              {(dashboard.employeeActivity || []).map((employee) => (
                <div className="manager-employee-card" key={employee.id}>
                  <strong>{employee.name}</strong>
                  <span>{employee.service || 'No service'}</span>
                  <small>{safeNumber(employee.ticketsCreated)} tickets · {safeNumber(employee.commentsCreated)} comments · {safeNumber(employee.assignmentsMade)} assignments</small>
                </div>
              ))}
              {!(dashboard.employeeActivity || []).length && <EmptyState>No employee activity yet.</EmptyState>}
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
