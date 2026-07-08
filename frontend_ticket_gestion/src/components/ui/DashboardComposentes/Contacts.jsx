import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, Eye, Trash2, Edit, Check, X, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import "./Contacts.css";
import OrganizationDetails from "./ContactDetails/OrganizationDetails";
import { API_BASE_URL } from "../../../lib/apiConfig";

const API = API_BASE_URL;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;

function validateContactDetails(email, phone) {
  if (!EMAIL_PATTERN.test(String(email || "").trim())) {
    return "Please enter a valid email address.";
  }
  if (!PHONE_PATTERN.test(String(phone || "").trim())) {
    return "Phone number must contain exactly 10 digits.";
  }
  return "";
}

function getToken() {
  return localStorage.getItem("token");
}

const CONTACT_TYPES = [
  "Applicant",
  "Consultant",
  "Government Official",
  "Legal Representative",
  "Technical Expert",
];

const INDUSTRIES = [
  "Financial Services",
  "Management Consulting",
  "Government",
  "Legal Services",
  "Technology",
  "Healthcare",
  "Retail",
  "Manufacturing",
];
function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.service;
    if (String(role).toUpperCase() === 'MANAGER') return 'Manager';
    return role;
  } catch {
    return null;
  }
}

function Contacts({ readOnly = false }) {
  const role = getUserRole();
  const isReadOnly = readOnly || role === 'Manager';
  const hasAccess = role === 'SD' || role === 'Manager';
  const renderViewportModal = (content) => (
    typeof document === "undefined" ? content : createPortal(content, document.body)
  );
  const [searchTerm, setSearchTerm]             = useState("");
  const [activeTab, setActiveTab]               = useState("contacts");
  const [contacts, setContacts]                 = useState([]);
  const [organizations, setOrganizations]       = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedItem, setSelectedItem]         = useState(null);
  const [dialogType, setDialogType]             = useState("");
  const [isEditing, setIsEditing]               = useState(false);
  const [editedData, setEditedData]             = useState(null);
  const [activeField, setActiveField]           = useState(null);
  const [isAddOrgOpen, setIsAddOrgOpen]         = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [deleteDialog, setDeleteDialog]         = useState({ open: false, item: null, type: null });
  const [newOrg, setNewOrg]                     = useState({ name: "", industry: "", email: "", phone: "", address: "" });
  const [error, setError]                       = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [cRes, oRes] = await Promise.all([
        fetch(`${API}/contacts`, { headers }),
        fetch(`${API}/organizations`, { headers }),
      ]);
      const [cJson, oJson] = await Promise.all([cRes.json(), oRes.json()]);
      if (!cRes.ok) throw new Error(cJson.error || cJson.message || "Failed to load contacts");
      if (!oRes.ok) throw new Error(oJson.error || oJson.message || "Failed to load organizations");
      setContacts(cJson.data || []);
      setOrganizations(oJson.data || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load data");
      toast.error(loadError.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── filter ─────────────────────────────────────────────────────────────────
  const filteredContacts = contacts.filter((c) =>
    Object.values(c).some((v) => String(v ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredOrgs = organizations.filter((o) =>
    Object.values(o).some((v) => String(v ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ── view / edit ────────────────────────────────────────────────────────────
  const openView = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(false);
    setEditedData(null);
    setActiveField(null);
  };

  const openEdit = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(true);
    setEditedData({ ...item });
    setActiveField(null);
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setEditedData(null);
    setActiveField(null);
  };

  const handleFieldChange = (field, value) =>
    setEditedData((prev) => ({ ...prev, [field]: value }));

  const handleSubmitEdit = async () => {
    const url     = dialogType === "contact" ? `${API}/contacts/${selectedItem.id}` : `${API}/organizations/${selectedItem.id}`;
    const payload = dialogType === "contact"
      ? { name: editedData.name, type: editedData.type, email: editedData.email, phone: editedData.phone, jobTitle: editedData.jobTitle, status: editedData.status }
      : { name: editedData.name, industry: editedData.industry, email: editedData.email, phone: editedData.phone, address: editedData.address, status: editedData.status };
    const validationMessage = validateContactDetails(payload.email, payload.phone);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    try {
      const res  = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      await fetchAll();
      closeDialog();
      toast.success(`${dialogType === "contact" ? "Contact" : "Organization"} updated successfully.`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const openDelete = (item, type) => {
    setDeleteDialog({ open: true, item, type });
  };

  const handleConfirmDelete = async () => {
    const { item, type } = deleteDialog;
    const url = type === "contact" ? `${API}/contacts/${item.id}` : `${API}/organizations/${item.id}`;
    try {
      const res  = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await fetchAll();
      setDeleteDialog({ open: false, item: null, type: null });
      toast.success(`${type === "contact" ? "Contact" : "Organization"} deleted successfully.`);
    } catch (e) {
      toast.error(e.message);
      setDeleteDialog({ open: false, item: null, type: null });
    }
  };

  // ── add organization ───────────────────────────────────────────────────────
  const handleAddOrg = async () => {
    if (!newOrg.name || !newOrg.industry || !newOrg.email || !newOrg.phone) {
      toast.error("Please fill all required fields.");
      return;
    }
    const validationMessage = validateContactDetails(newOrg.email, newOrg.phone);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    try {
      const res  = await fetch(`${API}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(newOrg),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      await fetchAll();
      setIsAddOrgOpen(false);
      setNewOrg({ name: "", industry: "", email: "", phone: "", address: "" });
      toast.success("Organization created successfully.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ── editable field renderer ────────────────────────────────────────────────
  const renderEditableField = (label, field, value, opts = { type: "text", selectOptions: null }) => {
    const isReadOnly      = field === "id";
    const currentValue    = isEditing ? editedData?.[field] ?? value : value;
    const isActiveField   = activeField === field;

    if (!isEditing || isReadOnly) {
      return (
        <div className="editable-field" key={field}>
          <div className="editable-field__label">{label}</div>
          <div className="editable-field__row">
            <div className="editable-field__value">{currentValue ?? "—"}</div>
          </div>
        </div>
      );
    }

    if (isActiveField) {
      return (
        <div className="editable-field" key={field}>
          <div className="editable-field__label">{label}</div>
          <div className="editable-field__row">
            <div className="editable-field__input">
              {opts.type === "select" && opts.selectOptions ? (
                <select value={currentValue} onChange={(e) => handleFieldChange(field, e.target.value)} className="dialog-input" style={{ borderRadius: "30px" }}>
                  {opts.selectOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : (
                <input
                  type={field === "phone" ? "tel" : opts.type}
                  value={currentValue ?? ""}
                  onChange={(e) => handleFieldChange(
                    field,
                    field === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value
                  )}
                  className="dialog-input"
                  style={{ borderRadius: "30px" }}
                  inputMode={field === "phone" ? "numeric" : undefined}
                  maxLength={field === "phone" ? 10 : undefined}
                  pattern={field === "phone" ? "\\d{10}" : undefined}
                />
              )}
            </div>
            <div className="editable-field__actions">
              <button className="confirm-field-btn" onClick={() => setActiveField(null)} type="button"><Check size={14} /></button>
              <button className="reject-field-btn" onClick={() => { handleFieldChange(field, selectedItem[field]); setActiveField(null); }} type="button"><X size={14} /></button>
            </div>
          </div>
        </div>
      );
    }

    return (

      <div className="editable-field" key={field}>
        <div className="editable-field__label">{label}</div>
        <div className="editable-field__row">
          <div className="editable-field__value">{currentValue ?? "—"}</div>
          <button className="editable-icon-btn" onClick={() => setActiveField(field)} type="button"><Pencil size={14} /></button>
        </div>
      </div>
    );
  };

  // ── org details view ───────────────────────────────────────────────────────
  if (selectedOrganization) {
    return (
      <OrganizationDetails
        organization={selectedOrganization}
        readOnly={isReadOnly}
        onBack={() => { setSelectedOrganization(null); fetchAll(); }}
      />
    );
  }

  // ── check if org has contacts (for delete warning) ─────────────────────────
  const orgHasContacts = (org) => contacts.some((c) => c.organizationId === org.id);
  if (!hasAccess) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--foreground)" }}>
        <h2>Access Denied</h2>
        <p>Your role does not have permission to view this section.</p>
      </div>
    );
  }
  return (
    <div className="contact_container">
      <div className="text_contact_container">
        <h1 className="contact_title">𝌕Contacts & Organizations</h1>
        <p className="sub_title_contact_text">Manage system contacts and organizations</p>
      </div>

      <div className="custom-tabs-container">
        <div className={`button-tabs ${activeTab === "organizations" ? "is-organization" : ""}`}>
          <button className={`tab-trigger ${activeTab === "contacts" ? "active" : ""}`} onClick={() => setActiveTab("contacts")}>
            Contacts ({contacts.length})
          </button>
          <button className={`tab-trigger ${activeTab === "organizations" ? "active" : ""}`} onClick={() => setActiveTab("organizations")}>
            Organizations ({organizations.length})
          </button>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "24px" }}>
          <div className="search_bar_contact" style={{ flex: 1 }}>
            <Search size={18} />
            <input type="text" placeholder="Search..." className="input_text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {activeTab === "organizations" && !isReadOnly && (
            <button style={{ position: "relative", top: "-10px" }} className="btn-add-organization" onClick={() => setIsAddOrgOpen(true)}>
              <Plus size={18} style={{ marginRight: "8px" }} /> Add Organization
            </button>
          )}
        </div>

        {loading && <p style={{ color: "#8b96b0", textAlign: "center" }}>Loading...</p>}
        {error   && <p style={{ color: "#f87171", textAlign: "center" }}>{error}</p>}

        <div className="tables-container">
          {/* ── CONTACTS TAB ── */}
          {activeTab === "contacts" && (
            <div className="custom-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="max-w-190">ID</th>
                    <th className="max-w-190">Name</th>
                    <th className="max-w-190">Type</th>
                    <th className="max-w-190">Email</th>
                    <th className="max-w-190">Phone</th>
                    <th className="max-w-190">Organization</th>
                    <th className="max-w-190">Status</th>
                    <th className="max-w-190">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                    <tr key={c.id}>
                      <td className="max-w-190">{c.id}</td>
                      <td className="max-w-190">{c.name}</td>
                      <td className="max-w-190">{c.type}</td>
                      <td className="max-w-190">{c.email}</td>
                      <td className="max-w-190">{c.phone || "—"}</td>
                      <td className="max-w-190">{c.organization || "—"}</td>
                      <td className="max-w-190">{c.status}</td>
                      <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" onClick={() => openView(c, "contact")}><Eye size={16} /></button>
                        {!isReadOnly && (
                          <>
                            <button className="action-btn edit-btn" onClick={() => openEdit(c, "contact")}><Edit size={16} /></button>
                            <button className="action-btn delete-btn" onClick={() => openDelete(c, "contact")}><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" className="no-results">No contacts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ORGANIZATIONS TAB ── */}
          {activeTab === "organizations" && (
            <div className="custom-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="max-w-190">ID</th>
                    <th className="max-w-190">Name</th>
                    <th className="max-w-190">Industry</th>
                    <th className="max-w-190">Email</th>
                    <th className="max-w-190">Phone</th>
                    <th className="max-w-190">Address</th>
                    <th className="max-w-190">Contacts</th>
                    <th className="max-w-190">Status</th>
                    <th className="max-w-190">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.length > 0 ? filteredOrgs.map((o) => (
                    <tr key={o.id}>
                      <td className="max-w-190">{o.id}</td>
                      <td className="max-w-190">{o.name}</td>
                      <td className="max-w-190">{o.industry}</td>
                      <td className="max-w-190">{o.email}</td>
                      <td className="max-w-190">{o.phone}</td>
                      <td className="max-w-190">{o.address || "—"}</td>
                      <td className="max-w-190">
                        <span className="contacts-count-badge" style={{ width: "90px" }}>
                          {o.contactsCount} Contact{o.contactsCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="max-w-190">{o.status}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view-btn" onClick={() => setSelectedOrganization(o)}><Eye size={16} /></button>
                          {!isReadOnly && (
                            <>
                              <button className="action-btn edit-btn" onClick={() => openEdit(o, "organization")}><Edit size={16} /></button>
                              <button className="action-btn delete-btn" onClick={() => openDelete(o, "organization")}><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9" className="no-results">No organizations found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTACT VIEW/EDIT MODAL ── */}
      {selectedItem && dialogType === "contact" && renderViewportModal(
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">{isEditing ? "Edit Contact" : "Contact Details"}</h2>
              <p className="custom-modal-description">Detailed information about this contact.</p>
              <button className="custom-modal-close" onClick={closeDialog}>×</button>
            </div>
            <div className="custom-modal-body">
              <div className="dialog-info-grid">
                {renderEditableField("ID",           "id",       selectedItem.id)}
                {renderEditableField("Name",         "name",     selectedItem.name)}
                {renderEditableField("Type",         "type",     selectedItem.type,     { type: "select", selectOptions: CONTACT_TYPES })}
                {renderEditableField("Email",        "email",    selectedItem.email,    { type: "email" })}
                {renderEditableField("Phone",        "phone",    selectedItem.phone)}
                {renderEditableField("Job Title",    "jobTitle", selectedItem.jobTitle)}
                {renderEditableField("Organization", "organization", selectedItem.organization)}
                {renderEditableField("Status",       "status",   selectedItem.status,   { type: "select", selectOptions: ["Active", "Inactive", "Pending"] })}
              </div>
            </div>
            <div className="custom-modal-footer">
              {isEditing ? (
                <>
                  <button className="btn-outline" onClick={closeDialog}><X size={16} style={{ marginRight: "8px" }} />Cancel</button>
                  <button className="btn-primary" onClick={handleSubmitEdit}><Check size={16} style={{ marginRight: "8px" }} />Save Changes</button>
                </>
              ) : (
                !isReadOnly && <button className="btn-primary" onClick={() => openEdit(selectedItem, "contact")}><Edit size={16} style={{ marginRight: "8px" }} />Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ORGANIZATION EDIT MODAL ── */}
      {selectedItem && dialogType === "organization" && renderViewportModal(
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">{isEditing ? "Edit Organization" : "Organization Details"}</h2>
              <button className="custom-modal-close" onClick={closeDialog}>×</button>
            </div>
            <div className="custom-modal-body">
              <div className="dialog-info-grid">
                {renderEditableField("ID",       "id",       selectedItem.id)}
                {renderEditableField("Name",     "name",     selectedItem.name)}
                {renderEditableField("Industry", "industry", selectedItem.industry, { type: "select", selectOptions: INDUSTRIES })}
                {renderEditableField("Email",    "email",    selectedItem.email,    { type: "email" })}
                {renderEditableField("Phone",    "phone",    selectedItem.phone)}
                {renderEditableField("Address",  "address",  selectedItem.address)}
                {renderEditableField("Status",   "status",   selectedItem.status,   { type: "select", selectOptions: ["Active", "Inactive"] })}
              </div>
            </div>
            <div className="custom-modal-footer">
              {isEditing ? (
                <>
                  <button className="btn-outline" onClick={closeDialog}><X size={16} style={{ marginRight: "8px" }} />Cancel</button>
                  <button className="btn-primary" onClick={handleSubmitEdit}><Check size={16} style={{ marginRight: "8px" }} />Save Changes</button>
                </>
              ) : (
                !isReadOnly && <button className="btn-primary" onClick={() => openEdit(selectedItem, "organization")}><Edit size={16} style={{ marginRight: "8px" }} />Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE DIALOG ── */}
      {deleteDialog.open && deleteDialog.item && renderViewportModal(
        <div className="custom-modal-overlay" onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">
                {deleteDialog.type === "organization" && orgHasContacts(deleteDialog.item) ? "Cannot Delete Organization" : "Confirm Deletion"}
              </h2>
              <button className="custom-modal-close" onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>×</button>
            </div>
            <div className="custom-modal-body">
              {deleteDialog.type === "organization" && orgHasContacts(deleteDialog.item) ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <Trash2 size={48} style={{ color: "#f87171", marginBottom: "20px" }} />
                  <p style={{ fontSize: "18px", fontWeight: "500", color: "#e8edf7" }}>Cannot delete "{deleteDialog.item.name}"</p>
                  <p style={{ color: "#f87171", fontSize: "14px", marginTop: "12px" }}>This organization still has contacts. Delete them first.</p>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <Trash2 size={48} style={{ color: "#f87171", marginBottom: "20px" }} />
                  <p style={{ fontSize: "18px", fontWeight: "500", color: "#e8edf7" }}>Delete this {deleteDialog.type}?</p>
                  <p style={{ color: "#8b96b0", marginTop: "8px" }}><strong>{deleteDialog.item.name}</strong></p>
                  <p style={{ color: "#f87171", fontSize: "13px", marginTop: "16px" }}>This action cannot be undone.</p>
                </div>
              )}
            </div>
            <div className="custom-modal-footer">
              <button className="btn-outline" onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>Cancel</button>
              {!(deleteDialog.type === "organization" && orgHasContacts(deleteDialog.item)) && (
                <button className="btn-primary" onClick={handleConfirmDelete} style={{ background: "rgba(248,113,113,0.15)", borderColor: "#f87171", color: "#f87171" }}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ORGANIZATION DIALOG ── */}
      {isAddOrgOpen && renderViewportModal(
        <div className="custom-modal-overlay" onClick={() => setIsAddOrgOpen(false)}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">Add New Organization</h2>
              <p className="custom-modal-description">Fill in the information below to create a new organization.</p>
              <button className="custom-modal-close" onClick={() => setIsAddOrgOpen(false)}>×</button>
            </div>
            <div className="custom-modal-body">
              <div className="dialog-info-grid">
                {[
                  { label: "Organization Name *", field: "name",     type: "text",  placeholder: "Enter name" },
                  { label: "Email *",             field: "email",    type: "email", placeholder: "Enter email" },
                  { label: "Phone *",             field: "phone",    type: "text",  placeholder: "Enter phone" },
                ].map(({ label, field, type, placeholder }) => (
                  <div className="editable-field" key={field}>
                    <div className="editable-field__label">{label}</div>
                <input
                  type={type}
                  value={newOrg[field]}
                  onChange={(e) => setNewOrg((p) => ({
                    ...p,
                    [field]: field === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value
                  }))}
                  className="dialog-input"
                  style={{ borderRadius: "30px" }}
                  placeholder={field === "phone" ? "10 digits" : placeholder}
                  inputMode={field === "phone" ? "numeric" : undefined}
                  maxLength={field === "phone" ? 10 : undefined}
                  pattern={field === "phone" ? "\\d{10}" : undefined}
                />
                  </div>
                ))}
                <div className="editable-field">
                  <div className="editable-field__label">Industry *</div>
                  <select value={newOrg.industry} onChange={(e) => setNewOrg((p) => ({ ...p, industry: e.target.value }))} className="dialog-input" style={{ borderRadius: "30px" }}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (<option key={i} value={i}>{i}</option>))}
                  </select>
                </div>
                <div className="editable-field" style={{ gridColumn: "1 / -1" }}>
                  <div className="editable-field__label">Address</div>
                  <textarea value={newOrg.address} onChange={(e) => setNewOrg((p) => ({ ...p, address: e.target.value }))} className="dialog-input" style={{ borderRadius: "30px", resize: "vertical", minHeight: "80px" }} placeholder="Enter address" rows="3" />
                </div>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button className="btn-outline" onClick={() => setIsAddOrgOpen(false)}><X size={16} style={{ marginRight: "8px" }} />Cancel</button>
              <button className="btn-primary" onClick={handleAddOrg}><Check size={16} style={{ marginRight: "8px" }} />Add Organization</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;
