import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Calendar,
  LogOut,
  ShieldCheck,
  Contact,
  Plus,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SideBar.css';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Contacts', icon: Contact },
  { label: 'Create Ticket', icon: Plus },
  { label: 'Tickets', icon: Ticket },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Meetings', icon: Calendar },
];

function Sidebar({ activeItem, setActiveItem }) {
  const navigate = useNavigate();


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
          <div className="sidebar-avatar">SA</div>
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">Sara Al-Zaabi</p>
            <p className="sidebar-profile-email">sara.alzaabi@agce.ae</p>
          </div>
        </div>
        <div className="sidebar-role-wrapper">
          <div className="sidebar-role-badge">
            <span className="sidebar-role-dot" />
            PKI Role
          </div>
          
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
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
        {/* Profile Button */}
        <button className="sidebar-profile-btn" onClick={handleProfileClick}>
          <User className="sidebar-profile-icon" />
          Profile
        </button>
        
        {/* Logout Button */}
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