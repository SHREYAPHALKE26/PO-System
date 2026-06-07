import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Users, Building2, Shield, ListTodo, AlertTriangle, UserMinus, UserCheck, Plus, Pencil, Trash2, RotateCcw, X, Save } from "lucide-react";

// --- API Endpoints ---
const API_BASE_URL = "http://127.0.0.1:3000";
const ROLE_API = `${API_BASE_URL}/role`;
const USER_ROLE_API = `${API_BASE_URL}/userRole`;
const ADMIN_DEPT_API = `${API_BASE_URL}/adminDept`;

// --- Industrial Minimal Theme Colors ---
const PRIMARY_COLOR = '#1E3A8A'; // Deep industrial blue
const PRIMARY_HOVER = '#162C6A';
const PRIMARY_LIGHT = '#E8EEFB';
const CHARCOAL_TEXT = '#212121'; // Dark charcoal text
const NEUTRAL_WHITE = '#FFFFFF';
const NEUTRAL_LIGHT = '#F5F5F5';
const NEUTRAL_BORDER = '#E0E0E0';
const NEUTRAL_GRAY = '#9E9E9E';
const SUCCESS_COLOR = '#4CAF50';
const WARNING_COLOR = '#FF9800';
const DANGER_COLOR = '#F44336';

// --- Temporary Custom Alert and Confirmation Components (Replacing Swal) ---

