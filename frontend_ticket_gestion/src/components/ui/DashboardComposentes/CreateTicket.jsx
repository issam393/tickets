import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mail,
  Paperclip,
  ChevronDown,
  Inbox,
  PencilLine,
  Send,
  Download,
  Building2,
  User,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './CreateTicket.css';
import toast from 'react-hot-toast';

// Decode JWT
function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.service;
    return { service: String(role).toUpperCase() === 'MANAGER' ? 'Manager' : role };
  } catch {
    return null;
  }
}

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
  'Level 2 Resolution',
  'External Vendor Support',
  'Critical Issue Classification',
];
const SUPPORT_INBOX_LABEL = 'Service Delivery Team';

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
          <span className={!value ? 'placeholder' : 'selected-value'}>
            {value || placeholder}
          </span>
          <ChevronDown className="custom-select-arrow" size={18} />
        </div>
        
        {isOpen && (
          <div ref={dropdownRef} className="custom-select-dropdown">
            {options.map((opt, index) => (
              <div
                key={index}
                className={`custom-select-option ${value === opt ? 'selected' : ''} ${opt === 'Critical Issue Classification' ? 'critical-issue-option' : ''}`}
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
  const receivedDate = ticket.receivedAt
    ? new Date(ticket.receivedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    : 'Date unavailable';

  return (
    <div className={`email-card ${expanded ? 'expanded' : ''} ${ticket.isRead ? '' : 'unread'}`}>
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
              {receivedDate}
            </span>
          </div>
          
          <div className="email-meta">
            <span className="email-sender">
              <Mail size={12} />
              {ticket.contactName} &lt;{ticket.senderEmail}&gt;
            </span>
            {ticket.attachments?.length > 0 && (
              <span className="email-attachments">
                <Paperclip size={12} />
                {ticket.attachments.length} Files
              </span>
            )}
          </div>
        </div>

        {!ticket.isRead && <span className="email-unread-dot" title="Unread email" />}
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
              {ticket.content}
            </div>
          </div>

          <div className="email-ai-section">
            <div className="email-ai-grid">
              {[
                { label: 'Client', value: ticket.contactName || '—', icon: User },
                { label: 'Org', value: ticket.organization || '—', icon: Building2 },
                { label: 'Phone', value: ticket.phone || '—', icon: Phone },
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

          {ticket.attachments?.length > 0 && (
            <div className="email-received-files">
              <h4 className="section-title email">
                <Paperclip size={12} />
                Attachments
              </h4>
              <div className="email-attachment-grid">
                {ticket.attachments.map((attachment) => (
                  <div className="email-attachment-card" key={attachment.id || attachment.fileName}>
                    {String(attachment.mimeType || '').startsWith('image/') && (
                      <img
                        className="email-attachment-preview"
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                      />
                    )}
                    <div className="email-attachment-info">
                      <span title={attachment.fileName}>{attachment.fileName}</span>
                      <a
                        className="email-download-button"
                        href={attachment.fileUrl}
                        download={attachment.fileName}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sidebar Card Component ---
function SidebarCard({ selectedOrg, setSelectedOrg, selectedContact, setSelectedContact, onContactChange, token }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const orgDropdownRef = useRef(null);
  const clientDropdownRef = useRef(null);
  const orgTriggerRef = useRef(null);
  const clientTriggerRef = useRef(null);

  const [organizations, setOrganizations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch('http://localhost:2300/api/organizations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.message || 'Failed to load organizations');
        setOrganizations(json.data || []);
        if (json.data?.length > 0 && !selectedOrg) {
          setSelectedOrg(json.data[0]);
          }
      } catch (error) {
        toast.error(error.message);
      }
      finally { setOrgsLoading(false); }
    };
    if (token) fetchOrgs();
  }, [token]);

  useEffect(() => {
    if (!selectedOrg?.id) return;
    const fetchContacts = async () => {
      setContactsLoading(true);
      try {
        const res = await fetch(`http://localhost:2300/api/organizations/${selectedOrg.id}/contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.message || 'Failed to load contacts');
        setContacts(json.data || []);
        const first = json.data?.[0] || null;
        setSelectedContact(first);
        if (onContactChange) onContactChange(first);
      } catch (error) {
        toast.error(error.message);
      }
      finally { setContactsLoading(false); }
    };
    fetchContacts();
  }, [selectedOrg?.id]);

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
    setIsOrgDropdownOpen(false);
  };

  const handleClientChange = (contact) => {
    setSelectedContact(contact);
    if (onContactChange) onContactChange(contact);
    setIsClientDropdownOpen(false);
  };

  const initials = selectedContact?.name
    ? selectedContact.name.slice(0, 2).toUpperCase()
    : '--';

  const createdYear = selectedContact?.createdAt
    ? new Date(selectedContact.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="right-sidebar">
      <div className="right-sidebar-card">
        <div className="right-sidebar-select-group">
          <div className="right-sidebar-select-item">
            <label className="right-sidebar-label">Selected Organization</label>
            <div className="custom-select-container">
              <div
                ref={orgTriggerRef}
                className={`custom-select-trigger ${isOrgDropdownOpen ? 'open' : ''}`}
                onClick={() => !orgsLoading && setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              >
                <span className="selected-value">
                  {orgsLoading ? 'Loading...' : (selectedOrg?.name || 'Select organization...')}
                </span>
                <ChevronDown className="custom-select-arrow" size={14} />
              </div>

              {isOrgDropdownOpen && (
                <div ref={orgDropdownRef} className="custom-select-dropdown">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`custom-select-option ${selectedOrg?.id === org.id ? 'selected' : ''}`}
                      onClick={() => handleOrgChange(org)}
                    >
                      {org.name}
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
                onClick={() => !contactsLoading && setIsClientDropdownOpen(!isClientDropdownOpen)}
              >
                <span className="selected-value">
                  {contactsLoading ? 'Loading...' : (selectedContact?.name || 'No contacts')}
                </span>
                <ChevronDown className="custom-select-arrow" size={14} />
              </div>

              {isClientDropdownOpen && (
                <div ref={clientDropdownRef} className="custom-select-dropdown">
                  {contacts.length === 0
                    ? <div className="custom-select-option" style={{ opacity: 0.5 }}>No contacts found</div>
                    : contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`custom-select-option ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                        onClick={() => handleClientChange(contact)}
                      >
                        {contact.name}{contact.jobTitle ? ` (${contact.jobTitle})` : ''}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="right-sidebar-profile-card">
        <div className="right-sidebar-profile-bg-blur" />

        <div className="right-sidebar-profile-header">
          <div className="right-sidebar-profile-avatar">{initials}</div>
          <div>
            <div className="right-sidebar-profile-name">{selectedContact?.name || '—'}</div>
            <div className="right-sidebar-profile-status">
              <span className="right-sidebar-status-dot" />
              <span className="right-sidebar-status-text">
                Profile: {selectedContact?.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="right-sidebar-profile-details">
          <div className="right-sidebar-profile-info-grid">
            <div className="right-sidebar-profile-info-item">
              <div className="right-sidebar-profile-info-label">Client ID</div>
              <div className="right-sidebar-profile-info-value">
                {selectedContact ? `CNT-${String(selectedContact.id).padStart(3, '0')}` : '—'}
              </div>
            </div>
            <div className="right-sidebar-profile-info-item">
              <div className="right-sidebar-profile-info-label">Since</div>
              <div className="right-sidebar-profile-info-value">{createdYear}</div>
            </div>
          </div>

          {isExpanded && (
            <div className="right-sidebar-profile-expandable">
              <div className="right-sidebar-profile-contact-info">
                <div className="right-sidebar-profile-contact-item">
                  <Mail size={12} />
                  {selectedContact?.email || '—'}
                </div>
                <div className="right-sidebar-profile-contact-item">
                  <Phone size={12} />
                  {selectedContact?.phone || '—'}
                </div>
                <div className="right-sidebar-profile-contact-item">
                  <Building2 size={12} />
                  {selectedContact?.jobTitle || '—'}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="right-sidebar-profile-toggle"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronDown size={14} />}
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
  const navigate = useNavigate();
  const user = getUserFromToken();
  const role = user?.service;

  const [tab, setTab] = useState('manual');
  const [expandedId, setExpandedId] = useState(null);
  const [emailTickets, setEmailTickets] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState('');
  const [emailSenderFilter, setEmailSenderFilter] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    requestId: 'REQ-2026-4954',
    clientId: 'CNT-001',
    application: '',
    issueType: '',
    issueLevel: '',
    issueDescription: ''
  });

  // Redirect if not Service Delivery
  useEffect(() => {
    if (role && role !== 'SD') {
      toast.error('Access denied: Only Service Delivery can create tickets');
      navigate('/dashboard');
    }
  }, [role, navigate]);

  const handleContactChange = (contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      clientId: contact ? contact.id : null,
      organization_id: selectedOrg ? selectedOrg.id : null
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchNextRequestCode = async () => {
    try {
      const response = await fetch('http://localhost:2300/api/tickets/next-request-code', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || payload.message || 'Failed to generate request code');
      setFormData(prev => ({ ...prev, requestId: payload.data }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && role === 'SD') fetchNextRequestCode();
  }, [token, role]);

  const fetchClientEmails = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setEmailsLoading(true);
        setEmailsError('');
      }
      const response = await fetch('http://localhost:2300/api/client-emails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || payload.message || 'Failed to load client emails');
      setEmailTickets(payload.data || []);
    } catch (error) {
      if (!silent) {
        setEmailsError(error.message);
        toast.error(error.message);
      }
    } finally {
      if (!silent) {
        setEmailsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || role !== 'SD') return undefined;

    fetchClientEmails();
    const emailRefreshTimer = window.setInterval(() => {
      fetchClientEmails({ silent: true });
    }, 30000);

    return () => window.clearInterval(emailRefreshTimer);
  }, [token, role]);

  const senderEmailOptions = useMemo(() => (
    [...new Set(emailTickets.map((ticket) => ticket.senderEmail).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second))
  ), [emailTickets]);

  const filteredEmailTickets = useMemo(() => (
    emailSenderFilter.trim()
      ? emailTickets.filter((ticket) => (
        ticket.senderEmail?.toLowerCase().includes(emailSenderFilter.trim().toLowerCase())
      ))
      : emailTickets
  ), [emailTickets, emailSenderFilter]);

  const hydrateFormFromEmail = (ticket) => {
    setSelectedContact({
      id: ticket.contactId,
      name: ticket.contactName,
      email: ticket.senderEmail,
      phone: ticket.phone,
      organization: ticket.organization,
      organization_id: ticket.organizationId
    });
    if (ticket.organizationId || ticket.organization) {
      setSelectedOrg({
        id: ticket.organizationId,
        name: ticket.organization || 'Linked organization'
      });
    }
    setFormData((prev) => ({
      ...prev,
      clientId: ticket.contactId,
      organization_id: ticket.organizationId || null,
      issueType: 'Undeliverable Email',
      issueDescription: `${ticket.content}

Received attachments: ${ticket.attachments?.length ? ticket.attachments.map((file) => file.fileName).join(', ') : 'None'}`
    }));
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
        body: JSON.stringify({
          ...formData,
          clientId: selectedContact?.id || formData.clientId || null,
          organization_id: selectedOrg?.id || null
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Ticket creation failed');
      }

      toast.success('Ticket created successfully with status Pending.');
      fetchNextRequestCode();
      setFormData((prev) => ({
        ...prev,
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
    toast('Form has been reset');
  };

  const handleEmailToggle = async (ticketId) => {
    const isOpening = expandedId !== ticketId;
    setExpandedId(isOpening ? ticketId : null);
    if (!isOpening) return;

    const ticket = emailTickets.find((item) => item.id === ticketId);
    if (!ticket) return;
    hydrateFormFromEmail(ticket);
    if (ticket.isRead) return;

    setEmailTickets((messages) => messages.map((message) => (
      message.id === ticketId ? { ...message, isRead: true } : message
    )));
    try {
      const response = await fetch(`http://localhost:2300/api/client-emails/${ticketId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to mark email as read');
    } catch (error) {
      setEmailTickets((messages) => messages.map((message) => (
        message.id === ticketId ? { ...message, isRead: false } : message
      )));
      toast.error(error.message);
    }
  };

  const unreadCount = emailTickets.filter((ticket) => !ticket.isRead).length;

  // Block rendering for non-SD roles
  if (role && role !== 'SD') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--foreground)' }}>
        <h2>Access Denied</h2>
        <p>Only Service Delivery team members can create tickets.</p>
      </div>
    );
  }

  return (
    <div className="create-ticket-app dark-mode">
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

        <div className="create-ticket-content-wrapper">
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
                    value={selectedContact?.name || '—'}
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
                <div className="email-inbox-heading">
                  <div>
                    <h2>Service Delivery Inbox</h2>
                    <p>Shared with <strong>{SUPPORT_INBOX_LABEL}</strong> employees - Live updates</p>
                  </div>
                  <div className="email-inbox-actions">
                    <label className="email-sender-filter">
                      <Mail size={14} />
                      <input
                        type="email"
                        list="received-email-senders"
                        aria-label="Filter messages by sender email"
                        value={emailSenderFilter}
                        onChange={(event) => setEmailSenderFilter(event.target.value)}
                        placeholder="All senders"
                      />
                      <datalist id="received-email-senders">
                        {senderEmailOptions.map((email) => (
                          <option value={email} key={email} />
                        ))}
                      </datalist>
                    </label>
                    <span className="email-inbox-counter">{unreadCount} unread</span>
                  </div>
                </div>
                <div className="create-ticket-email-list">
                  {emailsLoading ? (
                    <div className="email-empty-state">Loading incoming emails...</div>
                  ) : emailsError ? (
                    <div className="email-empty-state">{emailsError}</div>
                  ) : emailTickets.length === 0 ? (
                    <div className="email-empty-state">No client emails received.</div>
                  ) : filteredEmailTickets.length === 0 ? (
                    <div className="email-empty-state">No emails received from this sender.</div>
                  ) : filteredEmailTickets.map((ticket) => (
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
                selectedContact={selectedContact}
                setSelectedContact={setSelectedContact}
                onContactChange={handleContactChange}
                token={token}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
