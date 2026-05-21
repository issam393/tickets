import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Clock,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Inbox,
  PencilLine,
  Send,
  Building2,
  User,
  Phone,
} from 'lucide-react';

import './CreateTicket.css';
import toast, { Toaster } from 'react-hot-toast';

// --- Constants ---
const emailTickets = [
  {
    id: '1',
    subject: 'Urgent: Cannot access E-Tawki3 portal - Login Error',
    sender: 'yasmin.saeed@business.ae',
    date: 'Mar 31, 2026 at 03:23 PM',
  },
  {
    id: '2',
    subject: 'OTP codes not being received',
    sender: 'karim.ahmed@ventures.ae',
    date: 'Mar 31, 2026 at 02:45 PM',
  },
  {
    id: '3',
    subject: 'Re: Digital Signature Validation Error - Attached Logs',
    sender: 'noor.khalil@tech.ae',
    date: 'Mar 31, 2026 at 12:10 PM',
    attachments: 2,
  },
  {
    id: '4',
    subject: 'Account activation email not received',
    sender: 'sara.mahmoud@consulting.ae',
    date: 'Mar 31, 2026 at 10:30 AM',
  },
  {
    id: '5',
    subject: 'Bug Report: Document upload stuck',
    sender: 'hassan.omar@holdings.ae',
    date: 'Mar 30, 2026 at 05:20 PM',
  },
];

const APPLICATION_OPTIONS = [
  'Web RA',
  'User RA',
  'E-Tawki3 Web Portal',
  'E-Tawki3 Mobile Applications',
  'AGCE RS Plugin (VCSP)',
  'AGCE Authorization Apps',
  'Remote Signing Awls',
];

const ISSUE_TYPE_OPTIONS = [
  'Account Activation',
  'Accessibility',
  'Login',
  'Signature Problem',
  'Undeliverable Email',
  'Bug in Application',
  'Asking for Information',
  'Incident from Operations',
  'LRA Station Problem',
  'OTP Problem',
  'Desktop Sign-in / E-Tawki3 Account Creation / Deletion',
  'Functionality Problem',
];

const ISSUE_LEVEL_OPTIONS = [
  'Level 1 Assistance',
  'Aperçu',
  'Level 2 Resolution',
  'External Vendor Support',
  'Critical Issue Classification',
];

// --- Tab Button Component ---
function TabButton({ active, onClick, children, badge, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`tab-button ${active ? 'active' : ''}`}
    >
      {Icon && <Icon size={18} />}
      {children}
      {badge !== undefined && (
        <span className={`tab-badge ${active ? 'active' : ''}`}>
          {badge}
        </span>
      )}
      {active && <div className="active-tab-indicator" />}
    </button>
  );
}

// --- Input Field Component ---
function InputField({ label, required, disabled, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="input-field">
      <label className="input-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${disabled ? 'disabled' : ''}`}
      />
    </div>
  );
}

