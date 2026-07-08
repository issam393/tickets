import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ORIGIN } from "../../../lib/apiConfig";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  CalendarDays,
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './ManagerDaschboard.css';

const API_BASE = API_ORIGIN;
const CHART_COLORS = ['#00d9ff', '#00f5a0', '#ffa500', '#7c3aed', '#ff4757', '#94a3b8'];
const PERIOD_OPTIONS = [
  { value: 'yearly', label: 'Year' },
  { value: 'monthly', label: 'Month' },
  { value: 'weekly', label: 'Week' },
  { value: 'daily', label: 'Day' },
];
const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad2(value) {
  return String(value).padStart(2, '0');
}

function getIsoWeekValue(date) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${pad2(week)}`;
}

function getInitialAnalyticsSelection() {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    week: getIsoWeekValue(now),
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
  };
}

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

function formatDay(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatBucket(date, period) {
  if (!date) return '';
  const parsed = new Date(date);
  if (period === 'yearly') return parsed.toLocaleDateString('en-US', { month: 'short' });
  if (period === 'daily') return parsed.toLocaleTimeString('en-US', { hour: 'numeric' });
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function AnalyticsVolumeChart({ data, period }) {
  if (!data.length) return <EmptyState>No tickets were recorded for this period.</EmptyState>;
  const normalized = data.map((item) => ({ ...item, label: formatBucket(item.bucket, period) }));

  return (
    <ResponsiveContainer width="100%" height={285}>
      <AreaChart data={normalized} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="managerDetailCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#00d9ff" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="managerDetailResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#00f5a0" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#94a3b8" />
        <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="created" name="Created" stroke="#00d9ff" fill="url(#managerDetailCreated)" strokeWidth={3} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#00f5a0" fill="url(#managerDetailResolved)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ResolutionTrendChart({ data, period }) {
  if (!data.length) return <EmptyState>No resolved ticket data for this period.</EmptyState>;
  const normalized = data.map((item) => ({
    ...item,
    label: formatBucket(item.bucket, period),
    hours: item.avgResolutionMinutes === null ? null : Number((item.avgResolutionMinutes / 60).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={285}>
      <LineChart data={normalized} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#94a3b8" />
        <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" unit="h" />
        <Tooltip formatter={(value) => [`${value}h`, 'Average resolution']} />
        <Line type="monotone" dataKey="hours" name="Average resolution" stroke="#ffa500" strokeWidth={3} dot={{ fill: '#ffa500', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AgentPerformanceChart({ data }) {
  if (!data.length) return <EmptyState>No employee activity for this period.</EmptyState>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 34, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} stroke="#94a3b8" allowDecimals={false} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" width={118} />
        <Tooltip />
        <Legend />
        <Bar dataKey="ticketsCreated" name="Tickets" stackId="activity" fill="#00d9ff" />
        <Bar dataKey="commentsAdded" name="Comments" stackId="activity" fill="#7c3aed" />
        <Bar dataKey="assignments" name="Assignments" stackId="activity" fill="#00f5a0" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('weekly');
  const [analyticsSelection, setAnalyticsSelection] = useState(getInitialAnalyticsSelection);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

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

  const loadAnalytics = async (period, selection) => {
    const token = getToken();
    if (!token) {
      setAnalyticsError('Session expired. Please login again.');
      return;
    }
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const query = new URLSearchParams({ period });
      if (period === 'yearly') query.set('year', selection.year);
      if (period === 'monthly') {
        query.set('year', selection.year);
        query.set('month', selection.month);
      }
      if (period === 'weekly') query.set('week', selection.week);
      if (period === 'daily') query.set('date', selection.date);
      const response = await fetch(`${API_BASE}/api/dashboard/manager/analytics?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Detailed analytics could not be loaded.');
      }
      setAnalytics(payload.data);
    } catch (err) {
      const message = err.message || 'Detailed analytics could not be loaded.';
      setAnalyticsError(message);
      toast.error(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'details') {
      loadAnalytics(analyticsPeriod, analyticsSelection);
    }
  }, [activeTab, analyticsPeriod, analyticsSelection]);

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
      { icon: GitBranch, label: 'Waiting assignment', value: safeNumber(workflow.waitingForAssignment), helper: `${minutesToHours(stats.avgAssignmentMinutes)} avg assignment`, tone: 'warning' },
      { icon: Users, label: 'Contacts', value: safeNumber(dashboard?.contactsSummary?.totalContacts), helper: `${safeNumber(dashboard?.contactsSummary?.totalOrganizations)} organizations`, tone: 'primary' },
    ];
  }, [dashboard]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = (analytics?.filters?.availableYears || []).map(Number).filter(Boolean);
    const selectedYear = Number(analyticsSelection.year);
    return [...new Set([currentYear, selectedYear, ...years])].filter(Boolean).sort((a, b) => b - a);
  }, [analytics, analyticsSelection.year]);

  if (loading) return <StateCard type="loading" message="Real analytics are being loaded from the backend." />;
  if (error) return <StateCard type="error" message={error} onRetry={loadDashboard} />;
  if (!dashboard) return <StateCard type="error" message="No dashboard payload returned by the backend." onRetry={loadDashboard} />;

  const stats = dashboard.ticketStats || {};
  const charts = dashboard.charts || {};
  const crud = dashboard.crudSummary || {};
  const currentUser = dashboard.currentUser || {};
  const detailSummary = analytics?.summary || {};
  const detailKpis = [
    { icon: Ticket, label: 'Tickets created', value: safeNumber(detailSummary.totalTickets), helper: analytics?.periodLabel || '', tone: 'primary' },
    { icon: ShieldCheck, label: 'Resolved', value: safeNumber(detailSummary.resolvedTickets), helper: `${safeNumber(detailSummary.pendingTickets)} pending`, tone: 'success' },
    { icon: AlertOctagon, label: 'Critical + Warning', value: safeNumber(detailSummary.criticalTickets) + safeNumber(detailSummary.warningTickets), helper: 'During selected period', tone: 'warning' },
    { icon: GitBranch, label: 'Awaiting assignment', value: safeNumber(detailSummary.awaitingAssignment), helper: 'Excludes Level 1 SD', tone: 'warning' },
    { icon: Users, label: 'Contacts created', value: safeNumber(detailSummary.contactsCreated), helper: `${safeNumber(detailSummary.organizationsCreated)} organizations`, tone: 'primary' },
  ];

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
        <div className="manager-view-tabs" role="tablist" aria-label="Manager dashboard views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'general'}
            className={`manager-view-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            className={`manager-view-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {activeTab === 'general' ? (
        <>
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

        <section className="section manager-grid manager-grid--two">
          <GlassCard>
            <SectionHeader title="Assignment distribution" subtitle="IT, PKI and unassigned workload" icon={GitBranch} />
            <div className="manager-mini-metrics">
              <span><strong>{safeNumber(stats.assignedToIT)}</strong> IT</span>
              <span><strong>{safeNumber(stats.assignedToPKI)}</strong> PKI</span>
              <span><strong>{safeNumber(stats.notAssigned)}</strong> Unassigned</span>
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
        </>
        ) : (
        <>
          <section className="section">
            <GlassCard className="manager-filter-panel">
              <SectionHeader title="Detailed analytics" subtitle="Time-scoped supervision metrics" icon={CalendarDays} />
              <div className="manager-period-filter" role="group" aria-label="Analytics time filter">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={analyticsPeriod === option.value ? 'active' : ''}
                    onClick={() => setAnalyticsPeriod(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="manager-value-filter">
                {analyticsPeriod === 'yearly' && (
                  <label>
                    Selected year
                    <select
                      value={analyticsSelection.year}
                      onChange={(event) => setAnalyticsSelection((value) => ({ ...value, year: event.target.value }))}
                    >
                      {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </label>
                )}
                {analyticsPeriod === 'monthly' && (
                  <>
                    <label>
                      Month
                      <select
                        value={analyticsSelection.month}
                        onChange={(event) => setAnalyticsSelection((value) => ({ ...value, month: event.target.value }))}
                      >
                        {MONTH_OPTIONS.map((month, index) => (
                          <option key={month} value={index + 1}>{month}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Year
                      <select
                        value={analyticsSelection.year}
                        onChange={(event) => setAnalyticsSelection((value) => ({ ...value, year: event.target.value }))}
                      >
                        {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </label>
                  </>
                )}
                {analyticsPeriod === 'weekly' && (
                  <label>
                    Selected week
                    <input
                      type="week"
                      value={analyticsSelection.week}
                      onChange={(event) => setAnalyticsSelection((value) => ({ ...value, week: event.target.value }))}
                    />
                  </label>
                )}
                {analyticsPeriod === 'daily' && (
                  <label>
                    Selected day
                    <input
                      type="date"
                      value={analyticsSelection.date}
                      onChange={(event) => setAnalyticsSelection((value) => ({ ...value, date: event.target.value }))}
                    />
                  </label>
                )}
              </div>
            </GlassCard>
          </section>

          {analyticsLoading ? (
            <section className="section">
              <GlassCard className="manager-inline-state">Loading detailed analytics...</GlassCard>
            </section>
          ) : analyticsError ? (
            <section className="section">
              <GlassCard className="manager-inline-state manager-inline-state--error">
                <p>{analyticsError}</p>
                <button onClick={() => loadAnalytics(analyticsPeriod, analyticsSelection)}>Retry</button>
              </GlassCard>
            </section>
          ) : analytics ? (
            <>
              <section className="section">
                <span className="section-label">{analytics.periodLabel} summary</span>
                <div className="kpi-grid">
                  {detailKpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
                </div>
              </section>

              <section className="section manager-grid manager-grid--charts">
                <GlassCard>
                  <SectionHeader title="Created vs resolved" subtitle="Real ticket lifecycle trend" icon={Activity} />
                  <AnalyticsVolumeChart data={analytics.volume || []} period={analytics.period} />
                </GlassCard>
                <GlassCard>
                  <SectionHeader title="Resolution time trend" subtitle="Average completion time in hours" icon={Clock} />
                  <ResolutionTrendChart data={analytics.resolutionTrend || []} period={analytics.period} />
                </GlassCard>
              </section>

              <section className="section">
                <GlassCard>
                  <SectionHeader title="Employee activity" subtitle="Tickets, comments and assignments" icon={Users} />
                  <AgentPerformanceChart data={analytics.agents || []} />
                </GlassCard>
              </section>

              <section className="section">
                <GlassCard>
                  <SectionHeader title="Handling distribution" subtitle="Service workload in selected period" icon={GitBranch} />
                  <div className="manager-detail-distribution">
                    {(analytics.services || []).map((service) => (
                      <div key={service.name}>
                        <strong>{service.value}</strong>
                        <span>{service.name}</span>
                      </div>
                    ))}
                    {!(analytics.services || []).length && <EmptyState>No assignment data for this period.</EmptyState>}
                  </div>
                </GlassCard>
              </section>
            </>
          ) : null}
        </>
        )}
      </div>
    </div>
  );
}
