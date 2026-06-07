// src/controllers/vendorController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";
import { logAuditFromReq } from "../utils/auditLogger.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * 🧩 Register Vendor (Admin)
 * If password left blank → email used as password
 */
export async function registerVendor(req, res) {
  try {
    const { name, email, phoneno, tax_id, rating, active, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ msg: "Name and Email are required" });
    }

    const [exists] = await pool.query("SELECT * FROM vendor WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ msg: "Vendor with this email already exists" });
    }

    // Default password = email
    const plainPassword = password && password.trim() !== "" ? password : email;
    const password_hash = await bcrypt.hash(plainPassword, 10);

    const [result] = await pool.query(
      `INSERT INTO vendor (name, email, password_hash, phoneno, tax_id, rating, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, phoneno || null, tax_id || null, rating || 4.0, active ?? 1]
    );

    const vendor = {
      vendor_id: result.insertId,
      name,
      email,
      phoneno,
      tax_id,
      rating: rating || 4.0,
      active: active ?? 1,
      generated_password: password ? null : plainPassword,
    };

    return res.status(201).json({
      msg: "Vendor registered successfully",
      vendor,
    });
  } catch (err) {
    console.error("Register Vendor Error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 🔑 Vendor Login
 */
export async function vendorLogin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const [vendors] = await pool.query("SELECT * FROM vendor WHERE email = ?", [email]);
    if (vendors.length === 0) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const vendor = vendors[0];

    const isMatch = await bcrypt.compare(password, vendor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: vendor.vendor_id,
        email: vendor.email,
        name: vendor.name,
        role: "Vendor",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({
      msg: "Vendor login successful",
      token,
      vendor: {
        vendor_id: vendor.vendor_id,
        name: vendor.name,
        email: vendor.email,
        active: vendor.active,
        rating: vendor.rating,
      },
    });
  } catch (err) {
    console.error("Vendor Login Error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

/**
 * 📋 Get All Vendors (Admin)
 */
export async function getAllVendors(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT vendor_id, name, email, phoneno, tax_id, rating, active, created_at
       FROM vendor ORDER BY vendor_id DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Get Vendors Error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * ✏️ Update Vendor (Admin or Vendor Self)
 */
export async function updateVendor(req, res) {
  try {
    const { vendor_id } = req.params;
    const { name, email, phoneno, password, tax_id, rating, active } = req.body;

    const [rows] = await pool.query("SELECT * FROM vendor WHERE vendor_id = ?", [vendor_id]);
    if (rows.length === 0) return res.status(404).json({ msg: "Vendor not found" });

    const vendor = rows[0];
    let newPasswordHash = vendor.password_hash;

    if (password && password.trim() !== "") {
      newPasswordHash = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `UPDATE vendor
       SET name = ?, email = ?, password_hash = ?, phoneno = ?, tax_id = ?, rating = ?, active = ?
       WHERE vendor_id = ?`,
      [
        name || vendor.name,
        email || vendor.email,
        newPasswordHash,
        phoneno || vendor.phoneno,
        tax_id || vendor.tax_id,
        rating ?? vendor.rating,
        active ?? vendor.active,
        vendor_id,
      ]
    );

    return res.status(200).json({ msg: "Vendor updated successfully" });
  } catch (err) {
    console.error("Update Vendor Error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * ❌ Delete Vendor (Admin)
 */
export async function deleteVendor(req, res) {
  try {
    const { vendor_id } = req.params;

    const [exists] = await pool.query("SELECT * FROM vendor WHERE vendor_id = ?", [vendor_id]);
    if (exists.length === 0) return res.status(404).json({ msg: "Vendor not found" });

    await pool.query("DELETE FROM vendor WHERE vendor_id = ?", [vendor_id]);
    return res.status(200).json({ msg: "Vendor deleted successfully" });
  } catch (err) {
    console.error("Delete Vendor Error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 📥 Vendor: get assigned RFQs
 */
// export async function getAssignedRFQs(req, res) {
//   try {
//     const vendorId = req.vendor?.id;

//     if (!vendorId) {
//       console.warn("⚠️ Vendor ID missing in req.vendor:", req.vendor);
//       return res.status(403).json({ msg: "Vendor not authenticated" });
//     }

//     const [rows] = await pool.query(
//       `
//       SELECT 
//         r.rfq_id,
//         r.title,
//         r.description,
//         r.status AS rfq_status,
//         d.name AS department_name,
//         u.username AS requestor_name,
//         rv.status AS assignment_status,
//         rv.created_at AS assigned_at
//       FROM rfq_vendors rv
//       JOIN rfqs r ON rv.rfq_id = r.rfq_id
//       JOIN departments d ON r.department_id = d.department_id
//       JOIN users u ON r.created_by = u.user_id
//       JOIN vendor v ON rv.vendor_id = v.vendor_id
//       WHERE rv.vendor_id = ?
//            AND rv.status = 'Assigned'
//       ORDER BY rv.created_at DESC
//       `,
//       [vendorId]
//     );

//     if (rows.length === 0) {
//       return res.status(200).json([]);
//     }

//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching assigned RFQs:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// }
export async function getAssignedRFQs(req, res) {
  try {
    const vendorId = req.vendor?.id;

    if (!vendorId) {
      return res.status(403).json({ msg: "Vendor not authenticated" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        r.rfq_id,
        r.title,
        r.description,
        r.status AS rfq_status,
        d.name AS department_name,
        u.username AS requestor_name,
        rv.status AS assignment_status,
        rv.created_at AS assigned_at
      FROM rfq_vendors rv
      JOIN rfqs r ON rv.rfq_id = r.rfq_id
      JOIN departments d ON r.department_id = d.department_id
      JOIN users u ON r.created_by = u.user_id
      WHERE rv.vendor_id = ?
        AND rv.status = 'Assigned'     -- 🔥 ONLY SHOW ASSIGNED RFQ
      ORDER BY rv.created_at DESC
      `,
      [vendorId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching assigned RFQs:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


/**
 * ✅ Vendor submits quotation for assigned RFQ
 */
export async function submitQuotation(req, res) {
  const conn = await pool.getConnection();
  try {
    const vendorId = req.vendor?.id;
    const { rfq_id, total_price, expected_delivery_days, remarks, items } = req.body;

    if (!rfq_id || !vendorId || !items || items.length === 0) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    await conn.beginTransaction();

    const [quoteResult] = await conn.query(
      `INSERT INTO rfq_quotes (rfq_id, vendor_id, total_price, expected_delivery_days, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [rfq_id, vendorId, total_price, expected_delivery_days || 0, remarks || null]
    );

    const quote_id = quoteResult.insertId;

    const quoteItems = items.map((i) => [
      quote_id,
      i.item_name,
      i.quantity,
      i.quoted_unit_price,
    ]);

    await conn.query(
      `INSERT INTO rfq_quote_items (quote_id, item_name, quantity, quoted_unit_price)
       VALUES ?`,
      [quoteItems]
    );

    await conn.query(
      `UPDATE rfq_vendors 
   SET status = 'Quoted' 
   WHERE rfq_id = ? AND vendor_id = ?`,
      [rfq_id, vendorId]
    );


    // await logAuditFromReq(req, {
    //   action: "QUOTE_SUBMITTED",
    //   entityType: "QUOTE",
    //   entityId: quote_id,
    //   details: { rfq_id }
    // });

    // await notifyUsers([officer_id], {
    //   title: "Quotation Submitted",
    //   message: `Vendor submitted quotation for RFQ #${rfq_id}.`,
    //   type: "info",
    //   link: `/officer/quotation/${rfq_id}`
    // });

    await conn.commit();

    await logAuditFromReq(req, {
      action: "QUOTE_SUBMITTED",
      entityType: "QUOTE",
      entityId: quote_id,
      details: {
        rfq_id,
        total_price,
        expected_delivery_days,
        items_count: items.length,
      },
    });

     

    res.status(201).json({
      msg: "Quotation submitted successfully",
      quote_id,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error submitting quotation:", err);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    conn.release();
  }
}

/**
 * ✅ Fetch all quotations submitted by a vendor + PO info
 */
export async function getVendorQuotations(req, res) {
  try {
    const vendorId = req.vendor?.id;

    if (!vendorId) {
      return res.status(403).json({ msg: "Vendor not authenticated" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        q.quote_id,
        q.rfq_id,
        r.title AS rfq_title,
        q.total_price,
        q.expected_delivery_days,
        q.status,
        q.submitted_at,
        po.po_id,
        po.po_number,
        po.status AS po_status
      FROM rfq_quotes q
      JOIN rfqs r ON q.rfq_id = r.rfq_id
      LEFT JOIN purchase_orders po 
        ON po.quote_id = q.quote_id
      WHERE q.vendor_id = ?
      ORDER BY q.submitted_at DESC
      `,
      [vendorId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching vendor quotations:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/* -------------------------------------------------
   🧑‍💻 VENDOR PROFILE ENDPOINTS
--------------------------------------------------*/

/**
 * 👤 Get current vendor profile
 * GET /vendor/me
 */
export async function getVendorProfile(req, res) {
  try {
    const vendorId = req.vendor?.id;
    if (!vendorId) {
      return res.status(403).json({ msg: "Vendor not authenticated" });
    }

    const [[vendor]] = await pool.query(
      `
      SELECT 
        vendor_id,
        name,
        email,
        phoneno,
        tax_id,
        rating,
        active,
        created_at
      FROM vendor
      WHERE vendor_id = ?
      `,
      [vendorId]
    );

    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    res.status(200).json(vendor);
  } catch (err) {
    console.error("Error fetching vendor profile:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


/**
 * ✏️ Update current vendor profile
 * PUT /vendor/me
 * Allowed fields: name, phoneno, tax_id (email kept read-only for safety, but you can allow it)
 */
export async function updateVendorProfile(req, res) {
  try {
    const vendorId = req.vendor?.id;
    if (!vendorId) {
      return res.status(403).json({ msg: "Vendor not authenticated" });
    }

    const { name, phoneno, tax_id } = req.body;

    const [[vendor]] = await pool.query(
      "SELECT vendor_id, name, phoneno, tax_id FROM vendor WHERE vendor_id = ?",
      [vendorId]
    );

    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    await pool.query(
      `
      UPDATE vendor
      SET name = ?, phoneno = ?, tax_id = ?
      WHERE vendor_id = ?
      `,
      [
        name || vendor.name,
        phoneno || vendor.phoneno,
        tax_id || vendor.tax_id,
        vendorId,
      ]
    );

    res.status(200).json({ msg: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating vendor profile:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 🔐 Change vendor password
 * POST /vendor/change-password
 * body: { currentPassword, newPassword, confirmPassword }
 */
export async function changeVendorPassword(req, res) {
  try {
    const vendorId = req.vendor?.id;
    if (!vendorId) {
      return res.status(403).json({ msg: "Vendor not authenticated" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ msg: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "New password and confirm password do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "New password must be at least 6 characters long" });
    }

    const [[vendor]] = await pool.query(
      "SELECT vendor_id, password_hash FROM vendor WHERE vendor_id = ?",
      [vendorId]
    );
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, vendor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ msg: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE vendor SET password_hash = ? WHERE vendor_id = ?",
      [newHash, vendorId]
    );

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing vendor password:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
