// src/pages/Officer/OfficerAssignVendors.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

// Theme Colors
const PRIMARY_COLOR = '#1E3A8A';
const SUCCESS_COLOR = '#10B981';
const WARNING_COLOR = '#F59E0B';

export default function OfficerAssignVendors() {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [rfqItems, setRfqItems] = useState([]);
  const [assignHistory, setAssignHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    fetchRFQs();
    fetchVendors();
    fetchAssignmentHistory();
  }, []);

  const fetchRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/officer/approvedRFQs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching RFQs:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/getAllVendors`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchRfqItems = async (rfq_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/officer/rfqItems/${rfq_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setRfqItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading RFQ items:", err);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rfqVendor/allAssignments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setAssignHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching assignment history:", err);
    }
  };

  const assignVendors = async () => {
    if (!selectedRFQ || selectedVendors.length === 0) {
      alert("Select RFQ and at least one vendor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/rfqVendor/assignVendors/${selectedRFQ}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            vendor_ids: selectedVendors.map((v) => Number(v)),
          }),
        }
      );

      const data = await res.json();
      alert(data.msg || "Vendors assigned!");

      setSelectedVendors([]);
      setSelectedRFQ("");
      setRfqItems([]);

      // Reload the page after successful assignment
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Assign error:", err);
      alert("Assignment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">

      {/* ROW 1 — RFQ Selection + Vendor Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* RFQ Selector */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Select RFQ</h2>

          <select
            className="w-full p-3 border rounded-xl"
            value={selectedRFQ}
            onChange={(e) => {
              setSelectedRFQ(e.target.value);
              fetchRfqItems(e.target.value);
            }}
          >
            <option value="">-- Select RFQ --</option>
            {rfqs.map((r) => (
              <option key={r.rfq_id} value={r.rfq_id}>
                {r.rfq_id} — {r.title}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Selection */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Assign Vendors</h2>

          <div className="h-64 overflow-y-auto space-y-3">
            {vendors.map((v) => (
              <label
                key={v.vendor_id}
                className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer ${selectedVendors.includes(String(v.vendor_id))
                  ? "bg-blue-50 border-blue-600"
                  : ""
                  }`}
              >
                <span>{v.name}</span>
                <input
                  type="checkbox"
                  value={v.vendor_id}
                  checked={selectedVendors.includes(String(v.vendor_id))}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedVendors((prev) =>
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id]
                    );
                  }}
                />
              </label>
            ))}
          </div>

          <button
            onClick={assignVendors}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg"
          >
            {loading ? "Assigning..." : "Assign Vendors"}
          </button>
        </div>
      </div>

      {/* ROW 2 — RFQ Items */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">RFQ Items</h2>

        {rfqItems.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Est. Price</th>
                <th className="p-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {rfqItems.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{item.item_name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{item.est_unit_price}</td>
                  <td className="p-2">
                    {(item.quantity * item.est_unit_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ROW 3 — Assignment History */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Assignment History</h2>
          <p className="text-sm text-gray-500 mt-1">Track all vendor assignments to RFQs</p>
        </div>

        {assignHistory.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No assignment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-gray-100 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RFQ ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-bold text-gray-800">#{row.rfq_id}</td>
                    <td className="px-6 py-4 text-gray-700 hidden sm:table-cell text-sm">{row.rfq_title}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.vendor_name}</td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell text-sm">{row.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: row.status === 'Quoted' ? `${SUCCESS_COLOR}20` : `${WARNING_COLOR}20`,
                          color: row.status === 'Quoted' ? SUCCESS_COLOR : WARNING_COLOR,
                          border: `1px solid ${row.status === 'Quoted' ? SUCCESS_COLOR : WARNING_COLOR}60`
                        }}
                      >
                        {row.status === 'Quoted' && <CheckCircle2 size={14} />}
                        {row.status === 'Pending' && <AlertTriangle size={14} />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(row.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
