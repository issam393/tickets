import React from 'react';
import ManagerDaschboard from './Dashboard/ManagerDaschboard';
import Meetings from './DashboardComposentes/Meetings';
import Messages from './DashboardComposentes/Messages';
import TicketsContents from './DashboardComposentes/Tickets/TicketsContents';
import Contacts from './DashboardComposentes/Contacts';
import CreateTicket from './DashboardComposentes/CreateTicket';
import PKIDashboard from './Dashboard/PKIDashboard';


function DashboardContent({ activeItem, contentOverride, onViewAllTickets, onMessages }) {

  const effectiveItem = contentOverride || activeItem;


  switch (effectiveItem) {
    case 'Tickets':
      return <TicketsContents />;
    case 'Create Ticket':
      return <CreateTicket />;
     case 'Contacts':
      return <Contacts />;
    case 'Messages':
      return <Messages />;
    case 'Meetings':
      return <Meetings />;
    case 'Dashboard':
    default:
      return <PKIDashboard onViewAllTickets={onViewAllTickets} onMessages={onMessages} />;
  }
}

export default DashboardContent;