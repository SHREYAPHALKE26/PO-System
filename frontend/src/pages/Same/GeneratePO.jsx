import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import API from "../services/api.js";
// import "../styles/form.css";

const GeneratePO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    vendor_id: "",
    delivery_date: "",
    payment_terms: "",
  });
  const [message, setMessage] = useState("");


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  };

  if (!request) return <p>Loading request details...</p>;

  return (
    <div className="generate-po-container">
      <h1>🧾 Generate Purchase Order for #{request.request_id}</h1>

      <div className="po-details">
        <p><b>Item:</b> {request.item_name}</p>
        <p><b>Quantity:</b> {request.quantity}</p>
        <p><b>Purpose:</b> {request.purpose}</p>
        <p><b>Budget:</b> {request.budget_head}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Vendor</label>
        <select name="vendor_id" value={form.vendor_id} onChange={handleChange} required>
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
          ))}
        </select>

        <label>Delivery Date</label>
        <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} required />

        <label>Payment Terms</label>
        <input type="text" name="payment_terms" placeholder="e.g. Net 30 days" value={form.payment_terms} onChange={handleChange} />

        <button type="submit" className="btn-primary">Create Purchase Order</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default GeneratePO;
