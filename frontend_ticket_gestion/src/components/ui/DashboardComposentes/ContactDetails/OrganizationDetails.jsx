// OrganizationDetails.jsx
import React, { useState } from 'react';
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
  AlertCircle,
  CheckSquare,
  Square,
  User,
  Users,
  Award
} from 'lucide-react';
import './OrganizationDetails.css';

function OrganizationDetails({  onBack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    organization: 'Al-Rashid Group',
    systemRole: 'User',
    status: 'Active',
    roles: {
      applicant: false,
      representative: false,
      lrao: false
    }
  });

  const hasApplicant = true; // Organization already has an Applicant
  const [selectedRoles, setSelectedRoles] = useState({
    applicant: false,
    representative: false,
    lrao: false
  });

  const handleRoleChange = (role) => {
    if (role === 'applicant' && hasApplicant) return;
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone &&
           (selectedRoles.applicant || selectedRoles.representative || selectedRoles.lrao);
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      console.log('Creating contact:', { ...formData, roles: selectedRoles });
      setIsModalOpen(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        organization: 'Al-Rashid Group',
        systemRole: 'User',
        status: 'Active'
      });
      setSelectedRoles({
        applicant: false,
        representative: false,
        lrao: false
      });
    }
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
          <h1 className="org-name">Al-Rashid Group</h1>
          <div className="org-id">ORG-001</div>
          <div className="org-badges">
            <span className="badge badge-blue">2 contacts</span>
            <span className="badge badge-green">Complete Setup</span>
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
              <div className="info-value">Financial Services</div>
            </div>
          </div>
          <div className="info-box">
            <Mail size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Contact Email</div>
              <div className="info-value">info@alrashidgroup.ae</div>
            </div>
          </div>
          <div className="info-box">
            <Phone size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Contact Phone</div>
              <div className="info-value">+971 4 567 8901</div>
            </div>
          </div>
          <div className="info-box">
            <MapPin size={20} className="icon-blue" />
            <div className="info-content">
              <div className="info-label">Address</div>
              <div className="info-value">Emirates Towers, Level 42, Sheikh Zayed Road, Dubai, UAE</div>
            </div>
          </div>
          <div className="info-box">
            <Calendar size={20} className="icon-green" />
            <div className="info-content">
              <div className="info-label">Created At</div>
              <div className="info-value">May 10, 2023 at 10:00 AM</div>
            </div>
          </div>
          <div className="info-box">
            <Calendar size={20} className="icon-green" />
            <div className="info-content">
              <div className="info-label">Last Updated</div>
              <div className="info-value">March 15, 2026 at 11:30 AM</div>
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
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Create Contact</span>
          </button>
        </div>

        {/* Statistics Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Executive</div>
            <div className="stat-number stat-purple">1</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Representative</div>
            <div className="stat-number stat-blue">1</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">LRAO</div>
            <div className="stat-number stat-yellow">0</div>
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
              <tr>
                <td className="contact-id">CNT-001</td>
                <td>
                  <div className="contact-name">
                    <div className="avatar avatar-blue">AA</div>
                    <span>Ahmed Al-Rashid</span>
                  </div>
                </td>
                <td>
                  <span className="pill pill-purple">Applicant</span>
                </td>
                <td>
                  <div className="contact-email">
                    <Mail size={14} />
                    <span>ahmed.rashid@company.ae</span>
                  </div>
                </td>
                <td>
                  <div className="contact-phone">
                    <Phone size={14} />
                    <span>+971 50 123 4567</span>
                  </div>
                </td>
                <td>Chief Executive Officer</td>
                <td>
                  <span className="pill pill-green">Active</span>
                </td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn"><Eye size={16} /></button>
                    <button className="icon-btn"><Edit size={16} /></button>
                    <button className="icon-btn"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="contact-id">CNT-002</td>
                <td>
                  <div className="contact-name">
                    <div className="avatar avatar-blue">KA</div>
                    <span>Khalid Al-Mansoori</span>
                  </div>
                </td>
                <td>
                  <span className="pill pill-blue">Representative</span>
                </td>
                <td>
                  <div className="contact-email">
                    <Mail size={14} />
                    <span>khalid.mansoori@company.ae</span>
                  </div>
                </td>
                <td>
                  <div className="contact-phone">
                    <Phone size={14} />
                    <span>+971 50 234 5678</span>
                  </div>
                </td>
                <td>Business Representative</td>
                <td>
                  <span className="pill pill-green">Active</span>
                </td>
                <td>
                  <div className="action-icons">
                    <button className="icon-btn"><Eye size={16} /></button>
                    <button className="icon-btn"><Edit size={16} /></button>
                    <button className="icon-btn"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Contact Modal */}
      {isModalOpen && (
        <>
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} />
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Create New Contact</h3>
                <p className="modal-description">Add a new contact to the organization. Each organization must have exactly one Applicant.</p>
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
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      placeholder="Enter job title"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization <span className="required">*</span></label>
                    <select
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    >
                      <option>Al-Rashid Group</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>System Role Label</label>
                  <select
                    value={formData.systemRole}
                    onChange={(e) => setFormData({...formData, systemRole: e.target.value})}
                  >
                    <option>User</option>
                    <option>Admin</option>
                    <option>Manager</option>
                  </select>
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
                <div className="warning-box">
                  <AlertCircle size={18} />
                  <span>This organization already has an Applicant. Only one Applicant is allowed per organization.</span>
                </div>

                {/* Role Cards */}
                <div className="role-cards">
                  <div className={`role-card ${selectedRoles.applicant ? 'selected' : ''} ${hasApplicant ? 'disabled' : ''}`}>
                    <div className="role-checkbox">
                      <input
                        type="checkbox"
                        id="applicant"
                        checked={selectedRoles.applicant}
                        onChange={() => handleRoleChange('applicant')}
                        disabled={hasApplicant}
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
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!isFormValid()}>
                Create Contact
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OrganizationDetails;