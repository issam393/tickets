import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserIdentityBar from "../../components/ui/DashboardComposentes/UserIdentityBar";
import "./AdminDashboard.css";

const SERVICES_DATA = {
  1: { key: 1, label: "IT", tone: "primary" },
  2: { key: 2, label: "SD", tone: "info" },
  3: { key: 3, label: "MANAGER", tone: "warning" },
  4: { key: 4, label: "ADMIN", tone: "destructive" },
  5: { key: 5, label: "PKI", tone: "success" },
};

const getInitials = (first, last) => `${first[0]}${last[0]}`.toUpperCase();

const BADGE_CLASSES = {
  destructive: "ad-badge-destructive",
  info: "ad-badge-info",
  primary: "ad-badge-primary",
  success: "ad-badge-success",
  warning: "ad-badge-warning",
};

const StatsCard = ({ label, value, icon: Icon, tone }) => (
  <div className={`ad-stats-card ad-stats-card-${tone}`}>
    <div className="ad-stats-card-content">
      <p className="ad-stats-card-label">{label}</p>
      <p className="ad-stats-card-value">{value}</p>
    </div>
    <div className="ad-stats-card-icon">
      <Icon size={20} strokeWidth={2} />
    </div>
  </div>
);

const ServiceDistribution = ({ counts }) => (
  <div className="ad-role-distribution">
    <div className="ad-role-distribution-header">
      <h2>Service Distribution</h2>
      <p>Breakdown of internal users by assigned service</p>
    </div>
    <div className="ad-role-distribution-grid">
      {Object.values(SERVICES_DATA).map((service) => (
        <div key={service.key} className="ad-role-card">
          <span className={`ad-role-badge ${BADGE_CLASSES[service.tone]}`}>
            {service.label}
          </span>
          <p className="ad-role-count">{counts[service.key] ?? 0}</p>
        </div>
      ))}
    </div>
  </div>
);

