import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Edit,
  Building2,
  Trash2,
  Plus,
  X,
  Mail,
  Phone,
  Star,
  Activity,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

const VendorDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    contact_email: "",
    phone_number: "",
    status: "Active",
    rating: 4.0,
    password: "",
  });
  const [editingVendor, setEditingVendor] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getToken = () => localStorage.getItem("authToken");

  // Fetch Vendors
  const fetchVendors = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token missing. Please login again.");

      const res = await fetch(`${API_BASE_URL}/vendor/getAllVendors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      setError(err.message || "Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Validate
  const validateForm = (vendorData) => {
    const errors = {};
    if (!vendorData.name?.trim()) errors.name = "Company name is required";
    if (!vendorData.contact_email?.trim()) {
      errors.contact_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(vendorData.contact_email)) {
      errors.contact_email = "Enter a valid email";
    }
    if (!vendorData.phone_number?.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(vendorData.phone_number)) {
      errors.phone_number = "Enter a valid 10-digit phone number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Vendor
  const handleAddVendor = async () => {
    if (validateForm(newVendor)) {
      try {
        const token = getToken();
        if (!token) throw new Error("Token missing. Please login again.");

        const res = await fetch(`${API_BASE_URL}/vendor/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newVendor.name,
            email: newVendor.contact_email,
            phoneno: newVendor.phone_number,
            tax_id: "65411",
            rating: newVendor.rating,
            active: newVendor.status === "Active" ? 1 : 0,
            password: newVendor.password || "",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to register vendor");

        alert(`Vendor Registered! ${data.vendor.generated_password ? `Auto-generated password: ${data.vendor.generated_password}` : "Vendor added successfully."}`);

        await fetchVendors();
        setNewVendor({
          name: "",
          contact_email: "",
          phone_number: "",
          status: "Active",
          rating: 4.0,
          password: "",
        });
        setShowAddModal(false);
      } catch (err) {
        alert(`Error! ${err.message || "Failed to create vendor."}`);
      }
    }
  };

  // Edit Vendor (open modal)
  const handleEditClick = (vendor) => {
    setEditingVendor({
      ...vendor,
      contact_email: vendor.email,
      phone_number: vendor.phoneno,
      status: vendor.active ? "Active" : "Inactive",
      rating: parseFloat(vendor.rating),
      password: "",
    });
    setShowEditModal(true);
  };

  // Update Vendor
  const handleUpdateVendor = async () => {
    if (validateForm(editingVendor)) {
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE_URL}/vendor/${editingVendor.vendor_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: editingVendor.name,
              email: editingVendor.contact_email,
              phoneno: editingVendor.phone_number,
              tax_id: editingVendor.tax_id || "65411",
              rating: editingVendor.rating,
              active: editingVendor.status === "Active" ? 1 : 0,
              password: editingVendor.password || undefined,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to update vendor");

        alert("Vendor Updated! Vendor details have been successfully updated.");

        await fetchVendors();
        setShowEditModal(false);
        setEditingVendor(null);
      } catch (err) {
        alert(`Update Failed! ${err.message || "Unable to update vendor."}`);
      }
    }
  };

  // Delete Vendor
  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm("Are you sure? This will permanently delete the vendor.")) {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/vendor/${vendorId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete vendor");

        alert("Deleted! Vendor has been removed.");
        await fetchVendors();
      } catch (err) {
        alert(`Error! ${err.message || "Unable to delete vendor."}`);
      }
    }
  };

  // Filters
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const s = searchTerm.toLowerCase();
      return (
        (v.name?.toLowerCase().includes(s) ||
          v.email?.toLowerCase().includes(s)) &&
        (statusFilter === "All" ||
          (v.active ? "Active" : "Inactive") === statusFilter)
      );
    });
  }, [vendors, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-900 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Vendor Management</h1>
              <p className="text-gray-600">Manage vendors efficiently</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-blue-800 hover:shadow-md"
            >
              <Plus size={20} /> Add Vendor
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Vendor Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVendors.map((v) => (
                  <tr key={v.vendor_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-900">{v.vendor_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{v.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{v.phoneno}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${v.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                        {v.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="text-sm font-medium text-gray-900">{v.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(v)}
                          className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(v.vendor_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Vendor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="text-blue-900" size={24} /> Add New Vendor
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Building2 size={16} className="text-gray-600" /> Company Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    />
                    {formErrors.name && <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Mail size={16} className="text-gray-600" /> Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={newVendor.contact_email}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, contact_email: e.target.value })
                      }
                    />
                    {formErrors.contact_email && <p className="text-red-600 text-xs mt-1">{formErrors.contact_email}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Phone size={16} className="text-gray-600" /> Phone *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={newVendor.phone_number}
                      onChange={(e) =>
                        setNewVendor({
                          ...newVendor,
                          phone_number: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                    />
                    {formErrors.phone_number && <p className="text-red-600 text-xs mt-1">{formErrors.phone_number}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Activity size={16} className="text-gray-600" /> Status
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200 bg-white"
                      value={newVendor.status}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, status: e.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                    placeholder="Leave blank for auto-generated"
                    value={newVendor.password}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <Star size={16} className="text-gray-600" /> Rating: {newVendor.rating.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                    value={newVendor.rating}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, rating: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVendor}
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-all duration-200 hover:shadow-md"
                >
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vendor Modal */}
        {showEditModal && editingVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Edit className="text-blue-900" size={24} /> Edit Vendor
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Company Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={editingVendor.name}
                      onChange={(e) =>
                        setEditingVendor({ ...editingVendor, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Email *</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={editingVendor.contact_email}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          contact_email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Phone *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                      value={editingVendor.phone_number}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          phone_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Status</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200 bg-white"
                      value={editingVendor.status}
                      onChange={(e) =>
                        setEditingVendor({ ...editingVendor, status: e.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
                    placeholder="Leave blank to keep current"
                    value={editingVendor.password}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Rating: {editingVendor.rating.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                    value={editingVendor.rating}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        rating: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVendor}
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-all duration-200 hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;