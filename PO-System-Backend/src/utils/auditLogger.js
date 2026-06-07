import pool from "../db.js";

/**
 * Write audit log to database
 */
export async function logAudit(user_id, data = {}) {
  try {
    const {
      action,
      entityType,
      entityId,
      details,
      ip,
      userAgent
    } = data;

    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null,
        action,
        entityType,
        entityId || null,
        details ? JSON.stringify(details) : null,
        ip || null,
        userAgent || null
      ]
    );
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}

/**
 * Auto logs from req object
 */
export function logAuditFromReq(req, data) {
  const userId = req.user?.id || req.vendor?.id || null;

  return logAudit(userId, {
    ...data,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });
}
