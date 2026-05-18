import React, { useState } from 'react';
import {
  BarChart3, Users, Sparkles,
  ArrowUpRight, ArrowDownRight, Minus,
  TrendingUp, AlertTriangle,
  AlertCircle, AlertOctagon, Clock,
  Ticket, ChevronRight, Trophy,
} from 'lucide-react';

import {
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

import './ManagerDaschboard.css';

const kpis = {
  totalTickets: 248,
  resolutionRate: 78.4,
  avgResolutionHours: 14.2,
  activeTickets: 42,
  resolvedToday: 18,
  totalToday: 23,
};

const kpiList = [
  { label: 'Total Tickets', value: kpis.totalTickets, suffix: '', context: `${kpis.totalToday} today`, icon: Ticket, tone: 'primary', delta: { value: '+12%', positive: true } },
  { label: 'Resolution Rate', value: kpis.resolutionRate, suffix: '%', context: `${kpis.resolvedToday} resolved today`, icon: TrendingUp, tone: 'success', delta: { value: '+5%', positive: true } },
  { label: 'Avg Resolution', value: kpis.avgResolutionHours, suffix: 'h', context: 'Last 30 days', icon: Clock, tone: 'warning', delta: { value: '-8%', positive: true } },
  { label: 'Active Tickets', value: kpis.activeTickets, suffix: '', context: 'Require immediate action', icon: AlertCircle, tone: 'accent', delta: { value: '+3', positive: false } },
];

const ticketStatus = [
  { name: "Resolved", value: 156, color: "#10b981" },
  { name: "Pending User", value: 38, color: "#f59e0b" },
  { name: "Pending AGCE", value: 24, color: "#a855f7" },
  { name: "Skipped", value: 12, color: "#6b7280" },
  { name: "Known Issues", value: 18, color: "#ef4444" },
];

const flowStages = [
  { stage: "Created", time: "0.4h", count: 248, tone: "primary" },
  { stage: "Assigned", time: "1.2h", count: 240, tone: "accent" },
  { stage: "In Progress", time: "6.8h", count: 198, tone: "warning" },
  { stage: "Pending", time: "4.2h", count: 86, tone: "warning" },
  { stage: "Resolved", time: "1.6h", count: 156, tone: "success" },
];

const teamCards = [
  { team: "Delivery", members: 8, tickets: 112, avg: "11.4h", trend: "up", delta: "+12%" },
  { team: "PKI", members: 5, tickets: 78, avg: "9.8h", trend: "up", delta: "+6%" },
  { team: "IT Support", members: 4, tickets: 58, avg: "18.2h", trend: "down", delta: "-4%" },
];

const topEmployees = [
  { rank: 1, name: "Sara Khelifi", role: "Senior Engineer · Delivery", tickets: 42, avg: "8.2h", messages: 312, trend: "up", delta: "+18%" },
  { rank: 2, name: "Marc Dupont", role: "Engineer · Delivery", tickets: 38, avg: "9.6h", messages: 268, trend: "up", delta: "+11%" },
  { rank: 3, name: "Eva Larsson", role: "Lead · PKI", tickets: 36, avg: "10.1h", messages: 240, trend: "up", delta: "+7%" },
  { rank: 4, name: "Lina Haddad", role: "Engineer · PKI", tickets: 28, avg: "7.4h", messages: 198, trend: "flat", delta: "0%" },
  { rank: 5, name: "Yann Bensaid", role: "Specialist · PKI", tickets: 31, avg: "14.8h", messages: 224, trend: "down", delta: "-5%" },
  { rank: 6, name: "Nora Saidi", role: "Engineer · Delivery", tickets: 24, avg: "11.2h", messages: 176, trend: "up", delta: "+3%" },
];

const alerts = [
  { id: "TKT-2841", severity: "critical", problem: "Client signature pending — contract renewal blocked", stuck: "9d 4h", context: "waiting client" },
  { id: "TKT-2790", severity: "high", problem: "PKI certificate revocation chain unreachable", stuck: "5d 11h", context: "infrastructure" },
  { id: "TKT-2812", severity: "high", problem: "Validation backlog from compliance team", stuck: "4d 2h", context: "internal validation" },
  { id: "TKT-2855", severity: "medium", problem: "User account locked after 3 failed delivery attempts", stuck: "2d 6h", context: "waiting user" },
  { id: "TKT-2860", severity: "medium", problem: "Hardware token shipment delayed by carrier", stuck: "1d 18h", context: "logistics" },
];

const ticketsTrendData = [
  { day: "Mon", created: 32, resolved: 24 },
  { day: "Tue", created: 38, resolved: 30 },
  { day: "Wed", created: 41, resolved: 36 },
  { day: "Thu", created: 35, resolved: 38 },
  { day: "Fri", created: 44, resolved: 39 },
  { day: "Sat", created: 18, resolved: 22 },
  { day: "Sun", created: 12, resolved: 15 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#fff' }}>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



function TicketsTrendChart() {
  return (
    <GlassCard className="trend-card">
      <div style={{ marginBottom: '40px' }}>
        <div>
          <p style={{ color: "var(--primary)" }} className="trend-card__eyebrow">
            TREND · TICKETS OVER TIME
          </p>
          <h3 className="trend-card__title">Created vs Resolved</h3>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>  {/* ✅ nombre */}
        <AreaChart data={ticketsTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={14} stroke="#94a3b8" />
          <YAxis tickLine={false} axisLine={false} tickMargin={16} domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} stroke="#94a3b8" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'absolute', bottom: -10, left: -150, display: 'flex', flexDirection: 'column', gap: '8px' }} />
          <Area type="monotone" dataKey="created" stroke="#a855f7" fill="url(#createdGradient)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Created" />
          <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolvedGradient)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Resolved" />
        </AreaChart>
      </ResponsiveContainer>

    
    </GlassCard>
  );
}


