// src/components/NotificationBell.jsx
import React, { useEffect, useState, useRef } from "react";
import { Bell, Check } from "lucide-react";
import Swal from "sweetalert2";

const API_BASE_URL = "http://127.0.0.1:3000";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Detect vendor or user login
  const getToken = () =>
    localStorage.getItem("authToken") ||
    localStorage.getItem("vendorToken");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/my`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleClickNotification = async (n) => {
    if (!n.is_read) {
      await fetch(`${API_BASE_URL}/notifications/mark-read/${n.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    }

    if (n.link) window.location.href = n.link;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 transition"
      >
        <Bell size={20} className="text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          <div className="px-3 py-2 flex justify-between items-center border-b">
            <span className="text-xs font-semibold text-slate-600">Notifications</span>

            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`px-3 py-2.5 text-xs cursor-pointer border-b hover:bg-slate-50 ${
                    n.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
