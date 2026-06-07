// src/pages/Vendor/VendorDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import NotificationBell from "../Same/NotificationBell";

import {
  ClipboardList,
  FileCheck,
  Eye,
  LogOut,
  Loader2,
  User,
  ChevronDown,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:3000";

// --- Dropdown Item Component ---
const DropdownItem = ({ icon: Icon, label, onClick, isDanger = false }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
      ${isDanger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

// --- Profile Dropdown Component ---
const ProfileDropdown = ({ vendorName, handleLogout, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = () => {
    navigate("/vendor/profile");
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    handleLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
      >
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-900 text-white font-semibold text-sm">
          {vendorName ? vendorName[0].toUpperCase() : "V"}
        </div>
        <span className="font-semibold text-gray-900 hidden sm:inline">
          {vendorName}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {vendorName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Vendor Access</p>
          </div>
          <div className="py-1.5">
            <DropdownItem icon={User} label="Profile" onClick={handleProfile} />
            <div className="my-1 border-t border-gray-100" />
            <DropdownItem
              icon={LogOut}
              label="Logout"
              onClick={handleLogoutClick}
              isDanger
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function VendorDashboard() {
  const [tab, setTab] = useState("assigned"); // 'assigned' | 'submitted' | 'accepted'
  const [assignedRFQs, setAssignedRFQs] = useState([]);
  const [submittedQuotes, setSubmittedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendorName = localStorage.getItem("vendorName") || "Vendor";
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("vendorToken");

  const fetchAssignedRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/assignedRFQs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch assigned RFQs");

      // backend returns array directly
      setAssignedRFQs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching assigned RFQs:", err.message);
      alert(`Error fetching assigned RFQs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedQuotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/submittedQuotations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch quotations");
      // Expecting fields: quote_id, rfq_id, rfq_title, total_price, status, submitted_at, po_id, po_number
      setSubmittedQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching submitted quotes:", err.message);
      alert(`Error fetching submitted quotes: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  useEffect(() => {
    fetchAssignedRFQs();
    fetchSubmittedQuotes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorName");
    localStorage.removeItem("vendorId");
    navigate("/vendor/login");
  };

  // 🔔 Accepted list for notification tab
  const acceptedQuotes = submittedQuotes.filter(
    (q) => q.status === "Accepted"
  );

  // 🔽 PDF download for PO
  const downloadPO = async (po_id, po_number) => {
    try {
      if (!po_id) {
        alert("PO is not generated yet for this quotation.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/vendor/po/${po_id}/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || "Failed to download PO PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${po_number || po_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PO download error:", err);
      alert(err.message || "Failed to download PO PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-blue-900" size={40} />
        <p className="mt-4 text-gray-600 font-medium text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Vendor Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back,{" "}
              <span className="text-blue-900 font-semibold">{vendorName}</span>
            </p>
            {acceptedQuotes.length > 0 && (
              <p className="mt-1 text-xs text-green-700 font-medium">
                <CheckCircle2 className="inline mr-1" size={14} />
                You have {acceptedQuotes.length} accepted quotation
                {acceptedQuotes.length > 1 ? "s" : ""}.
              </p>
            )}

          </div>
          <div className="flex items-center gap-4">
            
            <ProfileDropdown
              vendorName={vendorName}
              handleLogout={handleLogout}
              navigate={navigate}
            />
          </div>


        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200">
          <TabButton
            icon={ClipboardList}
            label="Assigned RFQs"
            isActive={tab === "assigned"}
            onClick={() => setTab("assigned")}
          />
          <TabButton
            icon={FileCheck}
            label="Quotations Submitted"
            isActive={tab === "submitted"}
            onClick={() => setTab("submitted")}
          />
          <TabButton
            icon={CheckCircle2}
            label={`Accepted / PO Generated${acceptedQuotes.length ? ` (${acceptedQuotes.length})` : ""
              }`}
            isActive={tab === "accepted"}
            onClick={() => setTab("accepted")}
          />
        </div>

        {/* Assigned RFQs Section (only not-quoted RFQs) */}
        {tab === "assigned" && (
          <AssignedRFQSection
            assignedRFQs={assignedRFQs}
            formatDate={formatDate}
            navigate={navigate}
          />
        )}

        {/* Submitted Quotations Section */}
        {tab === "submitted" && (
          <SubmittedQuotesSection
            quotes={submittedQuotes}
            formatDate={formatDate}
          />
        )}

        {/* Accepted Quotes / Notification Tab with PDF download */}
        {tab === "accepted" && (
          <AcceptedQuotesSection
            quotes={acceptedQuotes}
            formatDate={formatDate}
            downloadPO={downloadPO}
          />
        )}
      </div>

      <div className="py-6 text-center text-sm text-gray-500 border-t border-gray-200 mt-16 bg-gray-50">
        <p className="font-medium">
          &copy; {new Date().getFullYear()} Vendor Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// --- Sections ---

const AssignedRFQSection = ({ assignedRFQs, formatDate, navigate }) => {
  // Option A: show ONLY RFQs that are still open for quoting
  const openRFQs = assignedRFQs.filter(
    (rfq) =>
      !rfq.assignment_status ||
      rfq.assignment_status === "Pending" ||
      rfq.assignment_status === "Assigned"
  );

  return (
    <div className="w-full max-w-none bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Assigned RFQs</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          RFQs assigned to you for quotation
        </p>
      </div>

      {/* Desktop */}
      <div className="overflow-x-auto hidden sm:block w-full">
        {openRFQs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">
              No RFQs currently pending for quotation.
            </p>
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <TableHeader>RFQ ID</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Assigned Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {openRFQs.map((rfq) => (
                <tr
                  key={rfq.rfq_id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <TableCell className="font-mono text-blue-900 font-semibold">
                    {rfq.rfq_id}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {rfq.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {rfq.department_name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={rfq.assignment_status || "Pending"}
                      type="warning"
                    />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(rfq.Assigned_At || rfq.assigned_at)}
                  </TableCell>
                  <TableCell>
                    <SubmitQuoteButton rfqId={rfq.rfq_id} navigate={navigate} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden px-4 py-4">
        {openRFQs.length === 0 ? (
          <div className="text-center py-6">
            <ClipboardList className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              No RFQs currently pending for quotation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {openRFQs.map((rfq) => (
              <div
                key={rfq.rfq_id}
                className="border border-gray-200 rounded-xl shadow-sm px-4 py-3 bg-white"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="text-sm font-mono text-blue-900 font-semibold">
                      #{rfq.rfq_id}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {rfq.title}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {rfq.department_name}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={rfq.assignment_status || "Pending"}
                      type="warning"
                    />
                    <div className="text-xs text-gray-500">
                      {formatDate(rfq.Assigned_At || rfq.assigned_at)}
                    </div>
                  </div>
                  <SubmitQuoteButton rfqId={rfq.rfq_id} navigate={navigate} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SubmittedQuotesSection = ({ quotes, formatDate }) => (
  <div className="w-full max-w-none bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h2 className="text-lg font-bold text-gray-900">Submitted Quotations</h2>
      <p className="text-sm text-gray-500 mt-0.5">
        Your quotation submission history
      </p>
    </div>

    {/* Desktop */}
    <div className="overflow-x-auto hidden sm:block w-full">
      {quotes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <FileCheck className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">
            No quotations submitted yet.
          </p>
        </div>
      ) : (
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader>RFQ ID</TableHeader>
              <TableHeader>Title</TableHeader>
              <TableHeader>Submitted Date</TableHeader>
              <TableHeader>Total Price</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {quotes.map((q) => (
              <tr
                key={q.quote_id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <TableCell className="font-mono text-blue-900 font-semibold">
                  {q.rfq_id}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {q.rfq_title}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(q.submitted_at)}
                </TableCell>
                <TableCell className="font-bold text-blue-900">
                  ₹{Number(q.total_price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={q.status}
                    type={
                      q.status === "Accepted"
                        ? "success"
                        : q.status === "Submitted"
                          ? "warning"
                          : "danger"
                    }
                  />
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* Mobile */}
    <div className="sm:hidden px-4 py-4">
      {quotes.length === 0 ? (
        <div className="text-center py-6">
          <FileCheck className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">
            No quotations submitted yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <div
              key={q.quote_id}
              className="border border-gray-200 rounded-xl shadow-sm px-4 py-3 bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-mono text-blue-900 font-semibold">
                    #{q.rfq_id}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {q.rfq_title}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <div>{formatDate(q.submitted_at)}</div>
                  <div className="mt-2 font-bold text-blue-900">
                    ₹{Number(q.total_price || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge
                  status={q.status}
                  type={
                    q.status === "Accepted"
                      ? "success"
                      : q.status === "Submitted"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Accepted / PO tab
const AcceptedQuotesSection = ({ quotes, formatDate, downloadPO }) => (
  <div className="w-full max-w-none bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 bg-green-50 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Accepted Quotations / PO Generated
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          Quotations that have been approved by the purchasing officer.
        </p>
      </div>
    </div>

    {/* Desktop */}
    <div className="overflow-x-auto hidden sm:block w-full">
      {quotes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">
            No accepted quotations yet.
          </p>
        </div>
      ) : (
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader>RFQ ID</TableHeader>
              <TableHeader>Title</TableHeader>
              <TableHeader>Submitted</TableHeader>
              <TableHeader>Total Price</TableHeader>
              <TableHeader>PO Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {quotes.map((q) => (
              <tr
                key={q.quote_id}
                className="hover:bg-green-50 transition-colors duration-150"
              >
                <TableCell className="font-mono text-blue-900 font-semibold">
                  {q.rfq_id}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {q.rfq_title}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(q.submitted_at)}
                </TableCell>
                <TableCell className="font-bold text-blue-900">
                  ₹{Number(q.total_price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {q.po_number ? (
                    <span className="inline-flex flex-col text-xs font-semibold text-green-700">
                      <span className="mb-1 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-50 border border-green-200">
                        <CheckCircle2 size={14} />
                        PO Generated
                      </span>
                      <span className="text-[11px] text-gray-600">
                        PO No:{" "}
                        <span className="font-mono">{q.po_number}</span>
                      </span>
                    </span>
                  ) : (
                    <StatusBadge status="Accepted" type="success" />
                  )}
                </TableCell>
                <TableCell>
                  {q.po_id ? (
                    <button
                      onClick={() => downloadPO(q.po_id, q.po_number)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-all"
                    >
                      <Download size={14} />
                      Download PO PDF
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      PO not generated yet
                    </span>
                  )}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* Mobile */}
    <div className="sm:hidden px-4 py-4">
      {quotes.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">
            No accepted quotations yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <div
              key={q.quote_id}
              className="border border-green-200 rounded-xl shadow-sm px-4 py-3 bg-green-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-mono text-blue-900 font-semibold">
                    #{q.rfq_id}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {q.rfq_title}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Submitted: {formatDate(q.submitted_at)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 text-right">
                  <div className="font-bold text-blue-900">
                    ₹{Number(q.total_price || 0).toLocaleString()}
                  </div>
                  {q.po_number && (
                    <div className="mt-1 text-[11px]">
                      PO:{" "}
                      <span className="font-mono text-green-800">
                        {q.po_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge status="Accepted" type="success" />
                {q.po_id ? (
                  <button
                    onClick={() => downloadPO(q.po_id, q.po_number)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-lg font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-all"
                  >
                    <Download size={12} />
                    PO PDF
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-500">
                    PO not generated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// --- Utility components ---

const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 border-b-2 -mb-px
      ${isActive
        ? "border-blue-900 text-blue-900"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-4 text-sm whitespace-normal break-words ${className}`}>
    {children}
  </td>
);

const StatusBadge = ({ status, type }) => {
  let classes = "";
  if (type === "success") {
    classes = "bg-green-50 text-green-700 border-green-200";
  } else if (type === "warning") {
    classes = "bg-yellow-50 text-yellow-700 border-yellow-200";
  } else if (type === "danger") {
    classes = "bg-red-50 text-red-700 border-red-200";
  } else {
    classes = "bg-gray-50 text-gray-700 border-gray-200";
  }
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${classes}`}
    >
      {status}
    </span>
  );
};

const SubmitQuoteButton = ({ rfqId, navigate }) => (
  <button
    onClick={() => navigate(`/vendor/submit-quotation/${rfqId}`)}
    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 bg-blue-900 text-white hover:bg-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
  >
    <Eye size={16} /> View / Quote
  </button>
);
