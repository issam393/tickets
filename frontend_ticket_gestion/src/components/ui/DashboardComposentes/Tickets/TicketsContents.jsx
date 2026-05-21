// TicketsContents.jsx
import React, { useState } from 'react';
import Tickets from './Tickets';
import TicketDetailPage from './TicketDetails';

function TicketsContents({ onMessages }) {
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
  };

  const handleBack = () => {
    setSelectedTicketId(null);
  };

  if (selectedTicketId) {
    return <TicketDetailPage ticketId={selectedTicketId} onBack={handleBack} onMessages={onMessages} />;
  }

  return <Tickets onSelectTicket={handleSelectTicket} />;
}

export default TicketsContents;