import React from "react";
import { Search, Eye, Trash2, Edit, Check, X, Pencil } from "lucide-react";
import "./Contacts.css";
import OrganizationDetails from "./ContactDetails/OrganizationDetails";


// Données prédéfinies pour les contacts
const contactsData = [
  {
    id: "CNT-001",
    name: "Ahmed Al-Rashid",
    type: "Apppplicant",
    email: "ahmed.rashid@company.ae",
    phone: "+971 50 123 4567",
    organization: "Al-Rashid Group",
    status: "Active"
  },
  {
    id: "CNT-002",
    name: "Fatima Mohammed",
    type: "Consultant",
    email: "fatima.m@consulting.ae",
    phone: "+971 50 987 6543",
    organization: "Strategic Solutions",
    status: "Active"
  },
  {
    id: "CNT-003",
    name: "Omar Hassan",
    type: "Government Official",
    email: "omar.hassan@gov.ae",
    phone: "+971 2 345 6789",
    organization: "Ministry of Finance",
    status: "Inactive"
  },
  {
    id: "CNT-004",
    name: "Sarah Abdullah",
    type: "Legal Representative",
    email: "sarah.abdullah@lawfirm.ae",
    phone: "+971 4 567 1234",
    organization: "Abdullah & Partners",
    status: "Active"
  },
  {
    id: "CNT-005",
    name: "Khalid Al-Mansouri",
    type: "Technical Expert",
    email: "k.al-mansouri@tech.ae",
    phone: "+971 56 789 0123",
    organization: "Tech Innovations",
    status: "Pending"
  }
];

// Données prédéfinies pour les organisations
const organizationsData = [
  {
    id: "ORG-001",
    name: "Al-Rashid Group",
    industry: "Financial Services",
    email: "info@alrashidgroup.ae",
    phone: "+971 4 567 8901",
    address: "Emirates Towers, Level 42, Sheikh Zayed Road, Dubai, UAE",
    contactsCount: 2,
    status: "Active",
    createdAt: "May 10, 2023 at 10:00 AM",
    lastUpdated: "March 15, 2026 at 11:30 AM"
  },
  {
    id: "ORG-002",
    name: "Strategic Solutions",
    industry: "Management Consulting",
    email: "contact@strategicsolutions.ae",
    phone: "+971 4 123 4567",
    address: "Abu Dhabi, UAE",
    contactsCount: 1,
    status: "Active",
    createdAt: "June 15, 2023 at 09:30 AM",
    lastUpdated: "February 20, 2026 at 02:15 PM"
  },
  {
    id: "ORG-003",
    name: "Ministry of Finance",
    industry: "Government",
    email: "info@mof.gov.ae",
    phone: "+971 2 678 9012",
    address: "Abu Dhabi, UAE",
    contactsCount: 3,
    status: "Active",
    createdAt: "March 01, 2023 at 08:00 AM",
    lastUpdated: "March 10, 2026 at 10:30 AM"
  },
  {
    id: "ORG-004",
    name: "Abdullah & Partners",
    industry: "Legal Services",
    email: "contact@abdullahpartners.ae",
    phone: "+971 4 345 6789",
    address: "Dubai, UAE",
    contactsCount: 1,
    status: "Inactive",
    createdAt: "December 10, 2023 at 11:00 AM",
    lastUpdated: "January 05, 2026 at 03:45 PM"
  },
  {
    id: "ORG-005",
    name: "Tech Innovations",
    industry: "Technology",
    email: "hello@techinnovations.ae",
    phone: "+971 56 987 6543",
    address: "Sharjah, UAE",
    contactsCount: 1,
    status: "Active",
    createdAt: "August 22, 2023 at 02:30 PM",
    lastUpdated: "March 01, 2026 at 09:00 AM"
  }
];

