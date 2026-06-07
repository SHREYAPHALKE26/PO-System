import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function VendorAssignedRFQs() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVendorLogout = () => {
    localStorage.removeItem("vendorToken");
    window.location.href = "/vendor/login";
  };

  const getToken = () => localStorage.getItem("vendorToken");

  const fetchAssignedRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/assignedRFQs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch RFQs");
      setRfqs(data);
    } catch (err) {
      // You can specifically check for 401 Unauthorized here if your backend sends it
      // For now, any fetch error triggers the error state and shows the logout button
      setError("sdfghjk" + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedRFQs();
  }, []);

  if (loading) return <p className="p-6">Loading RFQs...</p>;

  // 👇 CRITICAL CHANGE: If there is an error (like an expired token), 
  //    we render the error message AND the Logout button.
  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
        <p className="text-red-600 mb-4">**Error: {error}**. Please log out and log back in.</p>
        <button
          onClick={handleVendorLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          **Logout**
        </button>
      </div>
    );
  }
  // 👆 END OF CRITICAL CHANGE

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          📋 Assigned RFQs
        </h2>
        {/* The logout button is also visible here during normal operation */}
        <button
          onClick={handleVendorLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>

      {rfqs.length === 0 ? (
        <p className="text-gray-500">No RFQs assigned yet.</p>
      ) : (
        <table className="w-full border border-gray-200 text-sm">
          {/* ... table content ... */}
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">RFQ Title</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Requestor</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((r) => (
              <tr key={r.rfq_id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.department_name}</td>
                <td className="p-3">{r.requestor_name}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      r.assignment_status === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : r.assignment_status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.assignment_status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {r.assignment_status === "Pending" && (
                    <a
                      href={`/vendor/submit-quotation/${r.rfq_id}`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Submit Quote
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}