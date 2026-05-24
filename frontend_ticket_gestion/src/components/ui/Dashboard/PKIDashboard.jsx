import { GiCrenulatedShield } from 'react-icons/gi';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import './PKIDashboard.css';

// Decode JWT to get user info
function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      service: payload.service,
    };
  } catch {
    return null;
  }
}

export default function Dashboard({ role, onViewAllTickets }) {
  const [now, setNow] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warnings: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [processingTickets, setProcessingTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getUserFromToken();
  const service = role || user?.service;
  const teamLabel = service === 'PKI' ? 'PKI' : service === 'IT' ? 'IT' : 'Team';

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        setLoading(true);
        const response = await fetch('http://localhost:2300/api/tickets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Failed to load tickets');

        const tickets = payload.data || [];

        // Filter for PKI or IT based on allowed_services
        const teamTickets = tickets.filter((t) => {
          if (service === 'SD' || service === 'Manager') return true;
          if (!t.allowed_services) return false;
          const allowed = Array.isArray(t.allowed_services)
            ? t.allowed_services
            : typeof t.allowed_services === 'string'
            ? JSON.parse(t.allowed_services)
            : [];
          return allowed.includes(service);
        });

        const isCritical = (ticket) => {
          const status = String(ticket.status || '').toLowerCase();
          const level = String(ticket.issue_level || '').toLowerCase();
          return status === 'critical' || level.includes('critical');
        };
        const isWarning = (ticket) => {
          const status = String(ticket.status || '').toLowerCase();
          const level = String(ticket.issue_level || '').toLowerCase();
          return status === 'warning' || level.includes('warning');
        };

        const critical = teamTickets.filter(isCritical).length;
        const warnings = teamTickets.filter(isWarning).length;
        const resolved = teamTickets.filter((t) => t.status === 'Resolved');
        const processing = teamTickets.filter((t) => t.status !== 'Resolved');

        setStats({
          total: teamTickets.length,
          critical,
          warnings,
          inProgress: processing.length,
          resolved: resolved.length,
        });

        setProcessingTickets(
          processing.slice(0, 7).map((t) => ({
            id: t.request_code || `TKT-${t.id}`,
            title: t.issue_description?.substring(0, 60) || 'No description',
            system: t.application || 'N/A',
            status: t.issue_level?.toLowerCase() || 'pending',
            tags: [t.issue_type || 'general'],
            date: new Date(t.createdAt).toLocaleString(),
          }))
        );

        setResolvedTickets(
          resolved.slice(0, 5).map((t) => ({
            id: t.request_code || `TKT-${t.id}`,
            title: t.issue_description?.substring(0, 60) || 'No description',
            system: t.application || 'N/A',
            status: 'success',
            tags: ['resolved'],
            date: new Date(t.updatedAt).toLocaleString(),
          }))
        );
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [service]);

  const greeting = user
    ? `Welcome back, ${user.firstName}`
    : `Welcome to ${teamLabel} Command Center`;

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        {/* HERO HEADER */}
        <header className="dashboard-hero">
          <div className="hero-left">
            <div className="hero-shield">
              <GiCrenulatedShield />
            </div>
            <div className="hero-title-block">
              <h1>{service === 'PKI' ? 'PKI Command Center' : service === 'IT' ? 'IT Command Center' : `${teamLabel} Command Center`}</h1>
              <p className="hero-subtitle">{greeting}</p>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-status-pill">
              <span className="hero-status-dot" />
              All Systems Operational
            </div>
            <div className="hero-time">
              {now
                ? now.toLocaleString('en-US', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : ''}
            </div>
          </div>
        </header>

        {/* TOP CARDS */}
        <div className="top-cards-grid">
          <div className="top-card">
            <div className="top-card-inner">
              <div>
                <p className="top-card-title">Total {teamLabel} Tickets</p>
                <p className="top-card-value">{stats.total}</p>
              </div>
              <div className="top-card-icon-wrapper">
                <AlertCircle className="top-card-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Critical Issues</span>
              <div className="stat-card-icon stat-card-critical">
                <AlertCircle className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">{stats.critical}</p>
            <p className="stat-card-trend up">
              <TrendingUp size={12} /> {stats.critical} open
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Warnings</span>
              <div className="stat-card-icon stat-card-warning">
                <Clock className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">{stats.warnings}</p>
            <p className="stat-card-trend down">
              <TrendingDown size={12} /> {stats.warnings} pending
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">In Progress</span>
              <div className="stat-card-icon stat-card-muted">
                <Activity className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">{stats.inProgress}</p>
            <p className="stat-card-trend">Active tickets</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Resolved</span>
              <div className="stat-card-icon stat-card-success">
                <CheckCircle className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">{stats.resolved}</p>
            <p className="stat-card-trend down">
              <TrendingUp size={12} /> Completed
            </p>
          </div>
        </div>

        {/* TICKETS GRID */}
        <div className="tickets-sections-grid">
          {/* Processing */}
          <div className="tickets-section" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
            <div className="section-header">
              <h2 className="section-header-title">Tickets for Processing</h2>
              <button className="section-header-button" onClick={onViewAllTickets}>
                View All
                <svg className="section-header-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="scroll-area">
              <div className="tickets-list">
                {loading ? (
                  <p style={{ padding: '1rem', color: 'var(--foreground)' }}>Loading...</p>
                ) : processingTickets.length === 0 ? (
                  <p style={{ padding: '1rem', color: 'var(--foreground)' }}>No tickets to process</p>
                ) : (
                  processingTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-card-header">
                        <div className="ticket-card-info">
                          <div className="ticket-card-id">{ticket.id}</div>
                          <h3 className="ticket-card-title">{ticket.title}</h3>
                          <p className="ticket-card-system">{ticket.system}</p>
                        </div>
                        <span className={`ticket-status ticket-status-${ticket.status}`}>
                          <span>●</span>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                      <div className="ticket-card-footer">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {ticket.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`ticket-tag ${
                                tag === 'urgent' || tag === 'critical'
                                  ? 'ticket-tag-critical'
                                  : tag === 'completed' || tag === 'verified' || tag === 'resolved'
                                    ? 'ticket-tag-success'
                                    : 'ticket-tag-primary'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="ticket-date">{ticket.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recently Resolved */}
          <div className="tickets-section" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
            <div className="section-header">
              <h2 className="section-header-title">Recently Resolved</h2>
            </div>

            <div className="scroll-area">
              <div className="tickets-list">
                {loading ? (
                  <p style={{ padding: '1rem', color: 'var(--foreground)' }}>Loading...</p>
                ) : resolvedTickets.length === 0 ? (
                  <p style={{ padding: '1rem', color: 'var(--foreground)' }}>No resolved tickets yet</p>
                ) : (
                  resolvedTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-card-header">
                        <div className="ticket-card-info">
                          <div className="ticket-card-id">{ticket.id}</div>
                          <h3 className="ticket-card-title">{ticket.title}</h3>
                        </div>
                        <span className="ticket-status ticket-status-success">
                          <span>●</span>
                          Resolved
                        </span>
                      </div>
                      <div className="ticket-card-footer">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {ticket.tags.map((tag, idx) => (
                            <span key={idx} className="ticket-tag ticket-tag-success">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="ticket-date">{ticket.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
