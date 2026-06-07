import React, { useEffect, useState } from "react";

// ✅ Your API base URL (adjust if needed)
const API_BASE_URL = "http://127.0.0.1:3000/role";

export default function RoleFormModal({ open, onClose, onSaved, initialData }) {
  const [form, setForm] = useState({ name: "", desc: "" });
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialData);

  // ✅ Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  // ✅ Load form data when editing
  useEffect(() => {
    if (isEdit)
      setForm({ name: initialData.name, desc: initialData.description });
    else setForm({ name: "", desc: "" });
  }, [initialData, isEdit]);

  // ✅ Don't render modal if closed
  if (!open) return null;

  // ✅ Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Token missing. Please login again.");

      // ✅ Dynamic endpoint and method
      const url = isEdit
        ? `${API_BASE_URL}/updateRole/${initialData.role_id}`
        : `${API_BASE_URL}/createRole`;
      const method = isEdit ? "PATCH" : "POST";

      // ✅ Send request
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || "Failed to save role");
      }

      await onSaved();
      onClose();
    } catch (err) {
      alert(err.message || "Error saving role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Role" : "Add Role"}
        </h3>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Role Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              placeholder="Enter role name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              placeholder="Enter role description"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
