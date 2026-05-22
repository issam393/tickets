import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Calendar,
  LogOut,
  ShieldCheck,
  Contact,
  Plus,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import './SideBar.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:2300/api';

function normalizeRole(role) {
  if (!role) return null;
  return String(role).toUpperCase() === 'MANAGER' ? 'Manager' : role;
}

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId,
      userName: payload.userName || payload.username || localStorage.getItem('username'),
      firstName: payload.firstName,
      lastName: payload.lastName,
      service: normalizeRole(payload.service || payload.role),
    };
  } catch {
    return null;
  }
}

function Sidebar({ activeItem, setActiveItem }) {
  const navigate = useNavigate();
  const tokenUser = useMemo(() => getUserFromToken(), []);
  const [user, setUser] = useState(tokenUser);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${API_BASE}/employees/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok || !payload.data || !isMounted) return;

        const employee = payload.data;
        setUser({
          id: employee.id,
          userName: employee.userName || employee.email || tokenUser?.userName,
          firstName: employee.firstName,
          lastName: employee.lastName,
          service: normalizeRole(employee.service_name || tokenUser?.service),
        });
      } catch {
        if (isMounted) setUser(tokenUser);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [tokenUser]);

  const role = user?.service;
  const initials = user
    ? `${user.firstName?.[0] || user.userName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '??';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  const displayName = fullName || user?.userName || 'Loading...';

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Contacts', icon: Contact },
    { label: 'Create Ticket', icon: Plus },
    { label: 'Tickets', icon: Ticket },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Meetings', icon: Calendar },
  ];

  // Filter nav items based on role
  const visibleNavItems = navItems.filter((item) => {
    if (role === 'Manager') {
      return ['Dashboard', 'Contacts', 'Tickets', 'Messages', 'Meetings'].includes(item.label);
    }
    if (role === 'PKI' || role === 'IT') {
      return ['Dashboard', 'Tickets', 'Messages', 'Meetings'].includes(item.label);
    }
    if (role === 'ADMIN') {
      return false; // Admin sees nothing from this list
    }
    return true; // SD sees everything
  });

  const handleProfileClick = () => {
    navigate('/ProfilePage');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck className="sidebar-logo-icon-svg" />
          </div>
          <div>
            <p className="sidebar-logo-title">AGCE CRM</p>
            <p className="sidebar-logo-subtitle">Support System</p>
          </div>
        </div>
      </div>

      <div className="sidebar-profile-container">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">{displayName}</p>
            <p className="sidebar-profile-email">{user?.userName || ''}</p>
          </div>
        </div>
        <div className="sidebar-role-wrapper">
          <div className="sidebar-role-badge">
            <span className="sidebar-role-dot" />
            {role === 'SD' ? 'Service Delivery' :
             role === 'Manager' ? 'Manager' :
             role === 'ADMIN' ? 'Admin' :
             role === 'PKI' ? 'PKI Team' :
             role === 'IT' ? 'IT Team' : role}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <div
              key={item.label}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveItem(item.label)}
            >
              <Icon className="sidebar-nav-icon" />
              {item.label}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-profile-btn" onClick={handleProfileClick}>
          <User className="sidebar-profile-icon" />
          Profile
        </button>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut className="sidebar-logout-icon" />
          Logout
        </button>

        <p className="sidebar-copyright">© 2026 AGCE – Classified</p>
      </div>
    </aside>
  );
}

export default Sidebar;
