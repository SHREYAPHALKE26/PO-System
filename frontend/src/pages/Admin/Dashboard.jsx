import React, { useEffect, useState } from "react";
import { BarChart3, FileText, Users, Wallet, Layers, Activity, Clock, CheckCircle, AlertCircle, UserPlus, FileTextIcon } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function AdminMainDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({});
  const [departments, setDepartments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      setOverview(data.overview);
      setDepartments(data.departments);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">Loading Admin Dashboard...</div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-3">
        <BarChart3 size={30} /> Admin Dashboard
      </h1>

      {/* ==========================================================================================
         TOP OVERVIEW SECTION
      =========================================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total RFQs" value={overview.totalRFQs} icon={<Layers />} color="blue" />
        <StatCard title="Vendors" value={overview.totalVendors} icon={<Users />} color="green" />
        <StatCard
          title="Purchase Orders"
          value={overview.totalPOs}
          icon={<FileText />}
          color="orange"
        />
        <StatCard
          title="Total Budget"
          value={`₹${overview.totalBudget?.toLocaleString()}`}
          icon={<Wallet />}
          color="purple"
        />
        <StatCard
          title="Used Budget"
          value={`₹${overview.usedBudget?.toLocaleString()}`}
          icon={<Wallet />}
          color="red"
        />
        <StatCard
          title="Remaining Budget"
          value={`₹${overview.remainingBudget?.toLocaleString()}`}
          icon={<Wallet />}
          color="teal"
        />
      </div>

      {/* ==========================================================================================
         DEPARTMENT PERFORMANCE TABLE
      =========================================================================================== */}
      <div className="bg-white rounded-xl shadow border mb-10">
        <h2 className="text-xl font-semibold p-4 border-b">Department Performance</h2>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border">Department</th>
              <th className="p-3 border">Budget</th>
              <th className="p-3 border">Used</th>
              <th className="p-3 border">Remaining</th>
              <th className="p-3 border">RFQs</th>
              <th className="p-3 border">POs</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((d) => (
              <tr key={d.department_id} className="hover:bg-gray-50">
                <td className="p-3 border font-medium">{d.name}</td>
                <td className="p-3 border">₹{d.budget.toLocaleString()}</td>
                <td className="p-3 border">₹{d.used.toLocaleString()}</td>
                <td className="p-3 border">₹{d.remaining.toLocaleString()}</td>
                <td className="p-3 border text-center">{d.rfqCount}</td>
                <td className="p-3 border text-center">{d.poCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==========================================================================================
         RECENT ACTIVITY SECTION
      =========================================================================================== */}
      <div className="bg-white rounded-xl shadow border">
        <h2 className="text-xl font-semibold p-4 border-b flex items-center gap-2">
          <Activity size={22} className="text-blue-900" /> Recent Activity
        </h2>

        <div className="p-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((log, idx) => (
                <ActivityItem key={idx} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================================
   REUSABLE CARD COMPONENT
=========================================================================================== */
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    teal: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4 border">
      <div className={`p-3 rounded-full ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

/* ==========================================================================================
   ACTIVITY ITEM COMPONENT
=========================================================================================== */
const ActivityItem = ({ log }) => {
  // Determine icon and color based on message type
  const getActivityIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("vendor") || msg.includes("created")) return <UserPlus size={18} />;
    if (msg.includes("purchase order") || msg.includes("po")) return <FileTextIcon size={18} />;
    if (msg.includes("approved") || msg.includes("success")) return <CheckCircle size={18} />;
    if (msg.includes("warning") || msg.includes("error")) return <AlertCircle size={18} />;
    return <Activity size={18} />;
  };

  const getActivityColor = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("approved") || msg.includes("success")) return "bg-green-100 text-green-700";
    if (msg.includes("warning") || msg.includes("error")) return "bg-red-100 text-red-700";
    if (msg.includes("created") || msg.includes("added")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  // Format timestamp
  const formatTime = (timeStr) => {
    if (!timeStr) return "Just now";
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border border-transparent hover:border-gray-200">
      {/* Icon */}
      <div className={`flex-shrink-0 p-2.5 rounded-full ${getActivityColor(log.message)}`}>
        {getActivityIcon(log.message)}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 break-words">
          {log.message || "Activity recorded"}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
          <Clock size={11} />
          <span className="text-xs">{formatTime(log.time)}</span>
        </div>
      </div>

      {/* Status Badge (optional) */}
      {log.status && (
        <div className="flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${log.status === "success" ? "bg-green-100 text-green-700" :
            log.status === "error" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
};
