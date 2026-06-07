import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_BASE_URL = "http://127.0.0.1:3000/dept";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", budget: "" });
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => localStorage.getItem("authToken");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Token missing");

      const res = await fetch(`${API_BASE_URL}/getAllDepartments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch departments");

      const data = await res.json();
      setDepartments(data);
      setError("");
    } catch (err) {
      const errorMessage = err.message || "Failed to load departments";
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error Loading Departments",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Department name is required.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Token missing");

      const url = editingDept
        ? `${API_BASE_URL}/updateDepartment/${editingDept.department_id}`
        : `${API_BASE_URL}/createDepartment`;
      const method = editingDept ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save department");

      await fetchDepartments();
      resetForm();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: editingDept ? "Department updated successfully!" : "Department created successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error saving department",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      description: dept.description,
      budget: dept.budget,
    });
  };

  const deleteDepartment = async (id) => {
    const result = await Swal.fire({
      title: "Delete Department?",
      text: "Are you sure you want to delete this department? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/deleteDepartment/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete department");

      await fetchDepartments();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Department deleted successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error deleting department",
      });
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", budget: "" });
    setEditingDept(null);
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description &&
        d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 bg-white min-h-screen font-inter">
      <h1 className="text-4xl font-semibold text-center mb-12 flex items-center justify-center gap-3 text-gray-900">
        <span className="text-blue-800">Department Management</span>
        <span className="text-gray-400 text-4xl">🏢</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT SIDE — TABLE */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-2/3 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 focus:ring-4 focus:ring-blue-200 focus:border-blue-800 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              onClick={fetchDepartments}
              className="px-5 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Description</th>
                  <th className="p-3 border-b">Budget</th>
                  <th className="p-3 border-b text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-gray-400"
                    >
                      No departments found
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((d) => (
                    <tr
                      key={d.department_id}
                      className="hover:bg-gray-50 text-gray-700"
                    >
                      <td className="p-3 border-b text-gray-500">
                        {d.department_id}
                      </td>
                      <td className="p-3 border-b font-medium">
                        {d.name}
                      </td>
                      <td className="p-3 border-b text-gray-500">
                        {d.description || "—"}
                      </td>
                      <td className="p-3 border-b font-medium">
                        {d.budget}
                      </td>
                      <td className="p-3 border-b text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(d)}
                          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDepartment(d.department_id)}
                          className="px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-md hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE — FORM */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-8 h-fit">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">
            {editingDept ? "Edit Department" : "Add New Department"}
          </h3>

          <div className="flex flex-col gap-5">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                Department Name <span className="text-red-600">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-700 transition"
                placeholder="Enter department name"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                Description / Code
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-700 transition"
                placeholder="Enter department description"
              />
            </div>

            {/* BUDGET */}
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-700 transition"
                placeholder="Enter budget amount"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-lg text-white font-medium transition ${loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-700 hover:bg-blue-800"
                  }`}
              >
                {loading
                  ? "Saving..."
                  : editingDept
                    ? "Save Changes"
                    : "Save Department"}
              </button>

              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
