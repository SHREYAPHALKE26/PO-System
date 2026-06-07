// src/pages/Auth/Login.jsx (your existing App component)
import React, { useState, useEffect } from "react";

const App = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const linkClass =
    "text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline cursor-pointer";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    if (token && roles.length > 0) {
      if (roles.includes("Admin")) window.location.href = "/admin/dashboard";
      else if (roles.includes("Requestor")) window.location.href = "/purchase-orders";
      else if (roles.includes("Vendor")) window.location.href = "/vendors";
      else if (roles.includes("PurchasingOfficer")) window.location.href = "/officer/";
      // else window.location.href = "/unauthorized";
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const MAX_RETRIES = 3;
    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      try {
        const res = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
          success = true;
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("roles", JSON.stringify(data.roles));

          if (onLogin) onLogin(data.token, data.roles);

          // Wait a moment for state to update before redirecting
          setTimeout(() => {
            if (data.roles.includes("Admin")) window.location.href = "/";
            else if (data.roles.includes("Requestor"))
              window.location.href = "/requestor/dashboard";
            else if (data.roles.includes("Approver"))
              window.location.href = "/approver/dashboard";
            else if (data.roles.includes("PurchasingOfficer"))
              window.location.href = "/officer/dashboard";
            else window.location.href = "/";
          }, 100);
        } else if ([400, 401, 403].includes(res.status)) {
          success = true;
          setMessage("❌ " + (data.msg || "Invalid credentials"));
        } else {
          throw new Error(`Server status ${res.status}`);
        }
      } catch (err) {
        attempt++;
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          setMessage(
            "⚠️ Server error: Could not connect or login after multiple attempts. " +
            err.message
          );
          break;
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white font-['Inter']">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-blue-800 mb-8 text-center tracking-tight">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 text-base text-gray-800 bg-gray-100 border border-gray-300 rounded-lg transition-all duration-200 outline-none placeholder-gray-500
                       focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 text-base text-gray-800 bg-gray-100 border border-gray-300 rounded-lg transition-all duration-200 outline-none placeholder-gray-500
                       focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10"
          />

          {/* 👉 Forgot password link */}
          <div className="flex justify-end -mt-2 mb-1">
            <span
              className={linkClass}
              onClick={() => (window.location.href = "/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-lg font-medium text-white rounded-lg transition-all duration-200 mt-2 shadow-md
              ${isLoading
                ? "bg-gray-500 cursor-not-allowed opacity-60"
                : "bg-blue-800 hover:bg-blue-900 active:bg-blue-700 hover:shadow-lg transform active:scale-[0.99]"
              }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 p-3 text-sm font-medium text-center rounded-lg transition-all duration-300
            ${message.startsWith("❌")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
              }`}
          >
            {message}
          </p>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            className={linkClass}
            onClick={() => (window.location.href = "/register")}
          >
            Register here
          </span>
        </div>

        <div className="mt-4 pt-4 text-center text-sm text-gray-500 border-t border-gray-200">
          Vendor Login{" "}
          <span
            className={linkClass}
            onClick={() => (window.location.href = "/vendor/login")}
          >
            Vendor
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
