import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Eye, Users, Building2 } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function OfficerRFQList() {
  const navigate = useNavigate();
  const [approvedRFQs, setApprovedRFQs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/officer/approvedRFQs`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();
        setApprovedRFQs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading approved RFQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQs();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-gray-600">Loading approved RFQs...</p>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        <FileText size={28} />
        Approved RFQs – Ready for Quotation Review
      </h2>

      {approvedRFQs.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">
          No approved RFQs available.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="p-3 border">RFQ ID</th>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Department</th>
                <th className="p-3 border">Requestor</th>
                <th className="p-3 border">Created</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {approvedRFQs.map((rfq) => (
                <tr
                  key={rfq.rfq_id}
                  className="hover:bg-blue-50 transition-all duration-150"
                >
                  <td className="p-3 border font-semibold text-gray-900">
                    #{rfq.rfq_id}
                  </td>
                  <td className="p-3 border">
                    <div className="font-semibold">{rfq.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {rfq.description}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-gray-500" />
                      {rfq.department_name}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-500" />
                      {rfq.requestor_name}
                    </div>
                  </td>
                  <td className="p-3 border text-gray-700">
                    {new Date(rfq.created_at).toLocaleDateString()}
                  </td>

                  {/* Review Button → opens your existing page */}
                  <td className="p-3 border text-center">
                    <button
                      onClick={() =>
                        navigate(`/officer/review/${rfq.rfq_id}`)
                      }
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 flex items-center gap-1 mx-auto"
                    >
                      <Eye size={16} />
                      Review Quotations
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
