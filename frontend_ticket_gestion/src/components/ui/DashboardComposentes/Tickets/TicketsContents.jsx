// TicketsContents.jsx
import React, { useState } from 'react';
import Tickets from './Tickets';
import TicketDetailPage from './TicketDetails';

function TicketsContents() {
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
  };

  const handleBack = () => {
    setSelectedTicketId(null);
  };

  if (selectedTicketId) {
    return <TicketDetailPage ticketId={selectedTicketId} onBack={handleBack} />;
  }

  return <Tickets onSelectTicket={handleSelectTicket} />;
}

export default TicketsContents;