// 1. Simple Notification/Alert Component
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const iconMap = {
    success: <UserCheck size={20} />,
    error: <AlertTriangle size={20} />,
    info: <ListTodo size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  const bgColorMap = {
    success: SUCCESS_COLOR,
    error: DANGER_COLOR,
    info: '#2196F3',
    warning: WARNING_COLOR,
  };

  return (
    <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-0 max-w-md" style={{ backgroundColor: bgColorMap[type] }} role="alert">
      <div className="flex items-start gap-3">
        {iconMap[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,1)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// 2. Custom Confirmation Modal Component (Replacing window.confirm)
const ConfirmationModal = ({ title, text, onConfirm, onCancel, confirmText, confirmColor }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
    <div className="rounded-lg shadow-lg w-full max-w-sm transform transition-all" style={{ backgroundColor: NEUTRAL_WHITE, animation: 'slideUp 0.3s ease-out' }}>
      <div className="px-8 py-6" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}` }}>
        <h3 className="text-2xl font-bold" style={{ color: CHARCOAL_TEXT }}>{title}</h3>
      </div>
      <div className="px-8 py-6">
        <p className="text-sm mb-8 leading-relaxed" style={{ color: NEUTRAL_GRAY }}>{text}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg transition duration-200 shadow-sm"
            style={{ backgroundColor: NEUTRAL_LIGHT, color: CHARCOAL_TEXT, border: `1px solid ${NEUTRAL_BORDER}` }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_BORDER}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_LIGHT}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white transition duration-200 shadow-sm hover:shadow-md"
            style={{ backgroundColor: confirmColor }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  </div>
);


// 3. RoleFormModal Component (Inline implementation)
const RoleFormModal = ({ open, onClose, onSaved, initialData, ROLE_API, getToken }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initialData ? initialData.name : '');
      setDescription(initialData ? initialData.description : '');
      setModalError('');
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setModalError("Role name is required.");
      return;
    }

    setIsSaving(true);
    setModalError('');

    const method = initialData ? 'PATCH' : 'POST';
    const url = initialData
      ? `${ROLE_API}/updateRole/${initialData.role_id}`
      : `${ROLE_API}/createRole`;

    try {
      const token = getToken();
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || `Failed to ${initialData ? 'update' : 'create'} role`);
      }

      // Success
      onSaved();
      onClose();

    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="rounded-lg shadow-lg w-full max-w-lg transform transition-all" style={{ backgroundColor: NEUTRAL_WHITE, animation: 'slideUp 0.3s ease-out' }}>
        <div className="px-8 py-6" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}`, backgroundColor: NEUTRAL_LIGHT }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
              {initialData ? <><Pencil size={24} /> Edit Role</> : <><Plus size={24} /> Create New Role</>}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: CHARCOAL_TEXT }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_BORDER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8">
          {modalError && (
            <div className="mb-6 p-4 rounded-lg text-sm font-medium flex items-center gap-2" style={{ backgroundColor: `${DANGER_COLOR}15`, color: DANGER_COLOR, border: `1px solid ${DANGER_COLOR}30` }}>
              <AlertTriangle size={18} />
              {modalError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="role-name" className="block text-sm font-bold mb-2" style={{ color: CHARCOAL_TEXT }}>Role Name *</label>
              <input
                id="role-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg outline-none transition"
                style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}`, color: CHARCOAL_TEXT }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Enter role name..."
                required
                disabled={isSaving}
              />
            </div>

            <div className="mb-8">
              <label htmlFor="role-description" className="block text-sm font-bold mb-2" style={{ color: CHARCOAL_TEXT }}>Description (Optional)</label>
              <textarea
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg outline-none transition resize-none"
                style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}`, color: CHARCOAL_TEXT }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Enter role description..."
                disabled={isSaving}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg transition duration-200 shadow-sm"
                style={{ backgroundColor: NEUTRAL_LIGHT, color: CHARCOAL_TEXT, border: `1px solid ${NEUTRAL_BORDER}` }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_BORDER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_LIGHT}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white transition duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                style={{ backgroundColor: PRIMARY_COLOR }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <><Save size={16} /> Save Role</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 4. Assignment History Modal Component
const AssignmentHistoryModal = ({ open, onClose, userName, history }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="rounded-lg shadow-lg w-full max-w-2xl transform transition-all" style={{ backgroundColor: NEUTRAL_WHITE, animation: 'slideUp 0.3s ease-out' }}>
        <div className="px-8 py-6" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}`, backgroundColor: NEUTRAL_LIGHT }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
              <ListTodo size={24} />
              Assignment History - {userName}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: CHARCOAL_TEXT }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_BORDER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-96 overflow-y-auto">
          {!history || history.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo size={40} style={{ color: NEUTRAL_LIGHT, margin: '0 auto 12px' }} />
              <p className="font-medium" style={{ color: NEUTRAL_GRAY }}>No assignment history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record, idx) => (
                <div key={idx} className="p-4 rounded-lg transition-shadow hover:shadow-md" style={{ backgroundColor: NEUTRAL_LIGHT, border: `1px solid ${NEUTRAL_BORDER}` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: `${DANGER_COLOR}20`, color: DANGER_COLOR }}>
                          From: {record.from}
                        </span>
                        <span style={{ color: NEUTRAL_GRAY }}>→</span>
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: `${SUCCESS_COLOR}20`, color: SUCCESS_COLOR }}>
                          To: {record.to}
                        </span>
                      </div>
                      <p className="text-xs flex items-center gap-1 mt-2" style={{ color: NEUTRAL_GRAY }}>
                        <Building2 size={12} />
                        {record.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-6" style={{ borderTop: `1px solid ${NEUTRAL_BORDER}` }}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white transition duration-200 shadow-sm hover:shadow-md"
              style={{ backgroundColor: PRIMARY_COLOR }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Summary Card Component ---
const StatCard = ({ icon: Icon, title, value }) => (
  <div className="p-6 rounded-xl shadow-sm transition-all hover:shadow-lg duration-300 border border-gray-100" style={{ backgroundColor: NEUTRAL_WHITE }}>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: NEUTRAL_GRAY }}>
          {title}
        </h3>
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: PRIMARY_LIGHT }}>
          <Icon size={24} style={{ color: PRIMARY_COLOR }} />
        </div>
      </div>
      <div className="text-4xl font-bold" style={{ color: CHARCOAL_TEXT }}>
        {value}
      </div>
    </div>
  </div>
);

// --- Main Dashboard Component ---

const AdminDashboard = () => {
  // --- State Hooks ---
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState("");
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(null);

  // Custom Notification State
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  // Custom Confirmation State
  const [confirmation, setConfirmation] = useState(null);

  // --- Utility Functions ---

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'info' }), 4000);
  }, []);

  const confirmAction = (title, text, onConfirm, confirmText, confirmColor = '#DC2626') => {
    setConfirmation({
      title,
      text,
      onConfirm: () => {
        setConfirmation(null);
        onConfirm();
      },
      onCancel: () => setConfirmation(null),
      confirmText,
      confirmColor,
    });
  };

  const getToken = () => localStorage.getItem("authToken");

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      showNotification("Session expired. Please log in again.", "warning");
      setTimeout(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roles");
        // Note: Cannot directly redirect in this limited sandbox, but we log the action.
        console.log("Redirecting to /login");
      }, 1000);
      return true;
    }
    return false;
  };

  const handleError = (message) => {
    setError(message);
    showNotification(message, "error");
  };

  // --- Data Fetching ---

  const fetchRoles = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${ROLE_API}/getAllRoles`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch roles");
      setRoles(data);
    } catch (err) {
      handleError(err.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${ADMIN_DEPT_API}/departments`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load departments");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      // Fetch users with roles
      const resRoles = await fetch(`${USER_ROLE_API}/getAllUsersWithRoles`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(resRoles.status)) return;
      const usersWithRoles = await resRoles.json();
      if (!resRoles.ok) throw new Error(usersWithRoles.msg || "Failed to fetch users with roles");

      // Fetch users with departments
      const resDepts = await fetch(`${ADMIN_DEPT_API}/users`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(resDepts.status)) return;
      const usersWithDepts = await resDepts.json();
      if (!resDepts.ok) throw new Error(usersWithDepts.msg || "Failed to fetch users with departments");

      // Merge user data
      const userMap = new Map();
      usersWithRoles.forEach(u => userMap.set(u.user_id, { ...u }));

      usersWithDepts.forEach(u => {
        if (userMap.has(u.user_id)) {
          userMap.set(u.user_id, {
            ...userMap.get(u.user_id),
            department_id: u.department_id,
            department_name: u.department_name
          });
        } else {
          userMap.set(u.user_id, { ...u, roles: 'N/A' });
        }
      });

      setUsers(Array.from(userMap.values()));
    } catch (err) {
      handleError(err.message);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError("");
    await Promise.all([fetchRoles(), fetchDepartments(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Derived State (Memoized for Cards) ---
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const usersWithRole = users.filter(u => u.roles).length;
    const excludedRoles = ["Purchasing Officer", "Admin"];

    const usersWithoutDept = users.filter(u => {
      // 1. Must be missing a department
      if (u.department_id) return false;

      // 2. If they don't have a department, check their role for exclusion
      if (!u.roles) return true; // Count if no role, no dept (needs both role/dept)

      const userRoles = u.roles.split(',').map(role => role.trim());

      // Count if they are NOT an excluded role (i.e., they are a Requestor/Approver or unassigned but have some role)
      return !userRoles.some(role => excludedRoles.includes(role));
    }).length;
    const totalRoles = roles.length;
    const totalDepartments = departments.length;

    return { totalUsers, usersWithRole, usersWithoutDept, totalRoles, totalDepartments };
  }, [users, roles, departments]);

  // --- FILTERING FOR DEPARTMENT ASSIGNMENT ---
  const filteredUsersForDeptAssignment = useMemo(() => {
    // Roles to EXCLUDE from department assignment
    const excludedRoles = ["PurchasingOfficer", "Admin"];

    return users.filter(user => {
      if (!user.roles) {
        // Include users with no role, allowing them to be assigned a role/dept first
        return true;
      }

      // Check if any of the user's roles match the excluded roles
      const userRoles = user.roles.split(',').map(role => role.trim());
      return !userRoles.some(role => excludedRoles.includes(role));
    });
  }, [users]);


  // --- Role Management Logic ---

  const handleChangeRole = async () => {
    if (!selectedUserForRole || !selectedRoleToAssign) {
      showNotification("Please select both a user and a new role.", "info");
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(
        `${USER_ROLE_API}/updateUserRole/${selectedUserForRole}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role_id: selectedRoleToAssign }),
        }
      );
      const data = await res.json();
      if (handleAuthError(res.status)) return;
      if (!res.ok) throw new Error(data.msg || "Error updating role");

      showNotification(data.msg || "Role updated successfully!", "success");
      await fetchUsers();
      setSelectedUserForRole("");
      setSelectedRoleToAssign("");
    } catch (err) {
      handleError(err.message || "Error updating role");
    }
  };

  const handleRevokeRole = (user_id) => {
    confirmAction(
      "Confirm Revoke",
      "You are about to revoke ALL roles for this user. Continue?",
      async () => {
        try {
          const token = getToken();
          const res = await fetch(`${USER_ROLE_API}/revokeRole/${user_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (handleAuthError(res.status)) return;
          if (!res.ok) throw new Error(data.msg || "Error revoking role");

          showNotification(data.msg || "Role revoked successfully!", "success");
          await fetchUsers();
        } catch (err) {
          handleError(err.message || "Error revoking role");
        }
      },
      "Yes, Revoke Role",
      '#DC2626'
    );
  };

  const deleteRole = (role_id) => {
    confirmAction(
      "Delete Role?",
      "This action is irreversible and may affect users currently assigned to it. Continue?",
      async () => {
        try {
          const token = getToken();
          const res = await fetch(`${ROLE_API}/deleteRole/${role_id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          });
          if (handleAuthError(res.status)) return;
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.msg || "Failed to delete role");
          }
          showNotification("Role deleted successfully!", "success");
          await loadAllData();
        } catch (err) {
          handleError(err.message);
        }
      },
      "Yes, Delete Role",
      '#DC2626'
    );
  };

  const openCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleRoleSaved = () => {
    fetchRoles();
    showNotification(editingRole ? "Role updated successfully!" : "Role created successfully!", "success");
  };

  // --- Department Assignment Logic ---

  const handleDepartmentAssign = async (user) => {
    const newDeptId = selectedDept[user.user_id];

    // Fallback to current department ID if user didn't change the selection but pressed save
    const deptToAssign = newDeptId || user.department_id;

    if (!deptToAssign) {
      showNotification("Please choose a department before saving.", "info");
      return;
    }

    try {
      const res = await fetch(
        `${ADMIN_DEPT_API}/assign/${user.user_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ department_id: parseInt(deptToAssign, 10) }),
        }
      );

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to assign department");

      const prevDept = user.department_name || "Unassigned";
      const newDept = data.user.department_name;
      const timestamp = new Date().toLocaleString();

      // Add to history
      setAssignmentHistory((prev) => ({
        ...prev,
        [user.user_id]: [
          { from: prevDept, to: newDept, timestamp },
          ...(prev[user.user_id] || [])
        ]
      }));

      showNotification(`User ${user.username} moved from ${prevDept} to ${newDept}.`, "success");

      // Update in UI and clear temporary selection state
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id
            ? {
              ...u,
              department_id: data.user.department_id,
              department_name: data.user.department_name,
            }
            : u
        )
      );

      setSelectedDept((prev) => {
        const newState = { ...prev };
        delete newState[user.user_id];
        return newState;
      });

    } catch (err) {
      handleError(err.message || "Error assigning department");
    }
  };


  // --- Render ---

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, Inter, Roboto, sans-serif', backgroundColor: NEUTRAL_WHITE }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header and Refresh */}
        {/* <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}` }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3 mb-2" style={{ color: CHARCOAL_TEXT }}>
              <Users size={40} style={{ color: PRIMARY_COLOR }} />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 font-medium">
              Manage users, roles, and departments efficiently
            </p>
          </div>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-5 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw size={18} className={loading ? "animate-spin" : "text-gray-600"} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div> */}

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-4 shadow-sm">
            <AlertTriangle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-bold text-lg">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-8" style={{ color: PRIMARY_COLOR }}>
            <Users size={40} />
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={Users} title="Total RFQs" value={stats.totalUsers} />
            <StatCard icon={Building2} title="Vendors" value={stats.totalRoles} />
            <StatCard icon={Shield} title="Purchase Orders" value={stats.totalDepartments} />
            <StatCard icon={Users} title="Total Budget" value="₹23,000,000" />
            <StatCard icon={Users} title="Used Budget" value="₹682,500" />
            <StatCard icon={Users} title="Remaining Budget" value="₹22,317,500" />
          </div>
        </div>

        <div className="space-y-8">

          {/* User & Role Assignment Section */}
          <section className="rounded-lg shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}` }}>
            <div className="px-8 py-7" style={{ backgroundColor: PRIMARY_COLOR, color: NEUTRAL_WHITE, borderRadius: '8px 8px 0 0' }}>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-1">
                <Shield size={32} />
                User Role Management
              </h2>
              <p className="text-sm mt-2 opacity-90">
                Assign and manage security roles for platform users.
              </p>
            </div>

            <div className="p-8">
              {/* Role Assignment Controls */}
              <div className="rounded-lg p-6 mb-10" style={{ backgroundColor: NEUTRAL_LIGHT, border: `1px solid ${NEUTRAL_BORDER}` }}>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: CHARCOAL_TEXT }}>
                  <Pencil size={20} style={{ color: PRIMARY_COLOR }} />
                  Change User Role
                </h3>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-2.5" style={{ color: CHARCOAL_TEXT }}>Select User</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg outline-none transition font-medium appearance-none cursor-pointer"
                      style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}`, color: CHARCOAL_TEXT, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231E3A8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                      value={selectedUserForRole}
                      onChange={(e) => setSelectedUserForRole(e.target.value)}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    >
                      <option value="">Select a user...</option>
                      {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-2.5" style={{ color: CHARCOAL_TEXT }}>Assign New Role</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg outline-none transition font-medium appearance-none cursor-pointer"
                      style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}`, color: CHARCOAL_TEXT, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231E3A8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                      value={selectedRoleToAssign}
                      onChange={(e) => setSelectedRoleToAssign(e.target.value)}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    >
                      <option value="">Choose a role...</option>
                      {roles.map((r) => (
                        <option key={r.role_id} value={r.role_id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleChangeRole}
                    className="px-7 py-3 rounded-lg font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{ backgroundColor: PRIMARY_COLOR, color: NEUTRAL_WHITE }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY_HOVER}
                    onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY_COLOR}
                  >
                    <Pencil size={20} />
                    Update Role
                  </button>
                </div>
              </div>

              {/* Users Table (Role focused) */}
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: CHARCOAL_TEXT }}><ListTodo size={22} style={{ color: PRIMARY_COLOR }} /> User Role Status</h3>
              <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${NEUTRAL_BORDER}` }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: NEUTRAL_LIGHT, borderBottom: `1px solid ${NEUTRAL_BORDER}` }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>User ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Username</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell" style={{ color: CHARCOAL_TEXT }}>Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Current Role</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: `1px solid ${NEUTRAL_BORDER}` }}>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: NEUTRAL_BORDER, borderTopColor: PRIMARY_COLOR }}></div>
                            <p className="font-semibold" style={{ color: NEUTRAL_GRAY }}>Loading users...</p>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center font-medium flex items-center justify-center gap-2" style={{ color: NEUTRAL_GRAY }}><Users size={20} /> No users found.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.user_id} className="transition-colors duration-150" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}` }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_LIGHT} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_WHITE}>
                          <td className="px-6 py-4 text-sm font-bold" style={{ color: NEUTRAL_GRAY }}>#{u.user_id}</td>
                          <td className="px-6 py-4 text-sm font-bold" style={{ color: CHARCOAL_TEXT }}>{u.username}</td>
                          <td className="px-6 py-4 text-sm hidden md:table-cell" style={{ color: NEUTRAL_GRAY }}>{u.email}</td>
                          <td className="px-6 py-4">
                            {u.roles ? (
                              <span
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                                style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_COLOR}40` }}
                              >
                                <UserCheck size={14} /> {u.roles}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: NEUTRAL_LIGHT, color: NEUTRAL_GRAY, border: `1px solid ${NEUTRAL_BORDER}` }}>
                                <AlertTriangle size={14} /> No Role
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {u.roles && (
                              <button
                                onClick={() => handleRevokeRole(u.user_id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm shadow-sm hover:shadow-md"
                                style={{ backgroundColor: NEUTRAL_WHITE, color: DANGER_COLOR, border: `1px solid ${DANGER_COLOR}40` }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${DANGER_COLOR}10`}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_WHITE}
                              >
                                <Trash2 size={16} />
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Department Assignment Section */}
          <section className="rounded-lg shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}` }}>
            <div className="px-8 py-7" style={{ backgroundColor: WARNING_COLOR, color: NEUTRAL_WHITE, borderRadius: '8px 8px 0 0' }}>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-1">
                <Building2 size={32} />
                User Department Assignment
              </h2>
              <p className="text-sm mt-2 opacity-90">
                Assign users to departments for budget routing and management.
              </p>
            </div>

            <div className="p-8">
              <div className="rounded-lg p-4 mb-8" style={{ backgroundColor: NEUTRAL_LIGHT, border: `1px solid ${NEUTRAL_BORDER}` }}>
                <p className="text-sm font-medium flex items-start gap-3" style={{ color: CHARCOAL_TEXT }}>
                  <ListTodo size={20} style={{ color: PRIMARY_COLOR, marginTop: '2px', flexShrink: 0 }} />
                  <span>
                    <strong>Note:</strong> Only <strong>Requestor</strong> and <strong>Approver</strong> roles are listed here. Users with <strong>Admin</strong> or <strong>Purchasing Officer</strong> roles are automatically excluded from this view.
                  </span>
                </p>
              </div>
              <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${NEUTRAL_BORDER}` }}>
                <table className="min-w-full text-sm">
                  <thead style={{ backgroundColor: NEUTRAL_LIGHT, borderBottom: `1px solid ${NEUTRAL_BORDER}` }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider hidden sm:table-cell" style={{ color: CHARCOAL_TEXT }}>Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Current Dept.</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Assign New Dept.</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: CHARCOAL_TEXT }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: NEUTRAL_BORDER, borderTopColor: WARNING_COLOR }}></div>
                            <p className="font-semibold" style={{ color: NEUTRAL_GRAY }}>Loading departments...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsersForDeptAssignment.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center font-medium flex items-center justify-center gap-2" style={{ color: NEUTRAL_GRAY }}>
                          <Building2 size={20} /> All users have been assigned to departments!
                        </td>
                      </tr>
                    ) : (
                      filteredUsersForDeptAssignment.map((u) => (
                        <tr key={u.user_id} className="transition-colors duration-150" style={{ borderBottom: `1px solid ${NEUTRAL_BORDER}` }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_LIGHT} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_WHITE}>
                          <td className="px-6 py-4 font-bold text-sm" style={{ color: CHARCOAL_TEXT }}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PRIMARY_COLOR }}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              {u.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell text-xs" style={{ color: NEUTRAL_GRAY }}>{u.email}</td>
                          <td className="px-6 py-4">
                            {u.department_name ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: `${SUCCESS_COLOR}20`, color: SUCCESS_COLOR, border: `1px solid ${SUCCESS_COLOR}40` }}>
                                <UserCheck size={14} /> {u.department_name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse" style={{ backgroundColor: `${WARNING_COLOR}20`, color: WARNING_COLOR, border: `1px solid ${WARNING_COLOR}40` }}>
                                <AlertTriangle size={14} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium appearance-none cursor-pointer transition-all"
                              style={{ backgroundColor: NEUTRAL_WHITE, border: `1px solid ${NEUTRAL_BORDER}`, color: CHARCOAL_TEXT, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF9800' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', paddingRight: '2.5rem' }}
                              value={selectedDept[u.user_id] || u.department_id || ""}
                              onChange={(e) =>
                                setSelectedDept((prev) => ({
                                  ...prev,
                                  [u.user_id]: e.target.value,
                                }))
                              }
                              onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`}
                              onBlur={(e) => e.target.style.boxShadow = 'none'}
                            >
                              <option value="">Select a department...</option>
                              {departments.map((d) => (
                                <option key={d.department_id} value={d.department_id}>{d.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDepartmentAssign(u)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
                              >
                                <UserCheck size={16} />
                                Save
                              </button>
                              {assignmentHistory[u.user_id] && assignmentHistory[u.user_id].length > 0 && (
                                <button
                                  onClick={() => setHistoryModalOpen(u.user_id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                                  style={{ backgroundColor: NEUTRAL_LIGHT, color: CHARCOAL_TEXT, border: `1px solid ${NEUTRAL_BORDER}` }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_BORDER}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NEUTRAL_LIGHT}
                                  title="View assignment history"
                                >
                                  <ListTodo size={14} />
                                  History
                                </button>
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
          </section>          {/* Role Definition Section */}
          {/* <section className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
            <div className="p-6 text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield size={28} />
                Role Definition
              </h2>
              <p className="text-sm mt-1 opacity-90">
                Create, edit, and manage custom roles and their descriptions.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-[#F5F5F5] transition font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm text-sm"
                style={{ color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_COLOR}` }}
              >
                <Plus size={20} />
                Add New Role
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto border border-[#E0E0E0] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0] bg-white">
                    {loading ? (
                       <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Loading roles...</td>
                       </tr>
                    ) : roles.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No roles defined.</td>
                      </tr>
                    ) : (
                      roles.map((r) => (
                        <tr key={r.role_id} className="hover:bg-[#F5F5F5] transition">
                          <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{r.role_id}</td>
                          <td className="px-6 py-4 text-sm font-bold" style={{ color: PRIMARY_COLOR }}>{r.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            {r.description || 'No description provided'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEdit(r)}
                                className="inline-flex items-center px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-[#E0E0E0] transition font-medium text-sm border border-[#E0E0E0] shadow-sm"
                              >
                                <Pencil size={14} className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => deleteRole(r.role_id)}
                                className="inline-flex items-center px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm border border-red-300 shadow-sm"
                              >
                                <Trash2 size={14} className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section> */}

        </div>

        {/* Floating Components */}
        <RoleFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleRoleSaved}
          initialData={editingRole}
          ROLE_API={ROLE_API}
          getToken={getToken}
        />
        <AssignmentHistoryModal
          open={historyModalOpen !== null}
          onClose={() => setHistoryModalOpen(null)}
          userName={historyModalOpen ? users.find(u => u.user_id === historyModalOpen)?.username : ''}
          history={historyModalOpen ? assignmentHistory[historyModalOpen] : []}
        />
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />
        {confirmation && (
          <ConfirmationModal
            title={confirmation.title}
            text={confirmation.text}
            onConfirm={confirmation.onConfirm}
            onCancel={confirmation.onCancel}
            confirmText={confirmation.confirmText}
            confirmColor={confirmation.confirmColor}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;