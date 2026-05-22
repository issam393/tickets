import { useEffect, useMemo, useState } from "react";
import { IoTicketSharp } from "react-icons/io5";
import { Search, Lock } from "lucide-react";
import "./Tickets.css";

const API_BASE = "http://localhost:2300";

function getStatusTone(status) {
  if (status === "Resolved") return "success";
  if (status === "Warning") return "muted";
  if (status === "Critical") return "destructive";
  if (status === "In Progress") return "info";
  return "warning";
}

function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.service;
    return String(role).toUpperCase() === 'MANAGER' ? 'Manager' : role;
  } catch {
    return null;
  }
}

const Tickets = ({ onSelectTicket }) => {
  const token = localStorage.getItem("token");
  const role = getUserRole();
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

  // Filter by role (PKI/IT only see their assigned tickets)
  const roleFilteredRows = useMemo(() => {
    if (role === 'SD' || role === 'Manager' || role === 'ADMIN') return rows;
    if (role === 'PKI' || role === 'IT') {
      return rows.filter((ticket) => {
        if (!ticket.allowed_services) return false;
        const allowed = Array.isArray(ticket.allowed_services)
          ? ticket.allowed_services
          : typeof ticket.allowed_services === 'string'
          ? JSON.parse(ticket.allowed_services)
          : [];
        return allowed.includes(role);
      });
    }
    return rows;
  }, [rows, role]);

  const filterDefs = useMemo(() => {
    const allCount = roleFilteredRows.length;
    const pendingCount = roleFilteredRows.filter((ticket) => ticket.status === "Pending").length;
    const progressCount = roleFilteredRows.filter((ticket) => ticket.status === "In Progress").length;
    const resolvedCount = roleFilteredRows.filter((ticket) => ticket.status === "Resolved").length;
    const criticalCount = roleFilteredRows.filter((ticket) => ticket.status === "Critical").length;
    const warningCount = roleFilteredRows.filter((ticket) => ticket.status === "Warning").length;

    return [
      { label: "All Tickets", filter: null, count: allCount },
      { label: "Pending", filter: "Pending", count: pendingCount },
      { label: "In Progress", filter: "In Progress", count: progressCount },
      { label: "Resolved", filter: "Resolved", count: resolvedCount },
      { label: "Critical", filter: "Critical", count: criticalCount },
      { label: "Warning", filter: "Warning", count: warningCount },
    ];
  }, [roleFilteredRows]);

  const filteredRows = useMemo(() => {
    return roleFilteredRows.filter((row) => {
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
  }, [roleFilteredRows, filterDefs, activeFilter, searchQuery]);

  // Determine access level based on role and ticket status
  const getAccessLabel = (ticket) => {
    if (ticket.status === "Resolved") return { label: "Locked", tone: "warning" };
    if (role === 'Manager') return { label: "Read Only", tone: "muted" };
    if (role === 'SD') return { label: "Editable", tone: "success" };
    if (role === 'PKI' || role === 'IT') return { label: "Editable", tone: "success" };
    return { label: "Editable", tone: "success" };
  };

  const StatusBadge = ({ label, tone }) => (
    <span className={`ticket-management-system__status-indicator ticket-management-system__status-indicator--theme-${tone}`}>{label}</span>
  );

  const AccessBadge = ({ label, tone }) => (
    <span className={`ticket-management-system__access-level ticket-management-system__access-level--variant-${tone}`}>
      <Lock className="ticket-management-system__access-icon" />
      {label}
    </span>
  );

  const teamLabel = role === 'PKI' ? 'PKI' : role === 'IT' ? 'IT' : '';
  const title = teamLabel ? `${teamLabel} Tickets Management` : 'Tickets Management';

  return (
    <div className="ticket-dashboard__container">
      <main className="ticket-dashboard__main-content">
        <div className="ticket-dashboard__inner-wrapper">
          <header className="ticket-dashboard__header-section">
            <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="ticket-dashboard__page-title">
              <IoTicketSharp />
              {title}
            </h1>
            <p className="ticket-dashboard__page-subtitle">
              {teamLabel ? `Tickets assigned to ${teamLabel} team` : 'View and manage support tickets'}
            </p>
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
                    filteredRows.map((row, index) => {
                      const access = getAccessLabel(row);
                      return (
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
                            <AccessBadge label={access.label} tone={access.tone} />
                          </td>
                        </tr>
                      );
                    })
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
