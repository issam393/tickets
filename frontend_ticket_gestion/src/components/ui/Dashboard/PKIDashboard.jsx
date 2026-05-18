import { GiCrenulatedShield } from 'react-icons/gi';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Activity,
  KeyRound,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import './PKIDashboard.css';

// Data arrays (unchanged)
const processingTickets = [
  { id: 'PKI-2024-001', title: 'Certificate Renewal - Production Environment', system: 'PKI Infrastructure', status: 'critical', tags: ['urgent', 'production'], date: '2 hours ago' },
  { id: 'PKI-2024-002', title: 'Key Rotation Schedule Review', system: 'Certificate Management', status: 'warning', tags: ['scheduled'], date: '4 hours ago' },
  { id: 'PKI-2024-003', title: 'Certificate Chain Validation Failure', system: 'Validation Service', status: 'critical', tags: ['critical', 'investigation'], date: '6 hours ago' },
  { id: 'PKI-2024-004', title: 'CSR Processing Backlog', system: 'Request Processing', status: 'warning', tags: ['backlog'], date: '8 hours ago' },
  { id: 'PKI-2024-005', title: 'Intermediate CA Certificate Expiration', system: 'CA Management', status: 'critical', tags: ['critical', 'urgent'], date: '10 hours ago' },
  { id: 'PKI-2024-006', title: 'OCSP Responder Configuration', system: 'OCSP Service', status: 'warning', tags: ['configuration'], date: '12 hours ago' },
  { id: 'PKI-2024-007', title: 'CRL Distribution Sync Issue', system: 'CRL Management', status: 'warning', tags: ['sync', 'distribution'], date: '14 hours ago' },
];

const resolvedTickets = [
  { id: 'PKI-2024-098', title: 'SSL Certificate Installation Complete', system: 'Certificate Deployment', status: 'success', tags: ['completed'], date: '1 hour ago' },
  { id: 'PKI-2024-099', title: 'Key Escrow Verification Passed', system: 'Security Compliance', status: 'success', tags: ['verified'], date: '3 hours ago' },
  { id: 'PKI-2024-100', title: 'Digital Signature Validation Fixed', system: 'Signature Service', status: 'success', tags: ['resolved'], date: '5 hours ago' },
  { id: 'PKI-2024-101', title: 'Certificate Pinning Updated', system: 'Application Security', status: 'success', tags: ['updated'], date: '7 hours ago' },
  { id: 'PKI-2024-102', title: 'Trust Store Synchronization Complete', system: 'Trust Management', status: 'success', tags: ['synced'], date: '9 hours ago' },
];



export default function Dashboard({ onViewAllTickets }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
              <h1>PKI Command Center</h1>
              <p className="hero-subtitle">
                Real-time monitoring of your certificate authority infrastructure
              </p>
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
                <p className="top-card-title">Total Tickets</p>
                <p className="top-card-value">47</p>
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
            <p className="stat-card-value">8</p>
            <p className="stat-card-trend up">
              <TrendingUp size={12} /> +2 since yesterday
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Warnings</span>
              <div className="stat-card-icon stat-card-warning">
                <Clock className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">16</p>
            <p className="stat-card-trend down">
              <TrendingDown size={12} /> -3 since yesterday
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">In Progress</span>
              <div className="stat-card-icon stat-card-muted">
                <Activity className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">23</p>
            <p className="stat-card-trend">5 assigned to you</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Resolved</span>
              <div className="stat-card-icon stat-card-success">
                <CheckCircle className="stat-card-icon-svg" />
              </div>
            </div>
            <p className="stat-card-value">47</p>
            <p className="stat-card-trend down">
              <TrendingUp size={12} /> +12 this week
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
                {processingTickets.map((ticket) => (
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
                                : tag === 'completed' || tag === 'verified'
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
                ))}
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
                {resolvedTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-card-header">
                      <div className="ticket-card-info">
                        <div className="ticket-card-id">{ticket.id}</div>
                        <h3 className="ticket-card-title">{ticket.title}</h3>
                      </div>
                      <span className={`ticket-status ticket-status-${ticket.status}`}>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}