import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  ChevronRight,
  Plus,
  X,
  Trash2,
  FileText,
  Clock,
  Building2,
  List,
  ChevronDown,
  Edit,
} from "lucide-react";
import NotificationBell from "../Same/NotificationBell.jsx";

// Assuming these API endpoints are correct for your backend
const API_BASE_URL = "http://127.0.0.1:3000/rfq";
const DEPT_API_URL = "http://127.0.0.1:3000/dept";
const AUTH_API_URL = "http://127.0.0.1:3000/profile/me";

// Helper function to get the status badge color
const getStatusColor = (status) => {
  const colors = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    closed: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};

// --- RFQ Item Detail Component ---
// Now fetches items for each RFQ from `/rfq/:id`
const RFQDetailView = ({ rfq, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(rfq.items || []);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(
    Array.isArray(rfq.items) && rfq.items.length > 0
  );

  const fetchItemsForRFQ = async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/${rfq.rfq_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch RFQ items for rfq_id:", rfq.rfq_id);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error("Error loading RFQ items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleToggleOpen = async (e) => {
    if (e) e.stopPropagation();
    const newOpen = !isOpen;
    setIsOpen(newOpen);

    // When opening and items not yet loaded, fetch them
    if (newOpen && !itemsLoaded) {
      await fetchItemsForRFQ();
    }
  };

  return (
    <React.Fragment key={rfq.rfq_id}>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={handleToggleOpen}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          #{rfq.rfq_id}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{rfq.title}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4 text-gray-400" />
            {rfq.department_name || "—"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              rfq.status
            )}`}
          >
            {rfq.status || "Unknown"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            {new Date(rfq.created_at).toLocaleDateString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Toggle Details"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                  }`}
              />
              Details
            </button>
            {/* Conditional Edit Button */}
            {rfq.status?.toLowerCase() === "open" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(rfq);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                title="Edit RFQ"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {/* Conditional Delete Button */}
            {rfq.status?.toLowerCase() === "open" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(rfq.rfq_id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                title="Delete RFQ"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-gray-50/50">
          <td colSpan="6" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">
                  {rfq.description || "No description provided."}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Requested Items</h4>
                {loadingItems ? (
                  <p className="text-gray-500 italic">Loading items...</p>
                ) : !items || items.length === 0 ? (
                  <p className="text-gray-500 italic">No items listed.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {items.map((item) => (
                      <li
                        key={item.rfq_item_id}
                        className="flex justify-between"
                      >
                        <span className="font-medium text-gray-900">
                          {item.item_name}
                        </span>
                        <span>
                          Quantity:{" "}
                          <span className="text-gray-900 font-semibold">
                            {item.quantity}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

// --- Main Dashboard Component ---
export default function RequestorDashboard() {
  const [rfqs, setRfqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    department_id: "",
    items: [{ item_name: "", quantity: "" }],
    isEditing: false,
    rfq_id: null,
  });

  const getToken = () => localStorage.getItem("authToken");

  const resetForm = useCallback(() => {
    setForm({
      title: "",
      description: "",
      department_id: isAdmin ? "" : user?.department_id || "",
      items: [{ item_name: "", quantity: "" }],
      isEditing: false,
      rfq_id: null,
    });
  }, [isAdmin, user]);

  const fetchUserInfo = async () => {
    try {
      const token = getToken();
      const res = await fetch(AUTH_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data && data.username) {
        setUser(data);
        const isAdminRole = data.roles && data.roles.includes("Admin");
        setIsAdmin(isAdminRole);
        setForm((f) => ({
          ...f,
          department_id: isAdminRole ? "" : data.department_id || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchRFQs = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/getAll`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setRfqs(data.rfqs || data || []);
    } catch (err) {
      console.error("Error fetching RFQs:", err);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDepartments = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const token = getToken();
      const res = await fetch(`${DEPT_API_URL}/getAllDepartments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRFQs();
      fetchDepartments();
    }
  }, [user, isAdmin, fetchRFQs, fetchDepartments]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...form.items];
    newItems[index][name] = value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { item_name: "", quantity: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  // Updated: Fetch full RFQ (including items) before editing
  const startEditRFQ = async (rfq) => {
    if (rfq.status?.toLowerCase() !== "open") {
      Swal.fire({
        icon: "info",
        title: "Cannot Edit",
        text: "Only 'Open' RFQs can be edited.",
      });
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/${rfq.rfq_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch RFQ details");
      }

      const data = await res.json();

      setForm({
        title: data.title,
        description: data.description,
        department_id: String(data.department_id),
        items: (data.items || []).map((item) => ({
          item_name: item.item_name || "",
          quantity: item.quantity ?? "",
        })),
        isEditing: true,
        rfq_id: data.rfq_id,
      });
      setShowForm(true);
    } catch (err) {
      console.error("Error loading RFQ for edit:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load RFQ details for editing.",
      });
    }
  };

  // Function to delete an RFQ (Passed as prop)
  const deleteRFQ = async (id) => {
    const result = await Swal.fire({
      title: "Delete RFQ?",
      text: "Are you sure you want to delete this RFQ? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3A8A",
      cancelButtonColor: "#9E9E9E",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/deleteRFQ/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete RFQ");
      }

      fetchRFQs();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "RFQ deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to delete RFQ",
      });
    }
  };

  const handleSubmit = async () => {
    const token = getToken();

    // --- Validation Logic ---
    if (!form.title || !form.description) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Title and Description are required.",
      });
      return;
    }

    if (
      form.items.length === 0 ||
      form.items.some(
        (item) =>
          !item.item_name ||
          !item.quantity ||
          isNaN(parseInt(item.quantity)) ||
          parseInt(item.quantity) <= 0
      )
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Items",
        text: "At least one item with a valid name and positive quantity is required.",
      });
      return;
    }

    if (!form.department_id) {
      Swal.fire({
        icon: "warning",
        title: "Department Required",
        text: "Department must be selected or assigned. Contact Admin if not assigned.",
      });
      return;
    }

    try {
      setLoading(true);
      const url = form.isEditing
        ? `${API_BASE_URL}/updateRFQ/${form.rfq_id}`
        : `${API_BASE_URL}/create`;
      const method = form.isEditing ? "PATCH" : "POST";
      const successMessage = form.isEditing
        ? "RFQ updated successfully ✅"
        : "RFQ created successfully ✅";
      const errorMessage = form.isEditing
        ? "Failed to update RFQ"
        : "Failed to create RFQ";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          department_id: form.department_id,
          items: form.items,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorMessage);
      }

      resetForm();
      setShowForm(false);
      fetchRFQs();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: successMessage,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (user === null) {
    return (
      <div className="flex-1 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  // --- Main Render Structure ---
  return (
    <div className="flex-1 min-h-screen bg-white font-['Inter',sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title and User Info */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {isAdmin ? "Admin – RFQ Management" : "Requestor Dashboard"}
              </h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome,{" "}
                  <span className="font-medium text-gray-900">
                    {user.username}
                  </span>
                  {!isAdmin && (
                    <>
                      <span className="mx-2 text-gray-400">|</span>
                      <Building2 className="inline w-4 h-4 mr-1" />
                      <span className="font-medium text-gray-900">
                        {user.department_name || "Not Assigned"}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) resetForm();
                }}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {showForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Close Form
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    New Request
                  </>
                )}
              </button>
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create/Update Request Section */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" />
                <h2 className="text-lg font-semibold text-blue-900">
                  {form.isEditing
                    ? `Edit RFQ #${form.rfq_id}`
                    : "Create New RFQ"}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"


                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="Enter RFQ title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all resize-none text-gray-900"
                  placeholder="Enter description"
                  rows="4"
                  required
                />
              </div>

              {/* Department */}
              {isAdmin ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={(e) =>
                      setForm({ ...form, department_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    value={user?.department_name || "Not Assigned"}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Items <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        name="item_name"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, e)}
                        placeholder="Item name"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all text-gray-900"
                        required
                      />
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        placeholder="Quantity"
                        className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all text-gray-900"
                        min="1"
                        required
                      />
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  {loading
                    ? form.isEditing
                      ? "Updating..."
                      : "Submitting..."
                    : form.isEditing
                      ? "Update RFQ"
                      : "Submit RFQ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My RFQs Section */}
        {!showForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-blue-900" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    My RFQs
                  </h2>
                </div>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium text-gray-900">
                    {rfqs.length}
                  </span>{" "}
                  Total Requests
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading RFQs...</p>
                </div>
              ) : rfqs.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No RFQs found.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create your first request to get started.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        RFQ ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rfqs.map((r) => (
                      <RFQDetailView
                        key={r.rfq_id}
                        rfq={r}
                        onEdit={startEditRFQ}
                        onDelete={deleteRFQ}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* RFQ Status Timeline */}
        {!showForm && rfqs.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-900" />
                <h2 className="text-lg font-semibold text-gray-900">
                  RFQ Process Stages
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 justify-between">
                {[
                  "Created",
                  "Sent to Approver",
                  "Approved",
                  "Sent to Procurement",
                  "Assigned to Vendor",
                  "Closed",
                ].map((stage, index, arr) => (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center min-w-fit flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                        {stage}
                      </p>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="flex-shrink-0 w-16 h-0.5 bg-gray-300 mt-[-20px] relative hidden sm:block">
                        <ChevronRight className="w-5 h-5 text-gray-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