// --- Custom Select Field Component ---
function CustomSelectField({ label, required, placeholder, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const isPlaceholder = !value;

  return (
    <div className="select-field">
      <label className="select-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <div className="custom-select-container">
        <div 
          ref={triggerRef}
          className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={isPlaceholder ? 'placeholder' : 'selected-value'}>
            {value || placeholder}
          </span>
          <ChevronDown className="custom-select-arrow" size={18} />
        </div>
        
        {isOpen && (
          <div ref={dropdownRef} className="custom-select-dropdown">
            {options.map((opt, index) => (
              <div
                key={index}
                className={`custom-select-option ${value === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Text Area Component ---
function TextAreaField({ label, required, placeholder, rows = 4, value, onChange }) {
  return (
    <div className="textarea-field">
      <label className="textarea-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="textarea"
      />
    </div>
  );
}

// --- Email Ticket Card Component ---
function EmailTicketCard({ ticket, expanded, onToggle }) {
  return (
    <div className={`email-card ${expanded ? 'expanded' : ''}`}>
      <div 
        className="email-card-header"
        onClick={onToggle}
      >
        <div className={`email-card-icon ${expanded ? 'expanded' : ''}`}>
          <Inbox size={20} />
        </div>
        
        <div className="email-card-content">
          <div className="email-card-title">
            <h3 className={`email-subject ${expanded ? 'expanded' : ''}`}>
              {ticket.subject}
            </h3>
            <span className="email-date">
              {ticket.date}
            </span>
          </div>
          
          <div className="email-meta">
            <span className="email-sender">
              <Mail size={12} />
              {ticket.sender}
            </span>
            {ticket.attachments && (
              <span className="email-attachments">
                <Paperclip size={12} />
                {ticket.attachments} Files
              </span>
            )}
          </div>
        </div>

        <div className={`email-chevron ${expanded ? 'expanded' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </div>

      {expanded && (
        <div className="email-expanded-content">
          <div className="email-divider" />
          
          <div className="email-original-section">
            <h4 className="section-title email">
              <Mail size={12} />
              Original Content
            </h4>
            <div className="email-original-text">
{`Hello AGCE Support Team,

I am Yasmin Saeed from Al-Nahda Business Group. I am experiencing issues accessing the E-Tawki3 Web Portal.

When I try to log in with my credentials, I receive an error message saying "Authentication Failed - Invalid Credentials". However, I am certain that I am using the correct username and password.

Best regards,
Yasmin Saeed
IT Coordinator
Al-Nahda Business Group`}
            </div>
          </div>

          <div className="email-ai-section">
            <div className="email-ai-grid">
              {[
                { label: 'Client', value: 'Yasmin Saeed', icon: User },
                { label: 'Org', value: 'Al-Nahda Group', icon: Building2 },
                { label: 'Phone', value: '+971 54 789...', icon: Phone },
              ].map((item) => (
                <div key={item.label} className="ai-card">
                  <div className="ai-card-label">
                    <item.icon size={10} />
                    {item.label}
                  </div>
                  <div className="ai-card-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sidebar Card Component (Right Sidebar) ---
function SidebarCard({ selectedOrg, setSelectedOrg, selectedClient, setSelectedClient, onClientChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const orgDropdownRef = useRef(null);
  const clientDropdownRef = useRef(null);
  const orgTriggerRef = useRef(null);
  const clientTriggerRef = useRef(null);
  
  const organizations = [
    'Al-Nahda Business Group',
    'Tech Ventures LLC',
    'Digital Solutions AE',
    'Global Consulting FZCO'
  ];
  
  const getClientsForOrg = (org) => {
    const clientsMap = {
      'Al-Nahda Business Group': ['Yasmin Saeed (IT Coordinator)', 'Omar Farouk (System Admin)'],
      'Tech Ventures LLC': ['Karim Ahmed (Technical Lead)', 'Layla Hassan (DevOps)'],
      'Digital Solutions AE': ['Noor Khalil (Product Manager)', 'Rami Said (Developer)'],
      'Global Consulting FZCO': ['Sara Mahmoud (Consultant)', 'Ali Reza (Analyst)']
    };
    return clientsMap[org] || ['Yasmin Saeed (IT Coordinator)'];
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target) &&
          orgTriggerRef.current && !orgTriggerRef.current.contains(event.target)) {
        setIsOrgDropdownOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target) &&
          clientTriggerRef.current && !clientTriggerRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrgChange = (org) => {
    setSelectedOrg(org);
    const newClients = getClientsForOrg(org);
    setSelectedClient(newClients[0]);
    if (onClientChange) onClientChange(newClients[0]);
    setIsOrgDropdownOpen(false);
  };

  const handleClientChange = (client) => {
    setSelectedClient(client);
    if (onClientChange) onClientChange(client);
    setIsClientDropdownOpen(false);
  };

  const clients = getClientsForOrg(selectedOrg);
  const selectedClientName = selectedClient.split(' ')[0];

  return (
    <div className="right-sidebar">
      {/* Organization & Contact Selection */}
      <div className="right-sidebar-card">
        <div className="right-sidebar-select-group">
          <div className="right-sidebar-select-item">
            <label className="right-sidebar-label">Selected Organization</label>
            <div className="custom-select-container">
              <div 
                ref={orgTriggerRef}
                className={`custom-select-trigger ${isOrgDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              >
                <span className="selected-value">{selectedOrg}</span>
                <ChevronDown className="custom-select-arrow" size={14} />
              </div>
              
              {isOrgDropdownOpen && (
                <div ref={orgDropdownRef} className="custom-select-dropdown">
                  {organizations.map((org, index) => (
                    <div
                      key={index}
                      className={`custom-select-option ${selectedOrg === org ? 'selected' : ''}`}
                      onClick={() => handleOrgChange(org)}
                    >
                      {org}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="right-sidebar-select-item">
            <label className="right-sidebar-label">Active Contact</label>
            <div className="custom-select-container">
              <div 
                ref={clientTriggerRef}
                className={`custom-select-trigger ${isClientDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              >
                <span className="selected-value">{selectedClient}</span>
                <ChevronDown className="custom-select-arrow" size={14} />
              </div>
              
              {isClientDropdownOpen && (
                <div ref={clientDropdownRef} className="custom-select-dropdown">
                  {clients.map((client, index) => (
                    <div
                      key={index}
                      className={`custom-select-option ${selectedClient === client ? 'selected' : ''}`}
                      onClick={() => handleClientChange(client)}
                    >
                      {client}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="right-sidebar-profile-card">
        <div className="right-sidebar-profile-bg-blur" />
        
        <div className="right-sidebar-profile-header">
          <div className="right-sidebar-profile-avatar">
            {selectedClientName.charAt(0)}{selectedClientName.charAt(1)}
          </div>
          <div>
            <div className="right-sidebar-profile-name">{selectedClientName}</div>
            <div className="right-sidebar-profile-status">
              <span className="right-sidebar-status-dot" />
              <span className="right-sidebar-status-text">Profile: Active</span>
            </div>
          </div>
        </div>

        <div className="right-sidebar-profile-details">
          <div className="right-sidebar-profile-info-grid">
            <div className="right-sidebar-profile-info-item">
              <div className="right-sidebar-profile-info-label">Client ID</div>
              <div className="right-sidebar-profile-info-value">
                {selectedClientName === 'Yasmin' ? 'CNT-001' : 
                 selectedClientName === 'Karim' ? 'CNT-002' :
                 selectedClientName === 'Noor' ? 'CNT-003' : 'CNT-004'}
              </div>
            </div>
            <div className="right-sidebar-profile-info-item">
              <div className="right-sidebar-profile-info-label">Since</div>
              <div className="right-sidebar-profile-info-value">Jan 2024</div>
            </div>
          </div>

          {isExpanded && (
            <div className="right-sidebar-profile-expandable">
              <div className="right-sidebar-profile-contact-info">
                <div className="right-sidebar-profile-contact-item">
                  <Mail size={12} />
                  {selectedClientName.toLowerCase()}.saeed@business.ae
                </div>
                <div className="right-sidebar-profile-contact-item">
                  <Phone size={12} />
                  +971 54 789 0123
                </div>
                <div className="right-sidebar-profile-contact-item">
                  <Building2 size={12} />
                  IT Coordinator
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="right-sidebar-profile-toggle"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? 'Less Info' : 'More Details'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function CreateTicket() {
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState('manual');
  const [expandedId, setExpandedId] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('Al-Nahda Business Group');
  const [selectedClient, setSelectedClient] = useState('Yasmin Saeed (IT Coordinator)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    requestId: 'REQ-2026-4954',
    clientId: 'CNT-001',
    application: '',
    issueType: '',
    issueLevel: '',
    issueDescription: ''
  });



  const handleClientChange = (client) => {
    const clientName = client.split(' ')[0];
    setFormData(prev => ({
      ...prev,
      clientId: clientName === 'Yasmin' ? 'CNT-001' : 
                clientName === 'Karim' ? 'CNT-002' :
                clientName === 'Noor' ? 'CNT-003' : 'CNT-004'
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buildLocalRequestId = () => {
    const now = new Date();
    return `REQ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleCreateTicket = async () => {
    if (!formData.application || !formData.issueType || !formData.issueLevel || !formData.issueDescription) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:2300/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Ticket creation failed');
      }

      toast.success('Ticket created successfully! Room provisioned.');
      setFormData((prev) => ({
        ...prev,
        requestId: buildLocalRequestId(),
        application: '',
        issueType: '',
        issueLevel: '',
        issueDescription: ''
      }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      ...formData,
      application: '',
      issueType: '',
      issueLevel: '',
      issueDescription: ''
    });
    toast('Form has been reset', { icon: '🔄' });
  };



  // Toggle email card & mark as read if needed
  const handleEmailToggle = (ticketId) => {
    setExpandedId((prevExpandedId) => {
      const isOpening = prevExpandedId !== ticketId;

      if (isOpening) {
        setReadIds((prevReadIds) => {
          if (prevReadIds.includes(ticketId)) {
            return prevReadIds;
          }
          return [...prevReadIds, ticketId];
        });
      }

      return isOpening ? ticketId : null;
    });
  };

  const unreadCount = Math.max(
    0,
    emailTickets.length - new Set(readIds).size
  );

  return (
    <div className="create-ticket-app dark-mode">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />

      <div className="create-ticket-glow-bg">
        <div className="create-ticket-glow-circle create-ticket-glow-circle-1" />
        <div className="create-ticket-glow-circle create-ticket-glow-circle-2" />
      </div>

      <div className="create-ticket-main-container">
        <header className="create-ticket-header">
          <div className="create-ticket-header-title-section">
            <h1 className="create-ticket-main-title">
            + Create <span className="create-ticket-title-highlight">Support</span> Ticket
            </h1>
            <p className="create-ticket-subtitle">
              Submit a new support request
            </p>
          </div>
        </header>

        <div className={`create-ticket-content-wrapper ${tab === 'email' ? 'full-width' : ''}`}>
          <div className="create-ticket-main-content">
            <div className="create-ticket-tabs-container">
              <TabButton 
                active={tab === 'manual'} 
                onClick={() => setTab('manual')}
                icon={PencilLine}
              >
                Manual
              </TabButton>
              <TabButton 
                active={tab === 'email'} 
                onClick={() => setTab('email')} 
                badge={unreadCount}
                icon={Inbox}
              >
                Email Processing
              </TabButton>
            </div>

            {tab === 'manual' ? (
              <div className="create-ticket-manual-form">
                <div className="create-ticket-form-grid">
                  <InputField
                    label="Request ID"
                    value={formData.requestId}
                    disabled
                  />
                  <InputField 
                    label="Client Association" 
                    value={selectedClient.split(' ')[0]}
                    disabled
                  />
                  
                  <CustomSelectField
                    label="Application Module"
                    required
                    placeholder="Select target system..."
                    options={APPLICATION_OPTIONS}
                    value={formData.application}
                    onChange={(value) => handleInputChange('application', value)}
                  />
                  
                  <CustomSelectField
                    label="Case Taxonomy"
                    required
                    placeholder="Select issue category..."
                    options={ISSUE_TYPE_OPTIONS}
                    value={formData.issueType}
                    onChange={(value) => handleInputChange('issueType', value)}
                  />
                  
                  <div className="create-ticket-full-width">
                    <CustomSelectField
                      label="Service Level Agreement (SLA)"
                      required
                      placeholder="Select issue priority level..."
                      options={ISSUE_LEVEL_OPTIONS}
                      value={formData.issueLevel}
                      onChange={(value) => handleInputChange('issueLevel', value)}
                    />
                  </div>
                  
                  <div className="create-ticket-full-width">
                    <TextAreaField
                      label="Detailed Incident Report"
                      required
                      placeholder="Provide a comprehensive description of the observed behavior..."
                      rows={6}
                      value={formData.issueDescription}
                      onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                    />
                  </div>
                </div>

                <div className="create-ticket-form-actions">
                  <button className="create-ticket-reset-button" onClick={handleCancel}>
                    Reset Workspace
                  </button>
                  
                  <button className="create-ticket-submit-button" onClick={handleCreateTicket} disabled={isSubmitting}>
                    {isSubmitting ? 'Provisioning...' : 'Provision Ticket'}
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="create-ticket-email-container">
                <div className="create-ticket-email-list">
                  {emailTickets.map((ticket) => (
                    <div key={ticket.id}>
                      <EmailTicketCard
                        ticket={ticket}
                        expanded={expandedId === ticket.id}
                        onToggle={() => handleEmailToggle(ticket.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {tab === 'manual' && (
            <div className="create-ticket-right-sidebar">
              <SidebarCard 
                selectedOrg={selectedOrg} 
                setSelectedOrg={setSelectedOrg}
                selectedClient={selectedClient} 
                setSelectedClient={setSelectedClient}
                onClientChange={handleClientChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}