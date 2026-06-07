// src/pages/Offier/QuotationReview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FileText,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function QuotationReview() {
  const { rfq_id } = useParams();
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 For dropdown items
  const [quoteItemsMap, setQuoteItemsMap] = useState({});
  const [openQuoteId, setOpenQuoteId] = useState(null);
  const [loadingItemsFor, setLoadingItemsFor] = useState(null);

  const getToken = () => localStorage.getItem("authToken");

  // ✅ Fetch quotations for this RFQ
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/officer/quotations/${rfq_id}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        const data = await res.json();
        setQuotations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching quotations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [rfq_id]);

  // 🔹 Fetch quotation items when expanding dropdown
  const fetchQuoteItems = async (quote_id) => {
    try {
      setLoadingItemsFor(quote_id);
      const res = await fetch(
        `${API_BASE_URL}/officer/quotationItems/${quote_id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load items");

      setQuoteItemsMap((prev) => ({
        ...prev,
        [quote_id]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Error fetching quotation items:", err);
      Swal.fire(
        "Error",
        err.message || "Failed to load quotation items",
        "error"
      );
    } finally {
      setLoadingItemsFor(null);
    }
  };

  // 🔹 Toggle dropdown for one quotation
  const handleToggleItems = async (quote_id) => {
    if (openQuoteId === quote_id) {
      // collapse
      setOpenQuoteId(null);
      return;
    }

    setOpenQuoteId(quote_id);

    // If items not loaded yet → fetch them
    if (!quoteItemsMap[quote_id]) {
      await fetchQuoteItems(quote_id);
    }
  };

  // ✅ Approve selected quotation
  const handleApprove = async (quote_id) => {
    try {
      const result = await Swal.fire({
        title: "Approve this Quotation?",
        text: "This will generate a Purchase Order automatically.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2563EB",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, Approve",
      });
      if (!result.isConfirmed) return;

      const res = await fetch(
        `${API_BASE_URL}/officer/approveQuotation/${quote_id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      Swal.fire({
        icon: "success",
        title: "PO Generated!",
        text: `Purchase Order created successfully.\nPO Number: ${data.po_number}`,
        confirmButtonColor: "#2563EB",
      });

      // refresh list in UI
      setQuotations((prev) =>
        prev.map((q) =>
          q.quote_id === quote_id
            ? { ...q, status: "Accepted" }
            : { ...q, status: "Rejected" }
        )
      );
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to approve quotation", "error");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={36} />
        <p>Loading quotations...</p>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
          <FileText size={26} className="text-blue-700" />
          Quotations for RFQ #{rfq_id}
        </h2>
        <button
          onClick={() => navigate("/purchasing/dashboard")}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          ← Back
        </button>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          No quotations submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="p-3 border text-left">Vendor</th>
                <th className="p-3 border text-center">Total (₹)</th>
                <th className="p-3 border text-center">Delivery (Days)</th>
                <th className="p-3 border text-center">Items</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => {
                const isOpen = openQuoteId === q.quote_id;
                const items = quoteItemsMap[q.quote_id] || [];

                return (
                  <React.Fragment key={q.quote_id}>
                    <tr className="hover:bg-blue-50 transition-all duration-150">
                      <td className="p-3 border font-semibold text-gray-900">
                        {q.vendor_name}
                        <p className="text-xs text-gray-500">{q.email}</p>
                      </td>
                      <td className="p-3 border text-center font-medium">
                        ₹
                        {Number(q.total_price || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 border text-center">
                        {q.expected_delivery_days} days
                      </td>

                      {/* Items dropdown toggle */}
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleToggleItems(q.quote_id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                          {isOpen ? "Hide items" : "View items"}
                        </button>
                      </td>

                      <td className="p-3 border text-center">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            q.status === "Submitted"
                              ? "bg-blue-100 text-blue-700"
                              : q.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="p-3 border text-center">
                        {q.status === "Submitted" ? (
                          <button
                            onClick={() => handleApprove(q.quote_id)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
                          >
                            Approve
                          </button>
                        ) : q.status === "Accepted" ? (
                          <CheckCircle2
                            size={20}
                            className="text-green-600 inline-block"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded items row */}
                    {isOpen && (
                      <tr className="bg-blue-50/40">
                        <td
                          colSpan={6}
                          className="p-3 border-t text-xs md:text-sm"
                        >
                          {loadingItemsFor === q.quote_id ? (
                            <div className="text-gray-600">
                              Loading items...
                            </div>
                          ) : items.length === 0 ? (
                            <div className="text-gray-500">
                              No items found for this quotation.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="text-gray-600">
                                    <th className="py-1 pr-4 text-left font-semibold">
                                      Item Name
                                    </th>
                                    <th className="py-1 pr-4 text-right font-semibold">
                                      Quantity
                                    </th>
                                    <th className="py-1 pr-4 text-right font-semibold">
                                      Unit Price (₹)
                                    </th>
                                    <th className="py-1 pr-4 text-right font-semibold">
                                      Line Total (₹)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((it, idx) => {
                                    const qty = Number(it.quantity || 0);
                                    const unit = Number(
                                      it.quoted_unit_price || 0
                                    );
                                    const total = qty * unit;

                                    return (
                                      <tr
                                        key={idx}
                                        className="border-t border-gray-200 text-gray-800"
                                      >
                                        <td className="py-1 pr-4">
                                          {it.item_name}
                                        </td>
                                        <td className="py-1 pr-4 text-right">
                                          {qty}
                                        </td>
                                        <td className="py-1 pr-4 text-right">
                                          {unit.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                        <td className="py-1 pr-4 text-right font-semibold">
                                          {total.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
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
      )}
    </div>
  );
}
