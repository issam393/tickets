import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User as UserIcon,
  AtSign,
  Mail,
  IdCard,
  Building2,
  Hash,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAuthUser, getDefaultRouteForRole, normalizeRole } from "../../../lib/authAccess";
import "./ProfilePage.css";

const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();

const statusConfig = {
  Active: { label: "Active", dot: "active-status-dot-class", badge: "active-status-badge-style" },
  Inactive: { label: "Inactive", dot: "inactive-status-dot-class", badge: "inactive-status-badge-style" },
};

const serviceOptions = [
  { id: 1, name: "IT" },
  { id: 2, name: "SD" },
  { id: 3, name: "MANAGER" },
  { id: 4, name: "ADMIN" },
  { id: 5, name: "PKI" },
];

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Inactive;
  return (
    <span className={`user-status-badge-element ${cfg.badge}`}>
      <span className={`user-status-dot-icon ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// Editable text field
const EditableText = ({ icon: Icon, label, value, onSave, type = "text", mono = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isEditing) setDraft(value);
  }, [isEditing, value]);

  const handleSave = () => {
    if (draft !== value) onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  return (
    <div className={`editable-info-card-wrapper ${isEditing ? "active-edit-mode-style" : ""}`}>
      <div className="card-icon-container-box"><Icon className="small-icon-size-main" /></div>
      <div className="card-content-wrapper-area">
        <p className="field-label-text-style">{label}</p>
        {isEditing ? (
          <div className="edit-controls-wrapper-flex">
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="edit-input-field-style"
              autoFocus
            />
            <button onClick={handleSave} className="save-edit-button-style"><Check size={16} /></button>
            <button onClick={handleCancel} className="cancel-edit-button-style"><X size={16} /></button>
          </div>
        ) : (
          <div className="display-controls-flex-row">
            <p className={`field-value-text-style ${mono ? "mono-font-family-style" : ""}`}>{value}</p>
            <button onClick={() => setIsEditing(true)} className="edit-trigger-button-ui">
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Editable select field
const EditableSelect = ({ icon: Icon, label, value, options, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isEditing) setDraft(value);
  }, [isEditing, value]);

  const handleSave = () => {
    if (draft !== value) onSave(draft);
    setIsEditing(false);
  };

  const getDisplayValue = () => {
    const option = options.find(opt => opt.id === value || opt.name === value);
    return option ? option.name : value;
  };

  return (
    <div className={`editable-info-card-wrapper ${isEditing ? "active-edit-mode-style" : ""}`}>
      <div className="card-icon-container-box"><Icon className="small-icon-size-main" /></div>
      <div className="card-content-wrapper-area">
        <p className="field-label-text-style">{label}</p>
        {isEditing ? (
          <div className="edit-controls-wrapper-flex">
            <select
              value={draft}
              onChange={(e) => setDraft(parseInt(e.target.value))}
              className="edit-select-field-style"
              autoFocus
            >
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
            <button onClick={handleSave} className="save-edit-button-style"><Check size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="cancel-edit-button-style"><X size={16} /></button>
          </div>
        ) : (
          <div className="display-controls-flex-row">
            <p className="field-value-text-style mono-font-family-style">{getDisplayValue()}</p>
            <button onClick={() => setIsEditing(true)} className="edit-trigger-button-ui">
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Editable status field - FIXED to update properly
const EditableStatus = ({ status, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(status);

  useEffect(() => {
    if (isEditing) setDraft(status);
  }, [isEditing, status]);

  const handleSave = () => {
    if (draft !== status) {
      onSave("status", draft);
    }
    setIsEditing(false);
  };

  return (
    <div className={`editable-info-card-wrapper ${isEditing ? "active-edit-mode-style" : ""}`}>
      <div className="card-icon-container-box"><ShieldAlert className="small-icon-size-main" /></div>
      <div className="card-content-wrapper-area">
        <p className="field-label-text-style">Account Status</p>
        {isEditing ? (
          <div className="edit-controls-wrapper-flex">
            <select value={draft} onChange={(e) => setDraft(e.target.value)} className="edit-select-field-style">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button onClick={handleSave} className="save-edit-button-style"><Check size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="cancel-edit-button-style"><X size={16} /></button>
          </div>
        ) : (
          <div className="display-controls-flex-row">
            <StatusBadge status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

// Password modal with toast only
const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      const response = await fetch(`http://localhost:2300/api/employees/EditEmp/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Password updated successfully");
        handleClose();
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (_err) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-background-dark" onClick={handleClose}>
      <div className="modal-container-content-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-section-flex">
          <KeyRound className="modal-header-icon-style" />
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field-group">
            <label>New Password</label>
            <div className="password-input-wrapper-flex">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="modal-form-field-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper-flex">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="modal-actions-button-group">
            <button type="button" onClick={handleClose} className="modal-btn-cancel-style">Cancel</button>
            <button type="submit" className="modal-btn-primary-style" disabled={submitting}>
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:2300/api/employees/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    
      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
      } else {
        toast.error(data.error || data.message || "Failed to load profile");
      }
    } catch (_err) {
      toast.error("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) fetchUserData();
    else toast.error("Please login again");
  }, []);

  const updateField = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:2300/api/employees/EditEmp/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser((prev) => ({ ...prev, [field]: value }));
        toast.success(`${field} updated successfully`);
      } else {
        toast.error(data.error || `Failed to update ${field}`);
      }
    } catch (err) {
      toast.error("Network error",err);
    }
  };

  if (loading) return <div className="profile-page-main-container"><div className="loading-state-indicator">Loading...</div></div>;
  if (!user) return <div className="profile-page-main-container"><div className="error-state-indicator">User not found</div></div>;

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = getInitials(user.firstName, user.lastName);
  const dashboardRoute = getDefaultRouteForRole(
    getAuthUser()?.role || normalizeRole(user.service_name)
  );
  return (
    <main className="profile-page-main-container">
      <div className="profile-content-wrapper-box">
        <div className="back-navigation-section">
          <a href={dashboardRoute} className="back-link-button-style">
            <ArrowLeft className="small-icon-size-main" />
            Back to Dashboard
          </a>
        </div>

        <div className="profile-main-card-container">
          <div className="profile-header-gradient-area">
            <div className="profile-header-glow-effect" />
            <div className="profile-header-flex-inner">
              <div className="user-avatar-section">
                <div className="avatar-circle-display">
                  {initials}
                </div>
              </div>
              <div className="user-info-details-block">
                <h1 className="user-full-name-text">{fullName}</h1>
                <p className="user-username-display">
                  <AtSign className="inline-icon-style" />
                  {user.userName}
                </p>
                <div className="user-badges-wrapper">
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body-content-area">
            <FormSection icon={UserIcon} title="Personal Information">
            <div className="form-grid-layout-two-cols">
  <EditableText icon={UserIcon} label="First Name" value={user.firstName} onSave={(v) => updateField("firstName", v)} />
  <EditableText icon={UserIcon} label="Last Name" value={user.lastName} onSave={(v) => updateField("lastName", v)} />
  <EditableText icon={AtSign} label="Username" value={user.userName} onSave={(v) => updateField("userName", v)} />
  <EditableText icon={Mail} label="Email" value={user.email} onSave={(v) => updateField("email", v)} type="email" />
</div>
<div style={{ marginTop: '0.75rem' }}>
  <EditableStatus status={user.status} onSave={updateField} />
</div>
            </FormSection>

            <FormSection icon={Hash} title="System Information">
  <EditableSelect 
    icon={Building2} 
    label="Service" 
    value={user.service_id} 
    options={serviceOptions}
    onSave={(v) => updateField("service_id", v)} 
  />
</FormSection>

            <FormSection icon={ShieldCheck} title="Security">
              <div className="security-card-interactive-box" onClick={() => setPasswordModalOpen(true)}>
                <div className="security-icon-wrapper">
                  <KeyRound className="medium-icon-size" />
                </div>
                <div className="security-text-content">
                  <h3>Change Password</h3>
                  <p>Click to update your password</p>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      </div>

      <PasswordChangeModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </main>
  );
};

const FormSection = ({ icon: Icon, title, children }) => (
  <div className="form-section-wrapper">
    <div className="form-section-header-row">
      <Icon className="form-section-header-icon" />
      <h2 className="form-section-title-text">{title}</h2>
      <div className="form-section-divider-line" />
    </div>
    {children}
  </div>
);

export default ProfilePage;
