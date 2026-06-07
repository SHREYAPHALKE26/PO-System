import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Users, Building2, CheckCircle2, AlertTriangle, RotateCcw, X } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

// --- Theme Colors ---
const PRIMARY_COLOR = '#1E3A8A';
const PRIMARY_HOVER = '#162C6A';
const CHARCOAL_TEXT = '#1F2937';
const SUCCESS_COLOR = '#10B981';
const WARNING_COLOR = '#F59E0B';
const DANGER_COLOR = '#EF4444';

const AssignDepartment = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("authToken");

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      Swal.fire({
        icon: "warning",
        title: "Session expired",
        text: "Please log in again.",
        confirmButtonColor: "#1E3A8A",
      }).then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roles");
        window.location.href = "/login";
      });
      return true;
    }
    return false;
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/adminDept/departments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load departments");

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error loading departments");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/adminDept/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load users");

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchDepartments(), fetchUsers()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async (user) => {
    const deptId = selectedDept[user.user_id];

    if (!deptId) {
      Swal.fire({
        icon: "info",
        title: "No department selected",
        text: "Please choose a department before saving.",
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/adminDept/assign/${user.user_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ department_id: parseInt(deptId, 10) }),
        }
      );

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to assign department");

      Swal.fire({
        icon: "success",
        title: "Department updated",
        text: `User ${user.username} is now in ${data.user.department_name}.`,
        timer: 1800,
        showConfirmButton: false,
      });

      // update in UI
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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message || "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ fontFamily: 'Inter, Poppins, Roboto, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3 mb-2" style={{ color: CHARCOAL_TEXT }}>
              <Users size={40} style={{ color: PRIMARY_COLOR }} />
              Department Assignment
            </h1>
            <p className="text-gray-600 font-medium">
              Map users to departments for budget routing and RFQ management
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            className="px-5 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw size={18} className={loading ? "animate-spin" : "text-gray-600"} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

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

        {/* Info Banner */}
        <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-xl flex items-start gap-4 shadow-sm">
          <Users size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-800 font-bold text-sm">Assignment Rules</h3>
            <p className="text-blue-700 text-sm mt-1">
              <strong>Requestor</strong> and <strong>Approver</strong> roles can be assigned to departments. Admin and Purchasing Officer roles are system-restricted.
            </p>
          </div>
        </div>

        {/* Main Table Section */}
        <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
          <div className="px-8 py-7 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-1">
              <Building2 size={32} />
              User Department Mapping
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Assign each user to their respective department for proper authorization and budget tracking.
            </p>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" style={{ borderTopColor: PRIMARY_COLOR }}></div>
                <p className="text-gray-600 font-semibold">Loading users and departments...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users size={48} className="text-gray-300" />
                <p className="text-gray-500 font-medium">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-gray-100 border-b-2 border-blue-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Current Dept.</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assign Dept.</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((u) => (
                      <tr
                        key={u.user_id}
                        className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100"
                      >
                        <td className="px-6 py-4 font-bold text-sm" style={{ color: CHARCOAL_TEXT }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PRIMARY_COLOR }}>
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            {u.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 hidden sm:table-cell text-xs">{u.email}</td>
                        <td className="px-6 py-4">
                          {u.department_name ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: `${SUCCESS_COLOR}15`, color: SUCCESS_COLOR, border: `1px solid ${SUCCESS_COLOR}40` }}>
                              <CheckCircle2 size={14} />
                              {u.department_name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 animate-pulse" style={{ backgroundColor: `${WARNING_COLOR}20`, color: WARNING_COLOR }}>
                              <AlertTriangle size={14} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-opacity-50 font-medium hover:border-blue-400 hover:shadow-md transition-all duration-200 appearance-none cursor-pointer"
                            style={{
                              focusRingColor: PRIMARY_COLOR,
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231E3A8A' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.7rem center',
                              paddingRight: '2.5rem'
                            }}
                            value={selectedDept[u.user_id] || u.department_id || ""}
                            onChange={(e) =>
                              setSelectedDept((prev) => ({
                                ...prev,
                                [u.user_id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select a department...</option>
                            {departments.map((d) => (
                              <option
                                key={d.department_id}
                                value={d.department_id}
                              >
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleAssign(u)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                          >
                            <CheckCircle2 size={16} />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AssignDepartment;
