import pool from "../db.js";

/**
 * Send notifications to multiple users
 */
export async function notifyUsers(userIds = [], { title, message, type = "info", link = null }) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  const rows = userIds.map(userId => [
    userId,
    title,
    message,
    type,
    link
  ]);

  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link) 
       VALUES ?`,
      [rows]
    );
  } catch (err) {
    console.error("Notification Error:", err);
  }
}

/**
 * Send notification to ONE user
 */
export function notifyUser(userId, payload) {
  return notifyUsers([userId], payload);
}
