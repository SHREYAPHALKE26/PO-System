// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { User, Mail, Shield, Lock, Save, RefreshCw, Building2 } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const getToken = () => localStorage.getItem("authToken");

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      Swal.fire({
        icon: "warning",
        title: "Session expired",
        text: "Please log in again.",
        confirmButtonColor: "#1E3A8A",
      }).then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roles");
        window.location.href = "/login";
      });
      return true;
    }
    return false;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) {
        handleAuthError(401);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load profile");

      setProfile(data);
      setUsername(data.username || "");
      setEmail(data.email || "");
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      if (!username.trim() || !email.trim()) {
        Swal.fire("Validation", "Username and email are required.", "warning");
        return;
      }

      setSavingProfile(true);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/profile/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update profile");

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: data.msg || "Your profile has been updated.",
        timer: 1800,
        showConfirmButton: false,
      });

      // refresh profile
      fetchProfile();
    } catch (err) {
      Swal.fire("Error", err.message || "Unable to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        Swal.fire("Validation", "All password fields are required.", "warning");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        Swal.fire("Validation", "New password and confirmation do not match.", "warning");
        return;
      }
      if (newPassword.length < 6) {
        Swal.fire("Validation", "New password should be at least 6 characters.", "warning");
        return;
      }

      setChangingPassword(true);
      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/profile/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (handleAuthError(res.status)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to change password");

      Swal.fire({
        icon: "success",
        title: "Password changed",
        text: data.msg || "Your password has been updated.",
        timer: 1800,
        showConfirmButton: false,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      Swal.fire("Error", err.message || "Unable to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-6 md:px-10"
      style={{ fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif" }}
    >
      <style>{`
        .card {
          background: #FFFFFF;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.03);
        }
        .card-header {
          border-bottom: 1px solid #E5E7EB;
        }
        .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6B7280;
          font-weight: 600;
        }
        .input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          padding: 10px 12px;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition: all 0.15s ease;
          background: #F9FAFB;
        }
        .input:focus {
          background: #FFFFFF;
          border-color: #1D4ED8;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
        }
        .btn-primary {
          background: #1D4ED8;
          color: #FFFFFF;
          border-radius: 999px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-primary:hover {
          background: #1E40AF;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
          transform: translateY(-1px);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 999px;
          border: 1px solid #DBEAFE;
          background: #EFF6FF;
          color: #1D4ED8;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center gap-2">
            <User className="text-blue-700" size={24} />
            Profile
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage your account, security and department information.
          </p>
        </div>

        {profile && (
          <div className="text-right text-xs md:text-sm text-slate-600">
            <div className="font-medium text-slate-800">
              Welcome, {profile.username}
            </div>
            <div className="flex flex-wrap justify-end gap-1 mt-1">
              {profile.roles &&
                profile.roles.map((role) => (
                  <span key={role} className="role-badge">
                    <Shield size={12} />
                    {role}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account Info */}
        <div className="card lg:col-span-2">
          <div className="card-header px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-blue-700" />
                Account Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Update your basic profile information.
              </p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Department</label>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-700">
                <Building2 size={14} className="text-slate-400" />
                <span>
                  {profile?.department_name
                    ? profile.department_name
                    : "Not Assigned"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                className="btn-primary"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Password */}
        <div className="card">
          <div className="card-header px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock size={18} className="text-amber-600" />
              Change Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Use a strong password to keep your account secure.
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input mt-1"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input mt-1"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                className="btn-primary"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
