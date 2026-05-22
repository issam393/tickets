import React from 'react';
import ManagerDaschboard from './Dashboard/ManagerDaschboard';
import Meetings from './DashboardComposentes/Meetings';
import Messages from './DashboardComposentes/Messages';
import TicketsContents from './DashboardComposentes/Tickets/TicketsContents';
import Contacts from './DashboardComposentes/Contacts';
import CreateTicket from './DashboardComposentes/CreateTicket';
import PKIDashboard from './Dashboard/PKIDashboard';
import SDHomeDashboard from './Dashboard/SDHomeDashboard';
import AccessDenied from './AccessDenied/AccessDenied';
import { getAuthUser } from '../../lib/authAccess';

function getUserRole() {
  return getAuthUser()?.role || null;
}

function DashboardContent({
  activeItem,
  contentOverride,
  onViewAllTickets,
  onMessages,
  onCreateTicket,
  onManageOrganizations,
  onManageClients,
  onReviewAssignments,
  onMeetings,
}) {
  const effectiveItem = contentOverride || activeItem;
  const role = getUserRole();

  const hasAccess = (item) => {
    if (!role) return false;
    switch (role) {
      case 'SD':
        return true;
      case 'Manager':
        return ['Dashboard', 'Contacts', 'Tickets', 'Messages', 'Meetings'].includes(item);
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
    return <AccessDenied userRole={role} />;
  }

  switch (effectiveItem) {
    case 'Tickets':
      return <TicketsContents onMessages={onMessages} />;
    case 'Create Ticket':
      return <CreateTicket />;
    case 'Contacts':
      return <Contacts readOnly={role === 'Manager'} />;
    case 'Messages':
      return <Messages />;
    case 'Meetings':
      return <Meetings />;
    case 'Dashboard':
    default: {
      if (!role) return null;
      if (role === 'SD') {
        return (
          <SDHomeDashboard
            onViewAllTickets={onViewAllTickets}
            onMessages={onMessages}
            onCreateTicket={onCreateTicket}
            onManageOrganizations={onManageOrganizations}
            onManageClients={onManageClients}
            onReviewAssignments={onReviewAssignments}
            onMeetings={onMeetings}
          />
        );
      }
      if (role === 'Manager') return <ManagerDaschboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      if (role === 'PKI') return <PKIDashboard role="PKI" onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      if (role === 'IT') return <PKIDashboard role="IT" onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
      return <SDHomeDashboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
    }
  }
}

export default DashboardContent;
