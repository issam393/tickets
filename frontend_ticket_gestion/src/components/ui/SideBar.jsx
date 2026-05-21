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
import { useState, useEffect } from 'react';
import './SideBar.css';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId,
      userName: payload.userName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      service: payload.service,
    };
  } catch {
    return null;
  }
}

function Sidebar({ activeItem, setActiveItem }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      setUser({
        id: payload.id || payload.userId,
        userName: payload.userName || payload.username || payload.email,
        firstName: payload.firstName || payload.firstname || payload.given_name,
        lastName: payload.lastName || payload.lastname || payload.family_name,
        service: payload.service || payload.role,
      });
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  } else {
    console.log('No token found in localStorage');
  }
}, []);

  const role = user?.service;
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '??';
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Loading...';

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
      return ['Dashboard', 'Tickets', 'Messages', 'Meetings'].includes(item.label);
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
