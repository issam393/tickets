import React, { useState } from 'react';
import SideBar from '../../components/ui/SideBar';
import DashboardContent from '../../components/ui/DashboardContent';
import './PKIDashboard.css';

function PKIDashboard() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [contentOverride, setContentOverride] = useState(null);

  const handleViewAllTickets = () => {
    setContentOverride('Tickets');
    setActiveItem('Tickets');          // optional: also highlight Tickets in sidebar
  };

  const handleMessages = () => {
    setContentOverride('Messages');
    setActiveItem('Messages');          // optional: highlight Messages in sidebar
  };

  const handleSidebarChange = (item) => {
    setActiveItem(item);
    setContentOverride(null);           // clear override when sidebar is used
  };

  return (
    <div className="pki-dashboard-layout">
      <SideBar activeItem={activeItem} setActiveItem={handleSidebarChange} />
      <main className="pki-dashboard-main">
        <DashboardContent
          activeItem={activeItem}
          contentOverride={contentOverride}
          onViewAllTickets={handleViewAllTickets}
          onMessages={handleMessages}
        />
      </main>
    </div>
  );
}

export default PKIDashboard;