function Contacts() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("contacts");
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [dialogType, setDialogType] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContact, setEditedContact] = React.useState(null);
  const [activeField, setActiveField] = React.useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedOrganization, setSelectedOrganization] = React.useState(null);
  const [newOrganization, setNewOrganization] = React.useState({
    name: "",
    industry: "",
    email: "",
    phone: "",
    address: "",
    contactsCount: 0
  });
  
  // États pour la boîte de dialogue de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);

  // Filtrer les contacts basés sur le terme de recherche
  const filteredContacts = contactsData.filter(contact =>
    Object.values(contact).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filtrer les organisations basées sur le terme de recherche
  const filteredOrganizations = organizationsData.filter(org =>
    Object.values(org).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle organization view - simply set the selected organization
  const handleViewOrganization = (org) => {
    setSelectedOrganization(org);
  };

  // Handle back from organization details
  const handleBackFromOrganization = () => {
    setSelectedOrganization(null);
  };

  // Keep modal for contact view
  const handleViewContact = (contact) => {
    setSelectedItem(contact);
    setDialogType("contact");
    setIsEditing(false);
    setEditedContact(null);
    setActiveField(null);
  };

  const openEditDialog = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(true);
    setEditedContact({ ...item });
    setActiveField(null);
  };

  const handleCancelEditMode = () => {
    setIsEditing(false);
    setEditedContact(null);
    setActiveField(null);
  };

  const handleSubmitAll = () => {
    console.log("Saving all changes:", editedContact);
    setSelectedItem(editedContact);
    setIsEditing(false);
    setActiveField(null);
  };

  const handleConfirmField = (field) => {
    setActiveField(null);
  };

  const handleRejectField = (field) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: selectedItem[field]
    }));
    setActiveField(null);
  };

  const handleFieldChange = (field, value) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour la boîte de dialogue d'ajout
  const openAddOrganizationDialog = () => {
    setNewOrganization({
      name: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
      contactsCount: 0
    });
    setIsAddDialogOpen(true);
  };

  const handleAddOrganization = () => {
    if (!newOrganization.name || !newOrganization.industry || !newOrganization.email || !newOrganization.phone) {
      console.log("Please fill all required fields");
      return;
    }

    const newId = `ORG-${String(organizationsData.length + 1).padStart(3, '0')}`;
    const organizationToAdd = {
      id: newId,
      ...newOrganization
    };
    
    console.log("Adding organization:", organizationToAdd);
    setIsAddDialogOpen(false);
    setNewOrganization({
      name: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
      contactsCount: 0
    });
  };

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false);
    setNewOrganization({
      name: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
      contactsCount: 0
    });
  };

  const handleNewOrgChange = (field, value) => {
    setNewOrganization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour la boîte de dialogue de suppression
  const openDeleteDialog = (item, type) => {
    if (type === "organization") {
      const hasContacts = contactsData.some(contact => contact.organization === item.name);
      setItemToDelete({ 
        item, 
        type, 
        hasContacts: hasContacts,
        contactsList: contactsData.filter(contact => contact.organization === item.name)
      });
    } else {
      setItemToDelete({ item, type });
    }
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      const { item, type, hasContacts } = itemToDelete;
      
      if (type === "organization" && hasContacts) {
        console.log("Cannot delete organization with existing contacts");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        return;
      }
      
      console.log(`Deleting ${type}:`, item);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const renderEditableField = (label, field, value, options = { type: 'text', selectOptions: null }) => {
    const isCurrentlyEditing = activeField === field;
    const isReadOnly = field === 'id';

    const currentValue = isEditing ? editedContact?.[field] ?? value : value;

    if (!isEditing || isReadOnly) {
      return (
        <div className="editable-field" key={field}>
          <div className="editable-field__label">{label}</div>
          <div className="editable-field__row">
            <div className="editable-field__value">{currentValue}</div>
            {isEditing && !isReadOnly && (
              <button className="editable-icon-btn" onClick={() => setActiveField(field)} type="button">
                <Pencil size={14} />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (isCurrentlyEditing) {
      return (
        <div className="editable-field" key={field}>
          <div className="editable-field__label">{label}</div>
          <div className="editable-field__row">
            <div className="editable-field__input">
              {options.type === 'select' && options.selectOptions ? (
                <select
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="dialog-input"
                  style={{ borderRadius: "30px" }}
                >
                  {options.selectOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={options.type}
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="dialog-input"
                  style={{ borderRadius: "30px" }}
                />
              )}
            </div>
            <div className="editable-field__actions">
              <button className="confirm-field-btn" onClick={() => handleConfirmField(field)} type="button">
                <Check size={14} />
              </button>
              <button className="reject-field-btn" onClick={() => handleRejectField(field)} type="button">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="editable-field" key={field}>
        <div className="editable-field__label">{label}</div>
        <div className="editable-field__row">
          <div className="editable-field__value">{currentValue}</div>
          <button className="editable-icon-btn" onClick={() => setActiveField(field)} type="button">
            <Pencil size={14} />
          </button>
        </div>
      </div>
    );
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setEditedContact(null);
    setActiveField(null);
  };

  // If an organization is selected, show the organization details
  if (selectedOrganization) {
    return (
      <OrganizationDetails
        organization={selectedOrganization} 
        onBack={handleBackFromOrganization}
        contactsData={contactsData}
      />
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
          <button
            className={`tab-trigger ${activeTab === "contacts" ? "active" : ""}`}
            onClick={() => setActiveTab("contacts")}
          >
            Contacts ({contactsData.length})
          </button>
          <button
            className={`tab-trigger ${activeTab === "organizations" ? "active" : ""}`}
            onClick={() => setActiveTab("organizations")}
          >
            Organizations ({organizationsData.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <div className="search_bar_contact" style={{ flex: 1 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, organization, type, or ID..."
              className="input_text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === "organizations" && (
            <button style={{position : 'relative' , top:"-10px"}} className="btn-add-organization" onClick={openAddOrganizationDialog}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Organization
            </button>
          )}
        </div>

        <div className="tables-container">
          {/* Contacts Tab - Keep modal for view */}
          {activeTab === "contacts" && (
            <div className="custom-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="max-w-190">Contact ID</th>
                    <th className="max-w-190">Name</th>
                    <th className="max-w-190">Contact Type</th>
                    <th className="max-w-190">Email</th>
                    <th className="max-w-190">Phone</th>
                    <th className="max-w-190">Organization</th>
                    <th className="max-w-190">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="max-w-190">{contact.id}</td>
                        <td className="max-w-190">{contact.name}</td>
                        <td className="max-w-190">{contact.type}</td>
                        <td className="max-w-190">{contact.email}</td>
                        <td className="max-w-190">{contact.phone}</td>
                        <td className="max-w-190">{contact.organization}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewContact(contact)}
                            >
                              <Eye size={16} />
                            </button>
                            <button className="action-btn edit-btn" onClick={() => openEditDialog(contact, "contact")}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn delete-btn" onClick={() => openDeleteDialog(contact, "contact")}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">No contacts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === "organizations" && (
            <div className="custom-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="max-w-190">Organization ID</th>
                    <th className="max-w-190">Name</th>
                    <th className="max-w-190">Industry</th>
                    <th className="max-w-190">Email</th>
                    <th className="max-w-190">Phone</th>
                    <th className="max-w-190">Address</th>
                    <th className="max-w-190">Contacts</th>
                    <th className="max-w-190">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <tr key={org.id}>
                        <td className="max-w-190">{org.id}</td>
                        <td className="max-w-190">{org.name}</td>
                        <td className="max-w-190">{org.industry}</td>
                        <td className="max-w-190">{org.email}</td>
                        <td className="max-w-190">{org.phone}</td>
                        <td className="max-w-190">{org.address || "-"}</td>
                        <td className="max-w-190">
                          <span className="contacts-count-badge" style={{ width: "90px" }}>
                            {org.contactsCount} Contact{org.contactsCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewOrganization(org)}
                            >
                              <Eye size={16} />
                            </button>
                            <button className="action-btn edit-btn" onClick={() => openEditDialog(org, "organization")}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn delete-btn" onClick={() => openDeleteDialog(org, "organization")}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-results">No organizations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog for Contacts only */}
      {selectedItem && dialogType === "contact" && (
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">Contact Details</h2>
              <p className="custom-modal-description">Detailed information about this contact.</p>
              <button className="custom-modal-close" onClick={closeDialog}>×</button>
            </div>

            <div className="custom-modal-body">
              {selectedItem && (
                <div className="dialog-info-grid">
                  {renderEditableField("ID", "id", selectedItem.id, { type: 'text' })}
                  {renderEditableField("Name", "name", selectedItem.name, { type: 'text' })}
                  {renderEditableField("Type", "type", selectedItem.type, { 
                    type: 'select', 
                    selectOptions: ["Applicant", "Consultant", "Government Official", "Legal Representative", "Technical Expert"]
                  })}
                  {renderEditableField("Email", "email", selectedItem.email, { type: 'email' })}
                  {renderEditableField("Phone", "phone", selectedItem.phone, { type: 'text' })}
                  {renderEditableField("Organization", "organization", selectedItem.organization, { type: 'text' })}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="custom-modal-footer">
                <button className="btn-outline" onClick={handleCancelEditMode}>
                  <X size={16} style={{ marginRight: '8px' }} />
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmitAll}>
                  <Check size={16} style={{ marginRight: '8px' }} />
                  Submit Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for editing organization */}
      {selectedItem && dialogType === "organization" && (
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">Organization Details</h2>
              <p className="custom-modal-description">Detailed information about this organization.</p>
              <button className="custom-modal-close" onClick={closeDialog}>×</button>
            </div>

            <div className="custom-modal-body">
              {selectedItem && (
                <div className="dialog-info-grid">
                  {renderEditableField("ID", "id", selectedItem.id, { type: 'text' })}
                  {renderEditableField("Name", "name", selectedItem.name, { type: 'text' })}
                  {renderEditableField("Industry", "industry", selectedItem.industry, { type: 'text' })}
                  {renderEditableField("Email", "email", selectedItem.email, { type: 'email' })}
                  {renderEditableField("Phone", "phone", selectedItem.phone, { type: 'text' })}
                  {renderEditableField("Address", "address", selectedItem.address || "-", { type: 'text' })}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="custom-modal-footer">
                <button className="btn-outline" onClick={handleCancelEditMode}>
                  <X size={16} style={{ marginRight: '8px' }} />
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmitAll}>
                  <Check size={16} style={{ marginRight: '8px' }} />
                  Submit Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && itemToDelete && (
        <div className="custom-modal-overlay" onClick={handleCancelDelete}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">
                {itemToDelete.type === "organization" && itemToDelete.hasContacts ? "Cannot Delete Organization" : "Confirm Deletion"}
              </h2>
              <button className="custom-modal-close" onClick={handleCancelDelete}>×</button>
            </div>

            <div className="custom-modal-body">
              {itemToDelete.type === "organization" && itemToDelete.hasContacts ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                  }}>
                    <Trash2 size={32} style={{ color: '#f87171' }} />
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', color: '#e8edf7' }}>
                    Cannot delete "{itemToDelete.item.name}"
                  </p>
                  <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '20px' }}>
                    This organization still has active contacts.
                  </p>
                  <div style={{ background: 'rgba(248, 113, 113, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                    <p style={{ color: '#8b96b0', fontSize: '13px', marginBottom: '8px' }}>
                      ⚠️ Please delete all contacts from this organization first:
                    </p>
                    <ul style={{ color: '#e8edf7', fontSize: '13px', marginTop: '8px', paddingLeft: '20px' }}>
                      {itemToDelete.contactsList.map(contact => (
                        <li key={contact.id} style={{ marginBottom: '4px' }}>{contact.name} ({contact.email})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Trash2 size={48} style={{ color: '#f87171', marginBottom: '20px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px', color: '#e8edf7' }}>
                    Are you sure you want to delete this {itemToDelete.type}?
                  </p>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', margin: '20px 0', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                    <strong style={{ color: '#e8edf7', fontSize: '16px', display: 'block', marginBottom: '8px' }}>{itemToDelete.item.name}</strong>
                    {itemToDelete.type === "contact" && <span style={{ color: '#8b96b0', fontSize: '14px' }}>{itemToDelete.item.email}</span>}
                    {itemToDelete.type === "organization" && <span style={{ color: '#8b96b0', fontSize: '14px' }}>{itemToDelete.item.industry}</span>}
                  </div>
                  <p style={{ color: '#f87171', fontSize: '13px', marginTop: '16px' }}>This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="custom-modal-footer">
              <button className="btn-outline" onClick={handleCancelDelete}>Cancel</button>
              {(!(itemToDelete.type === "organization" && itemToDelete.hasContacts)) && (
                <button className="btn-primary" onClick={handleConfirmDelete} style={{ background: 'rgba(248, 113, 113, 0.15)', borderColor: '#f87171', color: '#f87171' }}>
                  <Trash2 size={16} style={{ marginRight: '8px' }} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Organization Dialog */}
      {isAddDialogOpen && (
        <div className="custom-modal-overlay" onClick={handleCancelAdd}>
          <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2 className="custom-modal-title">Add New Organization</h2>
              <p className="custom-modal-description">Fill in the information below to create a new organization.</p>
              <button className="custom-modal-close" onClick={handleCancelAdd}>×</button>
            </div>

            <div className="custom-modal-body">
              <div className="dialog-info-grid">
                <div className="editable-field">
                  <div className="editable-field__label">Organization Name *</div>
                  <input
                    type="text"
                    value={newOrganization.name}
                    onChange={(e) => handleNewOrgChange("name", e.target.value)}
                    className="dialog-input"
                    style={{ borderRadius: "30px" }}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="editable-field">
                  <div className="editable-field__label">Industry *</div>
                  <select
                    value={newOrganization.industry}
                    onChange={(e) => handleNewOrgChange("industry", e.target.value)}
                    className="dialog-input"
                    style={{ borderRadius: "30px" }}
                  >
                    <option value="">Select industry</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Management Consulting">Management Consulting</option>
                    <option value="Government">Government</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>

                <div className="editable-field">
                  <div className="editable-field__label">Contact Email *</div>
                  <input
                    type="email"
                    value={newOrganization.email}
                    onChange={(e) => handleNewOrgChange("email", e.target.value)}
                    className="dialog-input"
                    style={{ borderRadius: "30px" }}
                    placeholder="Enter contact email"
                  />
                </div>

                <div className="editable-field">
                  <div className="editable-field__label">Contact Phone *</div>
                  <input
                    type="text"
                    value={newOrganization.phone}
                    onChange={(e) => handleNewOrgChange("phone", e.target.value)}
                    className="dialog-input"
                    style={{ borderRadius: "30px" }}
                    placeholder="Enter contact phone"
                  />
                </div>

                <div className="editable-field" style={{ gridColumn: '1 / -1' }}>
                  <div className="editable-field__label">Address</div>
                  <textarea
                    value={newOrganization.address}
                    onChange={(e) => handleNewOrgChange("address", e.target.value)}
                    className="dialog-input"
                    style={{ borderRadius: "30px", resize: "vertical", minHeight: "80px" }}
                    placeholder="Enter organization address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="custom-modal-footer">
              <button className="btn-outline" onClick={handleCancelAdd}>
                <X size={16} style={{ marginRight: '8px' }} />
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddOrganization}>
                <Check size={16} style={{ marginRight: '8px'}} />
                Add Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;