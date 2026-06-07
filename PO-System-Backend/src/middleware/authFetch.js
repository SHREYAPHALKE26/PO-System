// src/utils/authFetch.js

// 🔹 Normal PO-system users (Admin / Requestor / Approver / Purchasing Officer)
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const response = await fetch(url, { ...options, headers });

  // If token is missing/expired/invalid → force logout + redirect
  if (response.status === 401 || response.status === 403) {
    // Clear session
    localStorage.removeItem("authToken");
    localStorage.removeItem("roles");

    // Optional: you can also clear any other user-specific storage here

    // Redirect to main login page
    window.location.href = "/login";

    // Stop further processing
    throw new Error("Session expired. Redirecting to login.");
  }

  return response;
}

// 🔹 Vendor portal (uses "vendorToken")
export async function vendorAuthFetch(url, options = {}) {
  const token = localStorage.getItem("vendorToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Clear vendor session
    localStorage.removeItem("vendorToken");

    // Redirect to vendor login page
    window.location.href = "/vendor/login";

    throw new Error("Vendor session expired. Redirecting to login.");
  }

  return response;
}
