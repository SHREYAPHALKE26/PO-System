// src/pages/Shared/DepartmentPOList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CalendarDays, Building2, User, ArrowRight } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function DepartmentPOList() {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("authToken");

  const fetchPOs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/po/departmentPOs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load POs");

      setIsAdmin(!!data.isAdmin);
      setPoList(Array.isArray(data.purchaseOrders) ? data.purchaseOrders : []);
    } catch (err) {
      console.error("Error loading POs:", err);
      setError(err.message || "Error loading POs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
            <FileText className="text-blue-700" />
            {isAdmin ? "All Purchase Orders" : "Department Purchase Orders"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View Purchase Orders that belong to your department.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Card */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading Purchase Orders...</div>
        ) : poList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No Purchase Orders available to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    PO Number
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    RFQ
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Vendor
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Department
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-600 uppercase">
                    Total
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-600 uppercase">
                    Created
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-600 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {poList.map((po) => (
                  <tr
                    key={po.po_id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      #{po.po_number}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">
                        {po.rfq_title}
                      </div>
                      <div className="text-xs text-slate-500">
                        RFQ #{po.rfq_id}
                      </div>
                    </td>
                    <td className="p-3 text-slate-800">
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        {po.vendor_name}
                      </div>
                    </td>
                    <td className="p-3 text-slate-800">
                      <div className="flex items-center gap-1">
                        <Building2 size={14} className="text-slate-400" />
                        {po.department_name}
                      </div>
                    </td>
                    <td className="p-3 text-center text-slate-900 font-medium">
                      ₹{Number(po.total_amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${
                          po.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : po.status === "Completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : po.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <CalendarDays size={14} className="text-slate-400" />
                        {po.created_at
                          ? new Date(po.created_at).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          navigate(`/shared/department-pos/${po.po_id}`)
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                      >
                        View
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