const FilterPills = ({ options, value, onChange }) => (
  <div className="ad-filter-pills">
    {options.map((opt) => (
      <button
        key={opt.value}
        className={`ad-filter-pill ${opt.value === value ? "ad-active" : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const validatePasswordValue = (value) => {
  if (!value) return "Password is required";

  const checks = [];
  if (value.length < 8) checks.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) checks.push("an uppercase letter");
  if (!/[a-z]/.test(value)) checks.push("a lowercase letter");
  if (!/\d/.test(value)) checks.push("a number");
  if (!/[@$!%*?&+=-_]/.test(value)) checks.push("a special character (@$!%*?&+=-_)");

  return checks.length ? `Password must contain: ${checks.join(", ")}` : "";
};

const UserTable = ({ users, onToggleStatus, onEdit, onPassword, onDelete }) => {
  const avatarGradient = (id) => {
    const gradients = ["ad-avatar-gradient-1", "ad-avatar-gradient-2", "ad-avatar-gradient-3", "ad-avatar-gradient-4", "ad-avatar-gradient-5", "ad-avatar-gradient-6"];
    const sum = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return gradients[sum % gradients.length];
  };

  return (
    <div className="ad-user-table-container">
      <table className="ad-user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>UserName</th>
            <th>Email</th>
            <th>Service</th>
            <th>Status</th>
            <th className="ad-actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const service = SERVICES_DATA[u.service_id] || { label: u.service_id || "Unknown", tone: "info" };
            return (
              <tr key={u.id}>
                <td className="ad-user-id">{u.id}</td>
                <td>
                  <div className="ad-user-name">
                    <div className={`ad-avatar ${avatarGradient(u.id)}`}>
                      {getInitials(u.firstName, u.lastName)}
                    </div>
                    <span>{u.firstName}</span>
                  </div>
                </td>
                <td>{u.lastName}</td>
                <td>{u.userName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`ad-role-badge ${BADGE_CLASSES[service.tone]}`}>
                    {service.label}
                  </span>
                </td>
                <td>
                  {u.status === "Active" ? (
                    <span className="ad-status-badge ad-active">
                      <span className="ad-status-dot ad-active"></span>
                      Active
                    </span>
                  ) : (
                    <span className="ad-status-badge ad-inactive">
                      <span className="ad-status-dot ad-inactive"></span>
                      Inactive
                    </span>
                  )}
                </td>
                <td className="ad-actions-cell">
                  <button
                    className="ad-action-btn ad-status"
                    onClick={() => onToggleStatus(u)}
                    title={u.status === "Active" ? "Deactivate" : "Activate"}
                  >
                    {u.status === "Active" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </button>
                  <button
                    className="ad-action-btn ad-edit"
                    onClick={() => onEdit(u)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="ad-action-btn ad-password"
                    onClick={() => onPassword(u)}
                    title="Change password"
                  >
                    <KeyRound size={16} />
                  </button>
                  <button
                    className="ad-action-btn ad-delete"
                    onClick={() => onDelete(u)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan="8" className="ad-empty-message">
                No users match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, description, children }) => {
  if (!isOpen) return null;
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        <div className="ad-modal-body">{children}</div>
      </div>
    </div>
  );
};

const DeleteUserModal = ({ user, open, onOpenChange, onConfirm }) => (
  <Modal
    isOpen={open}
    onClose={() => onOpenChange(false)}
    title="Delete User"
    description={
      <>
        Are you sure you want to delete{" "}
        <strong>{user ? `${user.firstName} ${user.lastName}` : "this user"}</strong>?
        This action cannot be undone.
      </>
    }
  >
    <div className="ad-modal-actions" style={{ marginTop: 0 }}>
      <button className="ad-modal-btn ad-cancel" onClick={() => onOpenChange(false)}>
        Cancel
      </button>
      <button className="ad-modal-btn ad-delete" onClick={onConfirm}>
        Delete User
      </button>
    </div>
  </Modal>
);

const ChangePasswordModal = ({ user, open, onOpenChange, onSave }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, user]);

  const passwordError = validatePasswordValue(password);
  const confirmError = confirmPassword && password !== confirmPassword ? "Passwords do not match" : "";
  const canSave = Boolean(password && confirmPassword && !passwordError && !confirmError);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) {
      toast.error(passwordError || confirmError || "Please enter and confirm the new password");
      return;
    }
    onSave(user, password);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Change Password"
      description={
        <>
          Set a new password for{" "}
          <strong>{user ? `${user.firstName} ${user.lastName}` : "this employee"}</strong>.
        </>
      }
    >
      <form id="password-form" onSubmit={handleSubmit}>
        <fieldset className="ad-edit-form-section">
          <legend>Password</legend>
          <div className="ad-form-row">
            <div className="ad-form-field">
              <label>New Password *</label>
              <div className="ad-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  className="ad-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {passwordError && password && <p className="ad-field-error">{passwordError}</p>}
            </div>

            <div className="ad-form-field">
              <label>Confirm Password *</label>
              <div className="ad-password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  className="ad-password-toggle"
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {confirmError && <p className="ad-field-error">{confirmError}</p>}
            </div>
          </div>
        </fieldset>
      </form>

      <div className="ad-modal-actions">
        <button type="button" className="ad-modal-btn ad-cancel" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
        <button
          type="submit"
          form="password-form"
          className="ad-modal-btn ad-save"
          disabled={!canSave}
          style={{
            cursor: !canSave ? "not-allowed" : "pointer",
            backgroundColor: !canSave ? "#cccccc" : "",
            opacity: !canSave ? 0.6 : 1
          }}
        >
          Update Password
        </button>
      </div>
    </Modal>
  );
};

const EditUserModal = ({ user, open, onOpenChange, onSave }) => {
  const [form, setForm] = useState(user);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    setForm(user);
  }, [user]);
  
  const validateForm = (formData) => {
    const requiredFields = ['firstName', 'lastName', 'userName', 'email'];
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
    
    const emailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    
    return allFieldsFilled && emailValid;
  };
  
  useEffect(() => {
    if (form) {
      setIsValid(validateForm(form));
    }
  }, [form]);
  
  if (!form) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSave(form);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Edit User"
      description="Update profile, service and account status for this employee."
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        <fieldset className="ad-edit-form-section">
          <legend>Basic Information</legend>
          <div className="ad-form-row">
            <div className="ad-form-field">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="ad-form-field">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="ad-form-field">
              <label>Username *</label>
              <input
                type="text"
                required
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
              />
            </div>
            <div className="ad-form-field">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="ad-edit-form-section">
          <legend>Service</legend>
          <div className="ad-form-row">
            <div className="ad-form-field">
              <label>Service</label>
              <select
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: parseInt(e.target.value) })}
              >
                <option value={1}>IT</option>
                <option value={2}>SD</option>
                <option value={3}>MANAGER</option>
                <option value={4}>ADMIN</option>
                <option value={5}>PKI</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="ad-edit-form-section">
          <legend>Account Status</legend>
          <div className="ad-form-field">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </fieldset>
      </form>
      <div className="ad-modal-actions">
        <button type="button" className="ad-modal-btn ad-cancel" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
        <button 
          type="submit" 
          form="modal-form" 
          className="ad-modal-btn ad-save"
          disabled={!isValid}
          style={{
            cursor: !isValid ? "not-allowed" : "pointer",
            backgroundColor: !isValid ? "#cccccc" : "",
            opacity: !isValid ? 0.6 : 1
          }}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

const CreateUserModalComponent = ({ open, onOpenChange, onCreate }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    service_id: 1,
    status: "Active"
  });

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const closeModal = () => {
    setShowPassword(false);
    onOpenChange(false);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "This field is required";
        else if (!/^[A-Za-z]+$/.test(value)) error = "Only letters allowed";
        break;

      case "userName":
        if (!value.trim()) error = "Username is required";
        else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value))
          error = "Must start with a letter and can contain letters, numbers, and underscores only";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format (example: user@domain.com)";
        break;

      case "password":
        if (!value) error = "Password is required";
        else {
          const checks = [];
          error = validatePasswordValue(value);
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  useEffect(() => {
    const requiredFields = ['firstName', 'lastName', 'userName', 'email', 'password'];
    let allValid = true;
    
    requiredFields.forEach(field => {
      if (!form[field] || form[field].toString().trim() === '') {
        allValid = false;
      }
    });
    
    const hasErrors = Object.values(errors).some(error => error !== '');
    const isValidForm = allValid && !hasErrors;
    
    setIsValid(isValidForm);
  }, [form, errors]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = Object.keys(form).every(key => {
      if (key === "service_id" || key === "status") return true;
      return validateField(key, form[key]);
    });

    if (isValid) {
      onCreate(form);
      setForm({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        password: "",
        service_id: 1,
        status: "Active"
      });
      setErrors({});
      closeModal();
    } else {
      toast.error("Please fix all errors before submitting");
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={closeModal}
      title="Create User"
      description="Fill out the form below to create a new internal user account."
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        <fieldset className="ad-edit-form-section">
          <legend>Basic Information</legend>
          <div className="ad-form-row">
            <div className="ad-form-field">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              {errors.firstName && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.firstName}</p>}
            </div>

            <div className="ad-form-field">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
              {errors.lastName && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.lastName}</p>}
            </div>

            <div className="ad-form-field">
              <label>Username *</label>
              <input
                type="text"
                required
                value={form.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
              />
              {errors.userName && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.userName}</p>}
            </div>

            <div className="ad-form-field">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.email}</p>}
            </div>

            <div className="ad-form-field">
              <label>Password *</label>
              <div className="ad-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button
                  className="ad-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{errors.password}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="ad-edit-form-section">
          <legend>Service</legend>
          <div className="ad-form-row">
            <div className="ad-form-field">
              <label>Service</label>
              <select
                value={form.service_id}
                onChange={(e) => handleChange("service_id", parseInt(e.target.value))}
              >
                <option value={1}>IT</option>
                <option value={2}>SD</option>
                <option value={3}>MANAGER</option>
                <option value={4}>ADMIN</option>
                <option value={5}>PKI</option>
              </select>
            </div>
          </div>
        </fieldset>
      </form>
      <div className="ad-modal-actions">
        <button type="button" className="ad-modal-btn ad-cancel" onClick={closeModal}>
          Cancel
        </button>
        <button 
          type="submit" 
          form="modal-form" 
          className="ad-modal-btn ad-save"
          disabled={!isValid}
          style={{
            cursor: !isValid ? "not-allowed" : "pointer",
            backgroundColor: !isValid ? "#cccccc" : "",
            opacity: !isValid ? 0.6 : 1
          }}
        >
          Create User
        </button>
      </div>
    </Modal>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const SERVICE_FILTER_OPTIONS = useMemo(() => {
    const options = [{ value: "all", label: "All Services" }];
    Object.values(SERVICES_DATA).forEach(service => {
      options.push({ value: service.key.toString(), label: service.label });
    });
    return options;
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/');
        return;
      }
  
      const response = await fetch("http://localhost:2300/api/employees/GetAllEmps", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        toast.error('Session expired. Please login again');
        navigate('/');
        return;
      }

      if (response.status === 403) {
        toast.error('Action non autorisée.');
        setUsers([]);
        return;
      }
      
      const data = await response.json();
      if (response.ok) setUsers(data.data || []);
      else toast.error(data.error || "Failed to fetch users");
    } catch (_error) {
      toast.error("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const filtered = useMemo(() => users.filter(u => {
    if (serviceFilter !== "all" && u.service_id !== parseInt(serviceFilter)) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.userName} ${u.id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [users, serviceFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "Active").length,
    inactive: users.filter(u => u.status !== "Active").length,
  }), [users]);

  const serviceCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    users.forEach(u => {
      if (c[u.service_id] !== undefined) c[u.service_id] += 1;
    });
    return c;
  }, [users]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch(`http://localhost:2300/api/employees/EditEmp/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchUsers();
        toast.success(`User ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Update failed");
      }
    } catch (_error) {
      toast.error("Cannot connect to server");
    }
  };

  const handleSaveEdit = async (updated) => {
    try {
      const updateData = {
        firstName: updated.firstName,
        lastName: updated.lastName,
        userName: updated.userName,
        email: updated.email,
        service_id: updated.service_id,
        status: updated.status
      };

      const response = await fetch(`http://localhost:2300/api/employees/EditEmp/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        fetchUsers();
        setEditing(null);
        toast.success("User updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("Cannot connect to server", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      const response = await fetch(`http://localhost:2300/api/employees/DeleteEmp/${deleting.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
        toast.success("User deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Cannot connect to server", error);
    }
    setDeleting(null);
  };

  const handleChangePassword = async (user, password) => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:2300/api/employees/ChangePassword/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setPasswordUser(null);
        toast.success("Password updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Password update failed");
      }
    } catch (_error) {
      toast.error("Cannot connect to server");
    }
  };

  const handleCreateUser = async (newUserData) => {
    try {
      const createData = {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        userName: newUserData.userName,
        password: newUserData.password,
        service_id: newUserData.service_id,
        status: newUserData.status
      };

      const response = await fetch("http://localhost:2300/api/employees/InsertEmp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(createData)
      });
      if (response.ok) {
        fetchUsers();
        setCreateOpen(false);
        toast.success("User created successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Create failed");
      }
    } catch (error) {
      toast.error("Cannot connect to server", error);
    }
  };

  if (loading) return <div className="ad-admin-dashboard"><div className="ad-loading">Loading...</div></div>;

  return (
    <div className="ad-admin-dashboard" style={{ overflowY: 'auto', height: '100vh' }}>
      <div className="ad-top-navigation-bar">
        <UserIdentityBar />
      </div>

      <main className="ad-dashboard-main">
        <header className="ad-dashboard-header">
          <div className="ad-dashboard-header-icon">
            <ShieldAlert size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1>System Administration</h1>
            <p>Manage internal users and system access</p>
          </div>
        </header>

        <div className="ad-stats-grid">
          <StatsCard label="Total Users" value={stats.total} icon={Users} tone="primary" />
          <StatsCard label="Active Users" value={stats.active} icon={CheckCircle2} tone="success" />
          <StatsCard label="Inactive Users" value={stats.inactive} icon={XCircle} tone="destructive" />
        </div>

        <ServiceDistribution counts={serviceCounts} />

        <section className="ad-user-management">
          <div className="ad-user-management-header">
            <div className="ad-user-management-title">
              <div className="ad-user-management-icon">
                <UserCheck size={20} />
              </div>
              <div>
                <h2>User Management</h2>
                <p>Create, edit, and manage internal AGCE employees</p>
              </div>
            </div>
            <button className="ad-create-user-btn" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Create User
            </button>
          </div>

          <div className="ad-filters-container">
            <div className="ad-filters-left">
              <div className="ad-search-wrapper">
                <Search size={16} className="ad-search-icon" />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <FilterPills
                options={SERVICE_FILTER_OPTIONS}
                value={serviceFilter}
                onChange={setServiceFilter}
              />
            </div>

            <div className="ad-filters-right">
              <span className="ad-status-label">Status</span>
              <FilterPills
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          <UserTable
            users={filtered}
            onToggleStatus={handleToggleStatus}
            onEdit={setEditing}
            onPassword={setPasswordUser}
            onDelete={setDeleting}
          />

          <div className="ad-table-footer">
            <p>
              Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users
            </p>
            <p className="ad-connection-secured">
              <ShieldCheck size={14} />
              Connection secured · TLS 1.3
            </p>
          </div>
        </section>
      </main>

      <EditUserModal
        user={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={handleSaveEdit}
      />

      <DeleteUserModal
        user={deleting}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleConfirmDelete}
      />

      <ChangePasswordModal
        user={passwordUser}
        open={!!passwordUser}
        onOpenChange={(open) => !open && setPasswordUser(null)}
        onSave={handleChangePassword}
      />

      <CreateUserModalComponent
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateUser}
      />
    </div>
  );
};

export default AdminDashboard;
