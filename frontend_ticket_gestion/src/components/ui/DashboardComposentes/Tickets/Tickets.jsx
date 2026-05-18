import { useEffect, useMemo, useState } from "react";
import { IoTicketSharp } from "react-icons/io5";
import { Search, Lock } from "lucide-react";
import "./Tickets.css";

const API_BASE = "http://localhost:2300";

function getStatusTone(status) {
  if (status === "Resolved") return "success";
  if (status === "Skipped") return "muted";
  return "warning";
}

const Tickets = ({ onSelectTicket }) => {
  const token = localStorage.getItem("token");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Tickets");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      if (!token) {
        setError("Please login first.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load tickets.");
        }

        setRows(payload.data || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [token]);

  const filterDefs = useMemo(() => {
    const allCount = rows.length;
    const pendingCount = rows.filter((ticket) => ticket.status === "Pending").length;
    const resolvedCount = rows.filter((ticket) => ticket.status === "Resolved").length;
    const skippedCount = rows.filter((ticket) => ticket.status === "Skipped").length;

    return [
      { label: "All Tickets", filter: null, count: allCount },
      { label: "Pending", filter: "Pending", count: pendingCount },
      { label: "Resolved", filter: "Resolved", count: resolvedCount },
      { label: "Skipped", filter: "Skipped", count: skippedCount },
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const filterDef = filterDefs.find((f) => f.label === activeFilter);
      if (filterDef && filterDef.filter !== null && row.status !== filterDef.filter) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          String(row.request_code).toLowerCase().includes(query) ||
          String(row.application).toLowerCase().includes(query) ||
          String(row.issue_type).toLowerCase().includes(query) ||
          String(row.issue_level).toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [rows, filterDefs, activeFilter, searchQuery]);

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
          <header className="ticket-dashboard__header-section">
            <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="ticket-dashboard__page-title">
              <IoTicketSharp />
              Tickets Management
            </h1>
            <p className="ticket-dashboard__page-subtitle">View and manage support tickets</p>
          </header>

          <div className="ticket-search__container">
            <Search className="ticket-search__magnifier-icon" />
            <input
              type="search"
              placeholder="Search by Request ID, Application, or Issue Type…"
              className="ticket-search__input-field"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="ticket-filters__navigation">
            {filterDefs.map((filterDef) => (
              <button
                key={filterDef.label}
                className={`ticket-filters__pill-button ${activeFilter === filterDef.label ? "ticket-filters__pill-button--current" : ""}`}
                onClick={() => setActiveFilter(filterDef.label)}
              >
                {filterDef.label}
                <span
                  className={`ticket-filters__pill-counter ${activeFilter === filterDef.label ? "ticket-filters__pill-counter--active-state" : ""}`}
                >
                  {filterDef.count}
                </span>
              </button>
            ))}
          </div>

          <div className="ticket-table__wrapper">
            <div className="ticket-table__responsive-container">
              <table className="ticket-table__grid">
                <thead>
                  <tr className="ticket-table__header-row">
                    <th className="ticket-table__header-cell">Request ID</th>
                    <th className="ticket-table__header-cell">Application</th>
                    <th className="ticket-table__header-cell">Issue Type</th>
                    <th className="ticket-table__header-cell">Issue Level</th>
                    <th className="ticket-table__header-cell">Status</th>
                    <th className="ticket-table__header-cell">Your Access</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="ticket-table__data-row">
                      <td colSpan="6" className="ticket-table__empty-message-cell">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr className="ticket-table__data-row">
                      <td colSpan="6" className="ticket-table__empty-message-cell">
                        {error}
                      </td>
                    </tr>
                  ) : filteredRows.length > 0 ? (
                    filteredRows.map((row, index) => (
                      <tr
                        key={row.id}
                        onClick={() => onSelectTicket(row.id)}
                        className={`ticket-table__data-row ticket-table__data-row--clickable ${index % 2 === 1 ? "ticket-table__data-row--alternate" : ""}`}
                      >
                        <td className="ticket-table__cell ticket-table__cell--request-id">{row.request_code}</td>
                        <td className="ticket-table__cell ticket-table__cell--application-name">{row.application}</td>
                        <td className="ticket-table__cell ticket-table__cell--issue-description">{row.issue_type}</td>
                        <td className="ticket-table__cell ticket-table__cell--priority-level">
                          <span className="ticket-level__priority-badge">{row.issue_level}</span>
                        </td>
                        <td className="ticket-table__cell">
                          <StatusBadge label={row.status} tone={getStatusTone(row.status)} />
                        </td>
                        <td className="ticket-table__cell">
                          <AccessBadge label="Editable" tone="success" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="ticket-table__data-row">
                      <td colSpan="6" className="ticket-table__empty-message-cell">
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
