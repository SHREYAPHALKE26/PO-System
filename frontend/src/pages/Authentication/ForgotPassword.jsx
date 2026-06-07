import React, { useState } from "react";

const API_BASE_URL = "http://localhost:3000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // "info" | "error"
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setType("info");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setType("error");
        setMessage(data.msg || "Something went wrong.");
      } else {
        setType("info");
        setMessage(
          data.msg ||
            "If this email exists, a password reset link has been sent."
        );
      }
    } catch (err) {
      setType("error");
      setMessage("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const linkClass =
    "text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline cursor-pointer";

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white font-['Inter']">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-blue-800 mb-3 text-center tracking-tight">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your registered email and we’ll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-base text-gray-800 bg-gray-100 border border-gray-300 rounded-lg transition-all duration-200 outline-none placeholder-gray-500
                       focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg font-medium text-white rounded-lg transition-all duration-200 mt-2 shadow-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed opacity-60"
                : "bg-blue-800 hover:bg-blue-900 active:bg-blue-700 hover:shadow-lg transform active:scale-[0.99]"
            }`}
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 p-3 text-sm font-medium text-center rounded-lg ${
              type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <span
            className={linkClass}
            onClick={() => (window.location.href = "/login")}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
