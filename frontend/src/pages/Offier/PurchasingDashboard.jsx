import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../Same/NotificationBell";
import {
  ClipboardList,
  Truck,
  FileText,
  ArrowRight,
  Users2,
  Package,
  Clock,
  DollarSign,
  Loader2,
  ReceiptIndianRupeeIcon,
  IndianRupee,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function PurchasingDashboard() {
  const navigate = useNavigate();

  // State to hold fetched data
  const [approvedRFQs, setApprovedRFQs] = useState([]); // Used for assignment count
  const [submittedQuotes, setSubmittedQuotes] = useState([]); // Used for review count
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("authToken");

  // --- Data Fetching ---

  useEffect(() => {
    // Fetch all necessary data concurrently
    Promise.all([
      fetchApprovedRFQs(),
      fetchSubmittedQuotations(),
      fetchPurchaseOrders(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchApprovedRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/officer/approvedRFQs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setApprovedRFQs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading approved RFQs:", err);
    }
  };

  const fetchSubmittedQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/officer/all-quotations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSubmittedQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading quotations:", err);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/poReport/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading POs:", err);
    }
  };

  // --- Derived Metrics ---

  const totalPoValue = purchaseOrders.reduce(
    (sum, po) => sum + Number(po.total_amount || 0),
    0
  );


  // --- Render Logic ---

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-gray-600 ml-3">Loading dashboard...</p>
      </div>
    );

  const DashboardCard = ({ title, value, icon: Icon, color, onClick, buttonText }) => (
    <div
      className={`p-6 bg-white rounded-xl shadow-lg border border-${color}-200 flex flex-col justify-between transition-all duration-300 ${onClick ? "hover:shadow-xl cursor-pointer" : ""
        }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        <Icon className={`w-8 h-8 text-${color}-600 bg-${color}-50 p-1.5 rounded-full`} />
      </div>
      <p className="text-sm font-medium text-gray-500 mt-2">{title}</p>

      {onClick && (
        <button className={`mt-4 text-xs font-semibold text-${color}-600 flex items-center gap-1.5 hover:text-${color}-800 transition-colors`}>
          {buttonText} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-['Inter',sans-serif]">
      {/* MODIFIED: Header to include Assign Vendors button on the right */}
      <div className="flex items-center justify-between mb-8">
        
        {/* Dashboard Title */}
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <ClipboardList size={30} className="text-blue-600" /> 
          Purchasing Officer Dashboard
        </h1>

        {/* Action Buttons Container */}
        <div className="flex items-center gap-4">
            
            {/* Assign Vendors Button (MODIFIED: Moved here for better structure) */}
            <button
                onClick={() => navigate("/officer/assignedVendor")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold transition-colors shadow-md text-sm sm:text-base"
            >
                <Users2 size={20} /> Assign Vendors
            </button>

            {/* Notification Bell Component */} 
             <div className="flex gap-1">
                <NotificationBell />
            </div>
        </div>
      </div>
   

      {/* Metric Cards */ }
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    <DashboardCard
      title="RFQs Awaiting To Assinged Vendors"
      value={approvedRFQs.length}
      icon={Users2}
      color="blue"
    // Removed onClick and buttonText properties
    />
    <DashboardCard
      title="Quotes Awaiting Review"
      value={submittedQuotes.length}
      icon={Package}
      color="yellow"
      onClick={
        submittedQuotes.length > 0
          ? () => navigate(`/officer/quotations/${submittedQuotes[0].rfq_id}`) // Navigate to the first RFQ review page
          : null
      }
      buttonText={submittedQuotes.length > 0 ? "Review First Quote" : "No Quotes"}
    />
    <DashboardCard
      title="Total Purchase Orders"
      value={purchaseOrders.length}
      icon={Truck}
      color="green"
    />
    <DashboardCard
      title="Total PO Value (INR)"
      value={`₹${String(totalPoValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      icon={IndianRupee}
      color="teal"
    />
  </div>

  {/* ===========================
          SECTION 2: Submitted Quotations (for review)
      ============================ */}
  <div className="mb-10">
    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
      <FileText size={20} className="text-gray-600" />
      Quotation Review Queue
    </h2>

    <div className="bg-white shadow rounded-xl overflow-hidden border">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border text-left">RFQ</th>
            <th className="p-3 border text-left">Department</th>
            <th className="p-3 border text-center">Submitted Quotes</th>
            <th className="p-3 border text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {submittedQuotes.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="p-4 text-center text-gray-500 border"
              >
                All submitted vendor quotations have been reviewed.
              </td>
            </tr>
          ) : (
            submittedQuotes.map((rfq) => (
              <tr key={rfq.rfq_id} className="hover:bg-gray-50">
                <td className="p-3 border font-medium">
                  #{rfq.rfq_id} – {rfq.title}
                </td>
                <td className="p-3 border">{rfq.department_name}</td>
                <td className="p-3 border text-center font-medium text-blue-700">
                  {rfq.quotations.length}
                </td>
                <td className="p-3 border text-center">
                  <Link
                    to={`/officer/quotations/${rfq.rfq_id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 font-medium"
                  >
                    Review <ArrowRight size={16} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* ===========================
          SECTION 3: Previous Purchase Orders
      ============================ */}
  <div>
    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
      <Truck size={20} className="text-green-600" />
      Previous Purchase Orders
    </h2>

    <div className="bg-white shadow rounded-xl overflow-hidden border">
      <table className="min-w-full">
        <thead className="bg-green-50">
          <tr>
            <th className="p-3 border text-left">PO Number</th>
            <th className="p-3 border text-left">RFQ</th>
            <th className="p-3 border text-left">Vendor</th>
            <th className="p-3 border text-right">Total</th>
            <th className="p-3 border text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {purchaseOrders.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="p-4 text-center text-gray-500 border"
              >
                No purchase orders found.
              </td>
            </tr>
          ) : (
            purchaseOrders.map((po) => (
              <tr key={po.po_id} className="hover:bg-green-50">
                <td className="p-3 border font-medium text-green-800">
                  **{po.po_number}**
                </td>
                <td className="p-3 border">RFQ #{po.rfq_id}</td>
                <td className="p-3 border">{po.vendor_name}</td>
                <td className="p-3 border text-right font-semibold">
                  ₹{po.total_amount ? po.total_amount.toLocaleString() : 'N/A'}
                </td>
                <td className="p-3 border text-center">
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${po.status === "Delivered" ? "bg-green-100 text-green-700" :
                      po.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                    }`}>
                    {po.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
    </div >
  );
}