import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  IdCard,
  ShieldCheck,
  Star,
  Lock,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

const VendorProfile = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneno: "",
    tax_id: "",
    rating: "",
    active: 1,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("vendorToken");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch(`${API_BASE_URL}/vendor/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to load profile");

      setProfile(data);
      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        phoneno: data.phoneno || "",
        tax_id: data.tax_id || "",
        rating: data.rating ?? "",
        active: data.active ?? 1,
      });
    } catch (err) {
      console.error("Profile load error:", err);
      alert(err.message || "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChangeField = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await fetch(`${API_BASE_URL}/vendor/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          phoneno: profileForm.phoneno,
          tax_id: profileForm.tax_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update profile");

      alert(data.msg || "Profile updated successfully");
      fetchProfile();
    } catch (err) {
      console.error("Save profile error:", err);
      alert(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    try {
      setChangingPassword(true);
      const res = await fetch(`${API_BASE_URL}/vendor/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to change password");

      alert(data.msg || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password error:", err);
      alert(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-900" size={40} />
        <p className="mt-3 text-gray-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-gray-600 font-medium">Profile not found.</p>
        <button
          onClick={() => navigate("/vendor/dashboard")}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-screen  bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-900" size={22} />
                Vendor Profile
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                View and update your basic details and password.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <ShieldCheck size={14} />
              Vendor Access
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-blue-900 text-white flex items-center justify-center text-lg font-semibold">
                {profileForm.name
                  ? profileForm.name.charAt(0).toUpperCase()
                  : "V"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <p className="text-xs text-gray-500">
                  Keep your contact information up to date.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                Rating:{" "}
                <span className="font-semibold text-gray-800">
                  {profileForm.rating || "N/A"}
                </span>
              </span>
              <span className="mt-1">
                Status:{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    profileForm.active
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {profileForm.active ? "Active" : "Inactive"}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User size={16} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email (login ID)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail size={16} className="text-gray-400" />
                </span>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Email is used as your login username. Contact admin to change.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Phone size={16} className="text-gray-400" />
                </span>
                <input
                  type="tel"
                  name="phoneno"
                  value={profileForm.phoneno || ""}
                  onChange={handleProfileChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tax ID / GST
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <IdCard size={16} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  name="tax_id"
                  value={profileForm.tax_id || ""}
                  onChange={handleProfileChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  placeholder="Enter tax / GST number"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingProfile && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock size={18} className="text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>
              <p className="text-xs text-gray-500">
                Use a strong password to keep your account secure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChangeField}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChangeField}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChangeField}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={changePassword}
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {changingPassword && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
