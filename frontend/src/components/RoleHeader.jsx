import React from "react";

export default function RoleHeader({ title, onLogout }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onLogout}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