function SimplePieChart() {
  const total = ticketStatus.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 260, height: 260 }}>
        <PieChart width={260} height={260}>
          <Pie
            data={ticketStatus}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {ticketStatus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{total}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Total Tickets</div>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        {ticketStatus.map((item) => (
          <div key={item.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '3px', 
                background: item.color,
                display: 'inline-block'
              }} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{item.value}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlassCard({ children, className = '', hover = true, ...props }) {
  return <div className={`glass-card ${hover ? 'glass-card--hover' : ''} ${className}`} {...props}>{children}</div>;
}

function CardTitle({ children, className = '' }) {
  return <h3 className={`card__title ${className}`}>{children}</h3>;
}

function CardSubtitle({ children }) {
  return <p className="card__subtitle">{children}</p>;
}

function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-icon-box">
            <BarChart3 className="header-icon" />
            <span className="pulse-dot" />
          </div>
          <div className="header-text">
            <h1 className="header-title">
              Manager Analytics
              <span className="text-gradient"> Dashboard</span>
            </h1>
            <p className="header-description">Performance monitoring and strategic insights</p>
            <p className="header-eyebrow">Manager Cockpit</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function KpiCard({ label, value, suffix, context, icon: Icon, tone = 'primary', delta }) {
  const toneClass = `kpi-card__icon--${tone}`;
  return (
    <GlassCard className="kpi-card">
      <div className={`kpi-card__bg ${toneClass}-bg`} />
      <div className="kpi-card__content">
        <div className="kpi-card__text">
          <p className="kpi-card__label">{label}</p>
          <div className="kpi-card__value">
            <span className="kpi-card__number">{value}</span>
            {suffix && <span className="kpi-card__suffix">{suffix}</span>}
          </div>
          {context && <p className="kpi-card__context">{context}</p>}
        </div>
        <div className={`kpi-card__icon-wrapper ${toneClass}`}>
          <Icon className="kpi-card__icon" />
        </div>
      </div>
      {delta && (
        <div className={`delta-badge ${delta.positive ? 'delta-badge--positive' : 'delta-badge--negative'}`}>
          {delta.positive ? <ArrowUpRight className="icon-small" /> : <ArrowDownRight className="icon-small" />}
          {delta.value}
        </div>
      )}
    </GlassCard>
  );
}

function TeamCards() {
  return (
    <div className="section-wrapper">
      <div className="section-label">Team Performance</div>
      <div className="team-cards">
        {teamCards.map((t) => (
          <GlassCard key={t.team} className="team-card">
            <div className="team-card__header">
              <div>
                <p className="team-card__team-name">{t.team}</p>
                <p className="team-card__members">{t.members} members</p>
              </div>
              <div className="team-card__icon"><Users className="icon" /></div>
            </div>
            <div className="team-card__stats">
              <div>
                <p className="team-card__stat-label">Tickets</p>
                <p className="team-card__stat-value">{t.tickets}</p>
              </div>
              <div>
                <p className="team-card__stat-label">Avg time</p>
                <p className="team-card__stat-value">{t.avg}</p>
              </div>
            </div>
            <div className={`trend-badge ${t.trend === 'up' ? 'trend-badge--positive' : t.trend === 'down' ? 'trend-badge--negative' : 'trend-badge--neutral'}`}>
              {t.trend === 'up' ? <ArrowUpRight className="icon-small" /> : t.trend === 'down' ? <ArrowDownRight className="icon-small" /> : <Minus className="icon-small" />}
              {t.delta} this week
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function TopEmployees() {
  return (
    <GlassCard className="leaderboard-section">
      <div className="leaderboard-header">
        <div>
          <CardTitle>Top Performers</CardTitle>
          <CardSubtitle>Based on tickets resolved and activity</CardSubtitle>
        </div>
        <Trophy className="icon leaderboard-icon" />
      </div>
      <div className="employee-list">
        {topEmployees.map((e) => (
          <div key={e.rank} className="employee-row">
            <div className={`rank-badge rank-badge--${e.rank}`}>
              {e.rank === 1 ? <Trophy className="icon-small" /> : `#${e.rank}`}
            </div>
            <div className="employee-row__info">
              <div className="employee-row__name">{e.name}</div>
              <div className="employee-row__role">{e.role}</div>
            </div>
            <div className="employee-row__stats">
              <div className="stat-mini">
                <span className="stat-mini__value">{e.tickets}</span>
                <span className="stat-mini__label">Tickets</span>
              </div>
              <div className="stat-mini">
                <span className="stat-mini__value">{e.avg}</span>
                <span className="stat-mini__label">Avg time</span>
              </div>
              <div className="stat-mini">
                <span className="stat-mini__value">{e.messages}</span>
                <span className="stat-mini__label">Messages</span>
              </div>
            </div>
            <div className={`trend-badge-small trend-badge--${e.trend === 'up' ? 'positive' : e.trend === 'down' ? 'negative' : 'neutral'}`}>
              {e.trend === 'up' ? <ArrowUpRight className="icon-small" /> : e.trend === 'down' ? <ArrowDownRight className="icon-small" /> : <Minus className="icon-small" />}
              {e.delta}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function AlertsSection() {
  return (
    <GlassCard className="alerts-section">
      <div className="alerts-header">
        <div>
          <CardTitle>Critical Alerts</CardTitle>
          <CardSubtitle>{alerts.length} active issues requiring attention</CardSubtitle>
        </div>
        <AlertOctagon className="icon alerts-icon" />
      </div>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert--${alert.severity}`}>
            <div className="alert__icon">
              {alert.severity === 'critical' ? (
                <AlertOctagon className="icon-small" />
              ) : (
                <AlertTriangle className="icon-small" />
              )}
            </div>
            <div className="alert__body">
              <div className="alert__meta">
                <span className="alert__id">{alert.id}</span>
                <span className="alert__badge">{alert.severity}</span>
                <span className="alert__context">{alert.context}</span>
              </div>
              <p className="alert__problem">{alert.problem}</p>
            </div>
            <div className="alert__time">
              <Clock className="icon-small" />
              {alert.stuck}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function VisualizationSection() {
  return (
    <div className="visualization-grid">
      <GlassCard>
        <CardTitle>Ticket Status Distribution</CardTitle>
        <div className="chart-wrapper" style={{ padding: '20px 0' }}>
          <SimplePieChart />
        </div>
      </GlassCard>
      <TicketsTrendChart />
    </div>
  );
}

function FlowDiagram() {
  return (
    <GlassCard className="flow-section">
      <div className="flow-header">
        <CardTitle>Ticket Flow Analysis</CardTitle>
        <CardSubtitle>Average time in each stage and volume</CardSubtitle>
      </div>
      <div className="flow-diagram">
        {flowStages.map((stage, idx) => (
          <div key={stage.stage} className="flow-item">
            <div className={`flow-stage flow-stage--${stage.tone}`}>
              <div className="flow-stage__label">{stage.stage}</div>
              <div className="flow-stage__time">{stage.time}</div>
              <div className="flow-stage__count">{stage.count} tickets</div>
            </div>
            {idx < flowStages.length - 1 && <ChevronRight className="flow-arrow" />}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function ManagerDashboard() {
  return (
    <div className="dashboard">
      <DashboardHeader />
      <div className="dashboard-content">
        {/* KPI Summary */}
        <section className="section">
          <div className="section-label">Key Performance Indicators</div>
          <div className="kpi-grid">
            {kpiList.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </section>

        {/* Team Performance */}
        <section className="section">
          <TeamCards />
        </section>

        {/* Main Visualizations */}
        <section className="section">
          <VisualizationSection />
        </section>

        {/* Ticket Flow */}
        <section className="section">
          <FlowDiagram />
        </section>

        {/* Top Performers */}
        <section className="section">
          <TopEmployees />
        </section>

        {/* Risk & Alerts */}
        <section className="section risk-alerts-section">
          <div className="risk-alerts-grid">
            <AlertsSection />
          </div>
        </section>
      </div>
    </div>
  );
}