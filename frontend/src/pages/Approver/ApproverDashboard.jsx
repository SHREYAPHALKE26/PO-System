// src/pages/Approver/ApproverDashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import NotificationBell from "../Same/NotificationBell";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Wallet,
  CalendarDays,
  ChevronDown, // Added ChevronDown for the toggle button
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

const ApproverDashboard = () => {
  const [pendingRFQs, setPendingRFQs] = useState([]);
  const [approvedRFQs, setApprovedRFQs] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'approved'
  const [error, setError] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [budgetInfo, setBudgetInfo] = useState(null);

  // State for item dropdown
  const [rfqItemsMap, setRfqItemsMap] = useState({});
  const [openRfqId, setOpenRfqId] = useState(null);
  const [loadingItemsFor, setLoadingItemsFor] = useState(null);

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

  // 🔹 Fetch Pending RFQs
  const fetchPendingRFQs = useCallback(async () => {
    try {
      setLoadingPending(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/approver/pendingRFQs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load pending RFQs");

      const isUserAdmin = !!data.isAdmin;
      setIsAdmin(isUserAdmin);
      setBudgetInfo(isUserAdmin ? null : data.departmentInfo || null);

      setPendingRFQs(Array.isArray(data.rfqs) ? data.rfqs : []);
    } catch (err) {
      console.error("Error loading pending RFQs:", err);
      setError(err.message || "Error loading pending RFQs");
    } finally {
      setLoadingPending(false);
    }
  }, []);

  // 🔹 Fetch Approved RFQs
  const fetchApprovedRFQs = useCallback(async () => {
    try {
      setLoadingApproved(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/approver/approvedRFQs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load approved RFQs");

      setApprovedRFQs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading approved RFQs:", err);
      setError(err.message || "Error loading approved RFQs");
    } finally {
      setLoadingApproved(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRFQs();
    fetchApprovedRFQs();
  }, [fetchPendingRFQs, fetchApprovedRFQs]); // Added dependencies

  // 🔹 Derived budget info
  const computedBudget = useMemo(() => {
    if (!budgetInfo || isAdmin) return null;
    return {
      departmentName: budgetInfo.department_name,
      budget: Number(budgetInfo.budget || 0),
      used: Number(budgetInfo.used || 0),
      remaining: Number(budgetInfo.remaining || 0),
    };
  }, [budgetInfo, isAdmin]);

  // 🔹 Approve / Reject RFQ 
  const handleDecision = async (rfq_id, decision) => {
    try {
      const { value: comments } = await Swal.fire({
        title: `${decision} RFQ #${rfq_id}`,
        input: "textarea",
        inputLabel: "Comments (optional)",
        inputPlaceholder: "Add any remarks for this decision...",
        showCancelButton: true,
        confirmButtonText: `Yes, ${decision}`,
        confirmButtonColor: decision === "Approved" ? "#16a34a" : "#dc2626",
        cancelButtonColor: "#6b7280",
        inputAttributes: {
          "aria-label": "Comments",
        },
      });

      if (comments === undefined) return; // cancelled

      const res = await fetch(
        `${API_BASE_URL}/approver/reviewRFQ/${rfq_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ decision, comments }),
        }
      );

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || `Failed to ${decision} RFQ`);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.msg || `RFQ ${rfq_id} ${decision} successfully.`,
        timer: 1800,
        showConfirmButton: false,
      });

      // Refresh both lists after a successful decision
      await fetchPendingRFQs();
      await fetchApprovedRFQs();

      // Clear the item map and dropdown state on successful decision
      setRfqItemsMap({});
      setOpenRfqId(null);

    } catch (err) {
      console.error("Decision error:", err);
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: err.message || "Please try again.",
      });
    }
  };

  // ⬇️ Fetch RFQ items when approver expands a row
  const fetchRfqItems = async (rfq_id) => {
    try {
      setLoadingItemsFor(rfq_id);
      const res = await fetch(
        `${API_BASE_URL}/approver/rfqItems/${rfq_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load RFQ items");

      setRfqItemsMap((prev) => ({
        ...prev,
        [rfq_id]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Error loading RFQ items:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load RFQ items.",
      });
    } finally {
      setLoadingItemsFor(null);
    }
  };

  // ⬇️ Toggle dropdown for a particular RFQ
  const handleToggleItems = async (rfq_id) => {
    if (openRfqId === rfq_id) {
      // collapse if already open
      setOpenRfqId(null);
      return;
    }

    setOpenRfqId(rfq_id);

    // If we haven't fetched items earlier, fetch them
    if (!rfqItemsMap[rfq_id]) {
      await fetchRfqItems(rfq_id);
    }
  };

  const isLoading = activeTab === "pending" ? loadingPending : loadingApproved;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-700" size={26} />
            {isAdmin ? "RFQ Oversight (Admin)" : "Approver Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "View and monitor RFQs across departments."
              : "Review RFQs from your department, check budget, and take actions."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>

      {/* Budget cards for Approver only */}
      {!isAdmin && computedBudget && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-50">
              <Building2 className="text-blue-700" size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Department
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {computedBudget.departmentName}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-amber-50">
              <Wallet className="text-amber-600" size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Budget Used
              </p>
              <p className="text-lg font-semibold text-amber-700">
                ₹{computedBudget.used.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Out of ₹{computedBudget.budget.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-emerald-50">
              <Wallet className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Remaining Budget
              </p>
              <p className="text-lg font-semibold text-emerald-700">
                ₹{computedBudget.remaining.toLocaleString()}
              </p>
              {computedBudget.budget > 0 && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {((computedBudget.remaining / computedBudget.budget) * 100).toFixed(1)}
                  % remaining
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${activeTab === "pending"
            ? "border-blue-600 text-blue-700"
            : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending RFQs ({pendingRFQs.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${activeTab === "approved"
            ? "border-emerald-600 text-emerald-700"
            : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          onClick={() => setActiveTab("approved")}
        >
          Approved RFQs ({approvedRFQs.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Loading RFQs...
          </div>
        ) : activeTab === "pending" ? (
          <RFQTable
            data={pendingRFQs}
            showActions={!isAdmin}
            onDecision={handleDecision}
            onToggleItems={handleToggleItems}
            rfqItemsMap={rfqItemsMap}
            openRfqId={openRfqId}
            loadingItemsFor={loadingItemsFor}
          />
        ) : (
          <RFQTable
            data={approvedRFQs}
            showActions={false}
            onToggleItems={handleToggleItems}
            rfqItemsMap={rfqItemsMap}
            openRfqId={openRfqId}
            loadingItemsFor={loadingItemsFor}
          />
        )}
      </div>
    </div>
  );
};

const RFQTable = ({
  data,
  showActions,
  onDecision,
  onToggleItems,
  rfqItemsMap,
  openRfqId,
  loadingItemsFor,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        {showActions
          ? "No pending RFQs available."
          : "No approved RFQs to display yet."}
      </div>
    );
  }

  // Number of columns depends on showActions
  const baseCols = 7; // ID, Title, Requestor, Dept, Created, Items, Status
  const totalCols = showActions ? baseCols + 1 : baseCols;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              RFQ ID
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Title
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Requestor
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Department
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Created At
            </th>
            {/* Column for items button */}
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Items
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
              Status
            </th>
            {showActions && (
              <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const isOpen = openRfqId === r.rfq_id;
            const items = rfqItemsMap[r.rfq_id] || [];

            // Helper function for status colors (local definition is fine here)
            const getStatusColorClass = (status) => {
              switch (status) {
                case "Approved":
                  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
                case "Rejected":
                  return "bg-red-50 text-red-700 border border-red-200";
                case "Open": // Assuming 'Open' is the primary status for Pending tab
                  return "bg-amber-50 text-amber-700 border border-amber-200";
                case "Closed":
                case "Cancelled": // Handle the new Cancelled status
                  return "bg-gray-100 text-gray-700 border border-gray-200";
                default:
                  return "bg-slate-50 text-slate-700 border border-slate-200";
              }
            };


            return (
              <React.Fragment key={r.rfq_id}>
                <tr className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-800 text-xs md:text-sm">
                    #{r.rfq_id}
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-xs md:text-sm">
                    <div className="font-medium text-slate-900">{r.title}</div>
                    {r.description && (
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" />
                      <span>{r.requestor_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{r.department_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-800 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </td>

                  {/* Items toggle button */}
                  <td className="px-3 py-2 text-xs md:text-sm">
                    <button
                      onClick={() => onToggleItems(r.rfq_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] md:text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                    >
                      <ChevronDown // Using Lucide icon here
                        size={14}
                        className={`text-slate-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                      {isOpen ? "Hide items" : "View items"}
                    </button>
                  </td>

                  <td className="px-3 py-2 text-xs md:text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColorClass(r.status)}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                      {r.status}
                    </span>
                  </td>

                  {showActions && (
                    <td className="px-3 py-2 text-center text-xs md:text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onDecision(r.rfq_id, "Approved")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] md:text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => onDecision(r.rfq_id, "Rejected")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] md:text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>

                {/* Expanded items row */}
                {isOpen && (
                  <tr className="bg-slate-50/60">
                    <td
                      colSpan={totalCols}
                      className="px-4 py-3 text-xs md:text-sm text-slate-700"
                    >
                      {loadingItemsFor === r.rfq_id ? (
                        <div className="text-slate-500 text-sm">
                          Loading items...
                        </div>
                      ) : items.length === 0 ? (
                        <div className="text-slate-500 text-sm">
                          No items found for this RFQ.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w  text-xs">
                            <thead>
                              <tr className="text-slate-500">
                                <th className="py-1 pr-2 text-left font-semibold">
                                  Item Name
                                </th>
                                <th className="py-1 pl-2 text-left font-semibold">
                                  Quantity
                                </th>
                                {/* <th className="py-1 pr-4 text-left font-semibold">
                                  Est. Unit Price (₹)
                                </th>
                                <th className="py-1 pr-4 text-left font-semibold">
                                  Est. Total (₹)
                                </th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((it, idx) => {
                                const qty = Number(it.quantity || 0);
                                const unit = Number(it.est_unit_price || 0);
                                const total = qty * unit;
                                return (
                                  <tr key={idx} className="text-slate-700 border-t border-slate-200/50">
                                    <td className="py-1 pr-2">
                                      {it.item_name}
                                    </td>
                                    <td className="py-1 pl-2">{qty}</td>
                                    {/* <td className="py-1 pr-4">
                                      {unit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td> */}
                                    {/* <td className="py-1 pr-4 font-semibold">
                                      {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td> */}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ApproverDashboard;