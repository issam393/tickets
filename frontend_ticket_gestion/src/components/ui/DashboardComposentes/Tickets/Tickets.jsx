import { IoTicketSharp } from "react-icons/io5";
import React, { useState } from "react";
import { Search, Lock } from "lucide-react";

import "./Tickets.css";

const Tickets = ({onSelectTicket}) => {

  const allRows = [
    {
      id: "REQ-2026-0002",
      user: "Unknown",
      app: "E-Tawki3 Mobile Applications",
      issue: "OTP Problem",
      level: "Level 2 Resolution",
      team: "Delivery & PKI",
      status: { label: "Pending AGCE", tone: "warning" },
      access: { label: "Editable", tone: "success" },
    },
    {
      id: "REQ-2026-0003",
      user: "Unknown",
      app: "AGCE Authorization Apps",
      issue: "Signature Problem",
      level: "Critical Issue Classification",
      team: "Delivery & PKI",
      status: { label: "Pending AGCE", tone: "warning" },
      access: { label: "Editable", tone: "success" },
    },
    {
      id: "REQ-2026-0007",
      user: "Unknown",
      app: "Emails",
      issue: "Undeliverable Email",
      level: "Level 2 Resolution",
      team: "Delivery & PKI",
      status: { label: "Resolved", tone: "success" },
      access: { label: "View Only", tone: "muted" },
    },
  ];

  // Filter definitions with mapping to status label
  const filterDefs = [
    { label: "All Tickets", filter: null, count: allRows.length },
    { label: "Pending User", filter: "Pending User", count: 0 },
    { label: "Pending AGCE", filter: "Pending AGCE", count: allRows.filter(r => r.status.label === "Pending AGCE").length },
    { label: "Resolved", filter: "Resolved", count: allRows.filter(r => r.status.label === "Resolved").length },
    { label: "Skipped", filter: "Skipped", count: 0 },
    { label: "Known Issues", filter: "Known Issues", count: 0 },
  ];

  const [activeFilter, setActiveFilter] = useState("All Tickets");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter rows by status and search
  const filteredRows = allRows.filter((row) => {
    // Status filter
    const filterDef = filterDefs.find(f => f.label === activeFilter);
    if (filterDef && filterDef.filter !== null && row.status.label !== filterDef.filter) {
      return false;
    }
    // Search filter (case-insensitive)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        row.id.toLowerCase().includes(query) ||
        row.user.toLowerCase().includes(query) ||
        row.app.toLowerCase().includes(query) ||
        row.issue.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const StatusBadge = ({ label, tone }) => (
    <span className={`ticket-management-system__status-indicator ticket-management-system__status-indicator--theme-${tone}`}>{label}</span>
  );

  const AccessBadge = ({ label, tone }) => (
    <span className={`ticket-management-system__access-level ticket-management-system__access-level--variant-${tone}`}>
      <Lock className="ticket-management-system__access-icon" />
      {label}
    </span>
  );

  return (
    <div className="ticket-dashboard__container">
      <main className="ticket-dashboard__main-content">
        <div className="ticket-dashboard__inner-wrapper">
          {/* Header */}
          <header className="ticket-dashboard__header-section">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="ticket-dashboard__page-title"><IoTicketSharp />Tickets Management</h1>
            <p className="ticket-dashboard__page-subtitle">View and manage support tickets</p>
          </header>

          {/* Search */}
          <div className="ticket-search__container">
            <Search className="ticket-search__magnifier-icon" />
            <input
              type="search"
              placeholder="Search by Request ID, Application, Issue Type, or User…"
              className="ticket-search__input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter pills */}
          <div className="ticket-filters__navigation">
            {filterDefs.map((f) => (
              <button
                key={f.label}
                className={`ticket-filters__pill-button ${activeFilter === f.label ? "ticket-filters__pill-button--current" : ""}`}
                onClick={() => setActiveFilter(f.label)}
              >
                {f.label}
                <span
                  className={`ticket-filters__pill-counter ${
                    activeFilter === f.label ? "ticket-filters__pill-counter--active-state" : ""
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="ticket-table__wrapper">
            <div className="ticket-table__responsive-container">
              <table className="ticket-table__grid">
                <thead>
                  <tr className="ticket-table__header-row">
                    {[
                      "Request ID",
                      "User",
                      "Application",
                      "Issue Type",
                      "Issue Level",
                      "Responsible Team",
                      "Status",
                      "Your Access",
                    ].map((h) => (
                      <th key={h} className="ticket-table__header-cell">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
  {filteredRows.length > 0 ? (
    filteredRows.map((r, idx) => (
      <tr
        key={r.id}
        onClick={() => onSelectTicket(r.id)}
        className={`ticket-table__data-row ticket-table__data-row--clickable ${idx % 2 === 1 ? "ticket-table__data-row--alternate" : ""}`}
      >
        <td className="ticket-table__cell ticket-table__cell--request-id">{r.id}</td>
        <td className="ticket-table__cell ticket-table__cell--user-name">{r.user}</td>
        <td className="ticket-table__cell ticket-table__cell--application-name">{r.app}</td>
        <td className="ticket-table__cell ticket-table__cell--issue-description">{r.issue}</td>
        <td className="ticket-table__cell ticket-table__cell--priority-level">
          <span className="ticket-level__priority-badge">{r.level}</span>
        </td>
        <td className="ticket-table__cell ticket-table__cell--assigned-team">
          <span className="ticket-team__assignment-badge">{r.team}</span>
        </td>
        <td className="ticket-table__cell">
          <StatusBadge {...r.status} />
        </td>
        <td className="ticket-table__cell">
          <AccessBadge {...r.access} />
        </td>
      </tr>
    ))
  ) : (
    <tr className="ticket-table__data-row">
      <td colSpan="8" className="ticket-table__empty-message-cell">
        No tickets match the current filters.
      </td>
    </tr>
  )}
</tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tickets;