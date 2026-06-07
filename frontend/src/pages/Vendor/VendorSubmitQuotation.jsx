// src/pages/Vendor/VendorSubmitQuotation.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  FileText,
  Calendar,
  MessageSquare,
  Package,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function VendorSubmitQuotation() {
  const { rfq_id } = useParams();
  const navigate = useNavigate();

  const [rfqDetails, setRfqDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("vendorToken");

  useEffect(() => {
    const fetchRFQDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/rfq/${rfq_id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to load RFQ details");

        setRfqDetails(data);
        setItems(
          (data.items || []).map((item) => ({
            ...item,
            quoted_unit_price: "",
          }))
        );
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRFQDetails();
  }, [rfq_id]);

  const calculateTotal = () =>
    items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.quoted_unit_price) || 0;
      return sum + qty * price;
    }, 0);

  const handleSubmitQuotation = async () => {
    try {
      if (!deliveryDays || !remarks) {
        Swal.fire("Missing Fields", "Please fill all required fields.", "warning");
        return;
      }

      const missingPrice = items.some(
        (item) =>
          !item.quoted_unit_price || Number(item.quoted_unit_price) <= 0
      );
      if (missingPrice) {
        Swal.fire(
          "Missing Price",
          "Please enter a valid unit price (greater than 0) for all items.",
          "warning"
        );
        return;
      }

      const total_price = calculateTotal();

      const res = await fetch(`${API_BASE_URL}/vendor/submitQuotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          rfq_id: parseInt(rfq_id),
          total_price,
          expected_delivery_days: parseInt(deliveryDays),
          remarks,
          items: items.map((i) => ({
            item_name: i.item_name,
            quantity: i.quantity,
            quoted_unit_price: parseFloat(i.quoted_unit_price),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error submitting quotation");

      Swal.fire({
        icon: "success",
        title: "Quotation Submitted! 🎉",
        text: `Your quotation for RFQ ${rfq_id} has been successfully sent.`,
        timer: 1800,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 1800);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
      });
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          fontFamily: "'Inter', 'Poppins', sans-serif",
          background: "linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)",
        }}
      >
        <div
          className="flex flex-col items-center gap-4 p-8 rounded-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 8px 32px rgba(30, 58, 138, 0.08)",
          }}
        >
          <Loader2
            className="animate-spin"
            size={48}
            style={{ color: "#1E3A8A" }}
          />
          <p
            className="font-semibold text-lg"
            style={{ color: "#212121" }}
          >
            Loading RFQ Details
          </p>
          <p className="text-sm" style={{ color: "#9E9E9E" }}>
            Please wait while we fetch the information...
          </p>
        </div>
      </div>
    );
  }

  if (!rfqDetails) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          fontFamily: "'Inter', 'Poppins', sans-serif",
          background: "linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)",
        }}
      >
        <div
          className="text-center p-8 rounded-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 8px 32px rgba(30, 58, 138, 0.08)",
          }}
        >
          <FileText
            size={48}
            style={{ color: "#9E9E9E", margin: "0 auto 16px" }}
          />
          <p className="text-lg font-medium" style={{ color: "#212121" }}>
            No RFQ Details Found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', 'Poppins', sans-serif",
        background: "linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
          boxShadow: "0 2px 12px rgba(30, 58, 138, 0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
              style={{
                background:
                  "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
                color: "#FFFFFF",
                boxShadow: "0 2px 12px rgba(30, 58, 138, 0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(30, 58, 138, 0.35)";
                e.currentTarget.style.transform =
                  "translateX(-2px) translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 12px rgba(30, 58, 138, 0.25)";
                e.currentTarget.style.transform =
                  "translateX(0) translateY(0)";
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div
              className="px-3 py-1.5 rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: "#F5F5F5",
                color: "#1E3A8A",
                border: "1px solid #E0E0E0",
              }}
            >
              RFQ #{rfq_id}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div
          className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            boxShadow: "0 8px 40px rgba(30, 58, 138, 0.08)",
            border: "1px solid rgba(224, 224, 224, 0.6)",
          }}
        >
          {/* Title */}
          <div
            className="p-6"
            style={{
              background:
                "linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)",
              borderBottom: "2px solid #E0E0E0",
            }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: "#1E3A8A",
                  boxShadow: "0 2px 8px rgba(30, 58, 138, 0.2)",
                }}
              >
                <FileText size={20} style={{ color: "#FFFFFF" }} />
              </div>
              <div className="flex-1">
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: "#1E3A8A" }}
                >
                  Submit Quotation
                </h2>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#212121" }}
                >
                  {rfqDetails.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "#616161", fontSize: "14px" }}
                >
                  {rfqDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} style={{ color: "#1E3A8A" }} />
              <h4
                className="text-lg font-bold"
                style={{ color: "#212121" }}
              >
                Items & Pricing
              </h4>
            </div>

            <div
              className="overflow-x-auto rounded-lg border"
              style={{ borderColor: "#E0E0E0" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
                    }}
                  >
                    <th
                      className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide"
                      style={{ color: "#FFFFFF" }}
                    >
                      Item Name
                    </th>
                    <th
                      className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wide"
                      style={{ color: "#FFFFFF" }}
                    >
                      Qty
                    </th>
                    <th
                      className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide"
                      style={{ color: "#FFFFFF" }}
                    >
                      Unit Price (₹)
                    </th>
                    <th
                      className="px-4 py-3 text-right font-bold text-xs uppercase tracking-wide"
                      style={{ color: "#FFFFFF" }}
                    >
                      Total (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="transition-all duration-200 hover:bg-blue-50"
                      style={{
                        borderBottom: "1px solid #F5F5F5",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "#212121" }}
                      >
                        {item.item_name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block px-2 py-1 rounded text-xs font-bold"
                          style={{
                            backgroundColor: "#F5F5F5",
                            color: "#1E3A8A",
                          }}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold"
                            style={{ color: "#9E9E9E" }}
                          >
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="rounded-lg pl-8 pr-3 py-2 w-full transition-all duration-200 focus:ring-0 focus:outline-none font-semibold text-sm"
                            style={{
                              border: "2px solid #E0E0E0",
                              color: "#212121",
                              backgroundColor: "#FFFFFF",
                            }}
                            value={item.quoted_unit_price}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, quoted_unit_price: val }
                                    : it
                                )
                              );
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#1E3A8A";
                              e.target.style.boxShadow =
                                "0 0 0 3px rgba(30, 58, 138, 0.1)";
                              e.target.style.backgroundColor = "#F5F7FA";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#E0E0E0";
                              e.target.style.boxShadow = "none";
                              e.target.style.backgroundColor = "#FFFFFF";
                            }}
                          />
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-right text-sm font-bold"
                        style={{ color: "#1E3A8A" }}
                      >
                        ₹
                        {(
                          (item.quantity || 0) *
                          (Number(item.quoted_unit_price) || 0)
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="px-6 py-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 font-semibold mb-2 text-sm"
                  style={{ color: "#212121" }}
                >
                  <Calendar size={16} style={{ color: "#1E3A8A" }} />
                  Expected Delivery Days
                  <span style={{ color: "#C62828" }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter number of days"
                  className="rounded-lg px-4 py-2.5 w-full transition-all duration-200 focus:ring-0 focus:outline-none font-medium text-sm"
                  style={{
                    border: "2px solid #E0E0E0",
                    color: "#212121",
                    backgroundColor: "#FFFFFF",
                  }}
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1E3A8A";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(30, 58, 138, 0.1)";
                    e.target.style.backgroundColor = "#F5F7FA";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E0E0E0";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "#FFFFFF";
                  }}
                />
              </div>
              <div>
                <label
                  className="flex items-center gap-2 font-semibold mb-2 text-sm"
                  style={{ color: "#212121" }}
                >
                  <MessageSquare size={16} style={{ color: "#1E3A8A" }} />
                  Remarks
                  <span style={{ color: "#C62828" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Warranty terms, special conditions"
                  className="rounded-lg px-4 py-2.5 w-full transition-all duration-200 focus:ring-0 focus:outline-none font-medium text-sm"
                  style={{
                    border: "2px solid #E0E0E0",
                    color: "#212121",
                    backgroundColor: "#FFFFFF",
                  }}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1E3A8A";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(30, 58, 138, 0.1)";
                    e.target.style.backgroundColor = "#F5F7FA";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E0E0E0";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "#FFFFFF";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Total & Submit */}
          <div
            className="px-6 py-6"
            style={{
              background:
                "linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)",
              borderTop: "2px solid #E0E0E0",
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div
                className="p-4 rounded-lg flex-1 w-full md:w-auto"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #1E3A8A",
                  boxShadow: "0 2px 8px rgba(30, 58, 138, 0.1)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-1 uppercase tracking-wide"
                  style={{ color: "#9E9E9E" }}
                >
                  Grand Total (INR)
                </p>
                <h3
                  className="text-3xl font-bold"
                  style={{ color: "#1E3A8A" }}
                >
                  ₹
                  {calculateTotal().toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>

              <button
                onClick={handleSubmitQuotation}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all duration-300 whitespace-nowrap text-base"
                style={{
                  background:
                    "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(30, 58, 138, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(30, 58, 138, 0.4)";
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(30, 58, 138, 0.3)";
                  e.currentTarget.style.transform =
                    "translateY(0) scale(1)";
                }}
              >
                <CheckCircle size={20} />
                Submit Quotation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
