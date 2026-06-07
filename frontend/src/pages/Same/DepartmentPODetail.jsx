// src/pages/Shared/DepartmentPODetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building2,
  User,
  CalendarDays,
  Wallet,
  List as ListIcon,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function DepartmentPODetail() {
  const { po_id } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("authToken");

  const fetchPODetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/po/${po_id}/detail`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load PO detail");

      setPo(data.po);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error loading PO detail:", err);
      setError(err.message || "Error loading PO detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Loading Purchase Order...</p>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 mb-4 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-red-700">
          {error || "PO not found or access denied."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 mb-2 border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-700" />
            Purchase Order #{po.po_number}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            RFQ #{po.rfq_id} – {po.rfq_title}
          </p>
        </div>

        <div className="text-right">
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
          <div className="mt-2 flex items-center justify-end gap-1 text-xs text-slate-500">
            <CalendarDays size={14} />
            {po.created_at
              ? new Date(po.created_at).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Vendor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-50">
            <User className="text-blue-700" size={20} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500 font-medium">
              Vendor
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {po.vendor_name}
            </p>
            <p className="text-xs text-slate-500">{po.vendor_email}</p>
          </div>
        </div>

        {/* Department */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="p-2 rounded-full bg-emerald-50">
            <Building2 className="text-emerald-700" size={20} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500 font-medium">
              Department
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {po.department_name}
            </p>
            <p className="text-xs text-slate-500">
              Requestor: {po.requestor_name} ({po.requestor_email})
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-50">
            <Wallet className="text-amber-700" size={20} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500 font-medium">
              Total Amount
            </p>
            <p className="text-lg font-semibold text-slate-900">
              ₹{Number(po.total_amount).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* RFQ Description */}
      {po.rfq_description && (
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <FileText size={16} className="text-blue-700" />
            RFQ Description
          </h3>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {po.rfq_description}
          </p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <ListIcon size={18} className="text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-900">
            PO Items ({items.length})
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-sm text-slate-500 text-center">
            No items found for this PO.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Item
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-600 uppercase">
                    Quantity
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-600 uppercase">
                    Unit Price
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-600 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.po_item_id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-3 text-slate-900">{it.item_name}</td>
                    <td className="p-3 text-right text-slate-800">
                      {it.quantity}
                    </td>
                    <td className="p-3 text-right text-slate-800">
                      ₹{Number(it.unit_price).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900">
                      ₹{Number(it.subtotal).toLocaleString()}
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
