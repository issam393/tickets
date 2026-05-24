import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import './OrganizationDetails.css';

const API = import.meta.env.VITE_API_URL || "http://localhost:2300/api";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;

function getToken() {
  return localStorage.getItem("token");
}

function OrganizationDetails({ organization, onBack, readOnly = false }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedContactId, setSelectedContactId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    status: 'Active'
  });

  const [selectedRoles, setSelectedRoles] = useState({
    applicant: false,
    representative: false,
    lrao: false
  });

  // Fetch contacts for this organization
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const res = await fetch(`${API}/organizations/${organization.id}/contacts`, { headers });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to fetch contacts');
      }
      const json = await res.json();
      setContacts(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchContacts();
    }
  }, [organization?.id]);

  // Determine if another contact in this organization is already the Applicant
  const hasApplicantForForm = contacts.some(c => 
    c.type && 
    c.type.includes('Applicant') && 
    (modalMode === 'create' || c.id !== selectedContactId)
  );

  const hasApplicant = contacts.some(c => c.type && c.type.includes('Applicant'));

  // Count role stats
  const applicantCount = contacts.filter(c => c.type && c.type.includes('Applicant')).length;
  const representativeCount = contacts.filter(c => c.type && c.type.includes('Representative')).length;
  const lraoCount = contacts.filter(c => c.type && c.type.includes('LRAO')).length;

  const handleRoleChange = (role) => {
    if (role === 'applicant' && hasApplicantForForm) return;
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const isFormValid = () => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           EMAIL_PATTERN.test(formData.email.trim()) &&
           PHONE_PATTERN.test(formData.phone.trim()) &&
           (selectedRoles.applicant || selectedRoles.representative || selectedRoles.lrao);
  };

  const openCreateModal = () => {
    if (readOnly) return;
    setModalMode('create');
    setSelectedContactId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      status: 'Active'
    });
    setSelectedRoles({
      applicant: false,
      representative: false,
      lrao: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    if (readOnly) return;
    setModalMode('edit');
    setSelectedContactId(contact.id);
    const nameParts = (contact.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setFormData({
      firstName,
      lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      status: contact.status || 'Active'
    });
    
    setSelectedRoles({
      applicant: !!(contact.type && contact.type.includes('Applicant')),
      representative: !!(contact.type && contact.type.includes('Representative')),
      lrao: !!(contact.type && contact.type.includes('LRAO'))
    });
    
    setIsModalOpen(true);
  };

  const openViewModal = (contact) => {
    setModalMode('view');
    setSelectedContactId(contact.id);
    const nameParts = (contact.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setFormData({
      firstName,
      lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      jobTitle: contact.jobTitle || '',
      status: contact.status || 'Active'
    });
    
    setSelectedRoles({
      applicant: !!(contact.type && contact.type.includes('Applicant')),
      representative: !!(contact.type && contact.type.includes('Representative')),
      lrao: !!(contact.type && contact.type.includes('LRAO'))
    });
    
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (readOnly) {
      toast.error('Action non autorisée.');
      return;
    }
    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!PHONE_PATTERN.test(formData.phone.trim())) {
      toast.error('Phone number must contain exactly 10 digits.');
      return;
    }
    if (!isFormValid()) {
      toast.error('Please complete all required fields.');
      return;
    }

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const rolesList = [];
    if (selectedRoles.applicant) rolesList.push('Applicant');
    if (selectedRoles.representative) rolesList.push('Representative');
    if (selectedRoles.lrao) rolesList.push('LRAO');
    const contactType = rolesList.join(', ');

    const payload = {
      name: fullName,
      type: contactType,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      jobTitle: formData.jobTitle.trim(),
      status: formData.status
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      };
      
      let res;
      if (modalMode === 'create') {
        res = await fetch(`${API}/organizations/${organization.id}/contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API}/contacts/${selectedContactId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save contact');
      }

      setIsModalOpen(false);
      await fetchContacts();
      toast.success(modalMode === 'create' ? 'Contact created successfully.' : 'Contact updated successfully.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteContact = async (contact) => {
    if (readOnly) {
      toast.error('Action non autorisée.');
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${contact.name}?`);
    if (!confirmDelete) return;

    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const res = await fetch(`${API}/contacts/${contact.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete contact');
      }
      await fetchContacts();
      toast.success('Contact deleted successfully.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : '';
  };

  const renderRolePills = (typeStr) => {
    if (!typeStr) return null;
    const roles = typeStr.split(',').map(r => r.trim());
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {roles.map((role) => {
          let className = 'pill pill-blue';
          if (role === 'Applicant') className = 'pill pill-purple';
          if (role === 'LRAO') className = 'pill pill-green';
          return (
            <span key={role} className={className}>
              {role}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="org-details-container">
      {/* Back Button */}
      <div className="back-nav">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Contacts</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="org-header">
        <div className="org-icon">
          <Building2 size={48} />
        </div>
        <div className="org-info">
          <h1 className="org-name">{organization.name}</h1>
          <div className="org-id">ORG-{String(organization.id).padStart(3, '0')}</div>
          <div className="org-badges">
            <span className="badge badge-blue">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </span>
            <span className={`badge ${hasApplicant ? 'badge-green' : 'badge-blue'}`}>
              {hasApplicant ? 'Complete Setup' : 'Setup Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Organization Overview Card */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} />
            <h2>Organization Overview</h2>
          </div>
        </div>
        <div className="info-grid">
          <div className="info-box">
            <Briefcase size={20} className="icon-purple" />
            <div className="info-content">
              <div className="info-label">Industry</div>
              <div className="info-value">{organization.industry}</div>
            </div>
          </div>
          <div className="info-box">
            <Mail size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Contact Email</div>
              <div className="info-value">{organization.email}</div>
            </div>
          </div>
          <div className="info-box">
            <Phone size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Contact Phone</div>
              <div className="info-value">{organization.phone}</div>
            </div>
          </div>
          <div className="info-box">
            <MapPin size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Address</div>
              <div className="info-value">{organization.address || '—'}</div>
            </div>
          </div>
          <div className="info-box">
            <Calendar size={20} className="icon-green" />
            <div className="info-content">
              <div className="info-label">Created At</div>
              <div className="info-value">
                {organization.createdAt ? new Date(organization.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              </div>
            </div>
          </div>
          <div className="info-box">
            <Calendar size={20} className="icon-green" />
            <div className="info-content">
              <div className="info-label">Last Updated</div>
              <div className="info-value">
                {organization.updatedAt ? new Date(organization.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Card */}
      <div className="glass-card">
        <div className="contacts-header">
          <div className="card-title">
            <Shield size={20} />
            <div>
              <h2>Contacts</h2>
              <p className="card-subtitle">Manage contacts for this organization</p>
            </div>
          </div>
          {!readOnly && (
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Create Contact</span>
          </button>
          )}
        </div>

        {/* Statistics Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Executive</div>
            <div className="stat-number stat-purple">{applicantCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Representative</div>
            <div className="stat-number stat-blue">{representativeCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">LRAO</div>
            <div className="stat-number stat-yellow">{lraoCount}</div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="table-wrapper">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Contact ID</th>
                <th>Full Name</th>
                <th>Contact Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#8b96b0' }}>
                    Loading contacts...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#f87171' }}>
                    Error: {error}
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#8b96b0' }}>
                    No contacts found for this organization.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id}>
                    <td className="contact-id">CNT-{String(c.id).padStart(3, '0')}</td>
                    <td>
                      <div className="contact-name">
                        <div className="avatar avatar-blue">{getInitials(c.name)}</div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td>
                      {renderRolePills(c.type)}
                    </td>
                    <td>
                      <div className="contact-email">
                        <Mail size={14} />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-phone">
                        <Phone size={14} />
                        <span>{c.phone || '—'}</span>
                      </div>
                    </td>
                    <td>{c.jobTitle || '—'}</td>
                    <td>
                      <span className={`pill ${c.status === 'Active' ? 'pill-green' : c.status === 'Pending' ? 'pill-blue' : 'pill-purple'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons">
                        <button className="icon-btn" onClick={() => openViewModal(c)} title="View Details">
                          <Eye size={16} />
                        </button>
                        {!readOnly && (
                          <>
                            <button className="icon-btn" onClick={() => openEditModal(c)} title="Edit Contact">
                              <Edit size={16} />
                            </button>
                            <button className="icon-btn" onClick={() => handleDeleteContact(c)} title="Delete Contact">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit / View Contact Modal */}
      {isModalOpen && (
        <>
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} />
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>
                  {modalMode === 'create' ? 'Create New Contact' : modalMode === 'edit' ? 'Edit Contact' : 'Contact Details'}
                </h3>
                <p className="modal-description">
                  {modalMode === 'create' 
                    ? 'Add a new contact to the organization. Each organization must have exactly one Applicant.' 
                    : modalMode === 'edit' 
                      ? 'Edit contact information. Each organization must have exactly one Applicant.' 
                      : 'Detailed information about the contact.'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Basic Information */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="\d{10}"
                      placeholder="10 digits"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    placeholder="Enter job title"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              {/* Contact Roles */}
              <div className="form-section">
                <div className="section-header">
                  <Shield size={18} />
                  <h4>Contact Roles <span className="required">*</span></h4>
                </div>
                <p className="helper-text">Select one or more roles for this contact. Each organization must have exactly one Applicant.</p>

                {/* Warning Box */}
                {hasApplicantForForm && (
                  <div className="warning-box">
                    <AlertCircle size={18} />
                    <span>This organization already has an Applicant. Only one Applicant is allowed per organization.</span>
                  </div>
                )}

                {/* Role Cards */}
                <div className="role-cards">
                  <div className={`role-card ${selectedRoles.applicant ? 'selected' : ''} ${hasApplicantForForm ? 'disabled' : ''}`}>
                    <div className="role-checkbox">
                      <input
                        type="checkbox"
                        id="applicant"
                        checked={selectedRoles.applicant}
                        onChange={() => handleRoleChange('applicant')}
                        disabled={hasApplicantForForm || modalMode === 'view'}
                      />
                      <label htmlFor="applicant">
                        <div className="role-info">
                          <div className="role-title">
                            <span>Applicant</span>
                            <span className="badge-required">REQUIRED</span>
                          </div>
                          <p className="role-description">Primary contact responsible for the organization's registration. Each organization must have exactly one.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className={`role-card ${selectedRoles.representative ? 'selected' : ''}`}>
                    <div className="role-checkbox">
                      <input
                        type="checkbox"
                        id="representative"
                        checked={selectedRoles.representative}
                        onChange={() => handleRoleChange('representative')}
                        disabled={modalMode === 'view'}
                      />
                      <label htmlFor="representative">
                        <div className="role-info">
                          <div className="role-title">
                            <span>Representative</span>
                            <span className="badge-optional">OPTIONAL</span>
                          </div>
                          <p className="role-description">Business representative for the organization. Can be combined with LRAO role on the same contact.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className={`role-card ${selectedRoles.lrao ? 'selected' : ''}`}>
                    <div className="role-checkbox">
                      <input
                        type="checkbox"
                        id="lrao"
                        checked={selectedRoles.lrao}
                        onChange={() => handleRoleChange('lrao')}
                        disabled={modalMode === 'view'}
                      />
                      <label htmlFor="lrao">
                        <div className="role-info">
                          <div className="role-title">
                            <span>LRAO (Local Registration Authority Officer)</span>
                            <span className="badge-optional">OPTIONAL</span>
                          </div>
                          <p className="role-description">Registration authority officer responsible for identity verification. Can be combined with Representative role.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  disabled={modalMode === 'view'}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode === 'view' && !readOnly ? (
                <button className="btn-primary" onClick={() => setModalMode('edit')}>
                  <Edit size={16} />
                  <span>Edit Contact</span>
                </button>
              ) : modalMode !== 'view' ? (
                <button className="btn-primary" onClick={handleSubmit} disabled={!isFormValid()}>
                  {modalMode === 'create' ? 'Create Contact' : 'Save Changes'}
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OrganizationDetails;
