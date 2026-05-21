import React from 'react';
import ManagerDaschboard from './Dashboard/ManagerDaschboard';
import Meetings from './DashboardComposentes/Meetings';
import Messages from './DashboardComposentes/Messages';
import TicketsContents from './DashboardComposentes/Tickets/TicketsContents';
import Contacts from './DashboardComposentes/Contacts';
import CreateTicket from './DashboardComposentes/CreateTicket';
import PKIDashboard from './Dashboard/PKIDashboard';
import SDHomeDashboard from './Dashboard/SDHomeDashboard';

function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.service;
  } catch {
    return null;
  }
}

function DashboardContent({ activeItem, contentOverride, onViewAllTickets, onMessages }) {
  const effectiveItem = contentOverride || activeItem;
  const role = getUserRole();

  const hasAccess = (item) => {
    if (!role) return false;
    switch (role) {
      case 'SD':
        return true;
      case 'Manager':
        return ['Dashboard', 'Tickets', 'Messages', 'Meetings'].includes(item);
      case 'PKI':
      case 'IT':
        return ['Dashboard', 'Tickets', 'Messages', 'Meetings'].includes(item);
      case 'ADMIN':
        return false; // ADMIN has separate UI
      default:
        return false;
    }
  };

  if (!hasAccess(effectiveItem)) {
    return (
      <div style={{ padding: '2rem', color: 'var(--foreground)' }}>
        <h2>Access Denied</h2>
        <p>Your role does not have permission to view this section.</p>
      </div>
    );
  }

  switch (effectiveItem) {
    case 'Tickets':
      return <TicketsContents onMessages={onMessages} />;
    case 'Create Ticket':
      return <CreateTicket />;
    case 'Contacts':
      return <Contacts />;
    case 'Messages':
      return <Messages />;
    case 'Meetings':
      return <Meetings />;
    case 'Dashboard':
    default: {
      if (!role) return null;
      if (role === 'SD') return <SDHomeDashboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      if (role === 'Manager') return <ManagerDaschboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      if (role === 'PKI') return <PKIDashboard role="PKI" onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      if (role === 'IT') return <PKIDashboard role="IT" onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      return <SDHomeDashboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
    }
  }
}

export default DashboardContent;