import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";




// Components
import Sidebar from "./pages/Same/Sidebar.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.js";

// Pages
import DashboardPage from "./pages/Admin/Dashboard.jsx";
import PurchaseOrdersPage from "./pages/Offier/PurchasingDashboard.jsx";
import AdminVendorsPage from "./pages/Admin/AdminVendorDashboard.jsx";
import VendorsPage from "./pages/Vendor/VednorDashboard.jsx";
import DepartmentsPage from "./pages/Admin/DepartmentManagement.jsx";
import UserManagment from "./pages/Admin/UsersManagement.jsx";
import SettingsPage from "./pages/Same/Settings.jsx";
import ProfilePage from "./pages/Same/ProfilePage.jsx";
import LoginPage from "./pages/Authentication/loginPage.jsx";
import ResetPassword from "./pages/Authentication/ResetPassword.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";
import RegisterPage from "./pages/Authentication/RegisterPage.jsx";
import UnauthorizedPage from "./pages/Same/Unauthorized.jsx";

// quotation 
import QuotationReview from "./pages/Offier/QuotationReview.jsx";


// 🆕 Requestor Pages
import RequestorDashboard from "./pages/Requestor/RequestorDashboard.jsx";
import AssignDepartmentToRequestor from "./pages/Admin/AssignDepartmentToUser.jsx"; //admin


// approver
import ApproverDashboard from "./pages/Approver/ApproverDashboard.jsx";

// purchase
import AssignVendor from "./pages/Offier/OfficerAssignVendors.jsx";
import GeneratePO from "./pages/Same/GeneratePO.jsx";

//vendors
import VendorLogin from "./pages/Vendor/vendorLogin.jsx"
import VendorAssignedRFQs from "./pages/Vendor/VendorAssignedRFQs.jsx"
import VendorSubmitQuotation from "./pages/Vendor/VendorSubmitQuotation.jsx"
import VendorProfile from "./pages/Vendor/VendorProfile.jsx"



import DepartmentPOList from "./pages/Same/DepartmentPOList.jsx";
import DepartmentPODetail from "./pages/Same/DepartmentPODetail.jsx";


// import "./App.css";
import "material-symbols/outlined.css";

// ✅ ProtectedRoute definition (if not separate)
const ProtectedRouteInline = ({ children, allowedRoles, roles, isLoggedIn, isInitialized = true }) => {
  // If still loading, show loading state
  if (!isInitialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#1E3A8A' }}>Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but no roles or role not allowed, show unauthorized
  if (!roles || roles.length === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  // Initialize state from localStorage directly
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  const [isVendorLoggedIn, setIsVendorLoggedIn] = useState(() => {
    return !!localStorage.getItem("vendorToken");
  });

  const [roles, setRoles] = useState(() => {
    return JSON.parse(localStorage.getItem("roles") || "[]");
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Handle login
  const handleLogin = (token, userRoles) => {
    // Ensure roles is an array
    const rolesArray = Array.isArray(userRoles) ? userRoles : [];
    localStorage.setItem("authToken", token);
    localStorage.setItem("roles", JSON.stringify(rolesArray));
    setRoles(rolesArray);
    setIsLoggedIn(true);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("roles");
    setIsLoggedIn(false);
    setRoles([]);
  };

  // ✅ Sync session on refresh - mark as initialized after first check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
    setIsLoggedIn(!!token);
    setRoles(storedRoles);
    setIsInitialized(true);
  }, []);

  return (
    <Router>
      <div className="flex w-full">
        {/* ✅ Vendor Session Layout */}
        {isVendorLoggedIn ? (
          <div className="w-full">
            <Routes>
              <Route path="/vendor/dashboard" element={<VendorsPage />} />
              <Route path="/vendor/assigned-rfqs" element={<VendorAssignedRFQs />} />
              <Route path="/vendor/submit-quotation/:rfq_id" element={<VendorSubmitQuotation />} />
              {/* 🆕 Vendor profile route */}
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/logout" element={<Navigate to="/vendor/login" replace />} />
              <Route path="/vendor/login" element={<VendorLogin />} />
              <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
            </Routes>
          </div>
        ) : isLoggedIn && isInitialized ? (
          <>
            {/* ✅ Regular Employee/Admin Layout */}
            <Sidebar roles={roles} onLogout={handleLogout} />
            <div className="flex-1 ml-64 ">
              <Routes>
                {/* ------------------ ADMIN ROUTES ------------------ okay */}
                <Route
                  path="/"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin"]}
                      isInitialized={isInitialized}
                    >
                      <DashboardPage />
                    </ProtectedRouteInline>
                  }
                />

                {/* okay */}
                <Route
                  path="/departments"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin"]}
                      isInitialized={isInitialized}
                    >
                      <DepartmentsPage />
                    </ProtectedRouteInline>
                  }
                />

                <Route
                  path="/assigndept"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin"]}
                      isInitialized={isInitialized}
                    >
                      <AssignDepartmentToRequestor />
                    </ProtectedRouteInline>
                  }
                />

                <Route
                  path="/usersManage"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin"]}
                      isInitialized={isInitialized}
                    >
                      <UserManagment />
                    </ProtectedRouteInline>
                  }
                />


                {/* ------------------ VENDOR ROUTES ------------------ */}
                <Route
                  path="/vendors"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin"]}
                      isInitialized={isInitialized}
                    >
                      <AdminVendorsPage />
                    </ProtectedRouteInline>
                  }
                />


                {/* ------------------ REQUESTOR ------------------ */}
                <Route
                  path="/requestor/dashboard"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Requestor", "Admin"]}
                      isInitialized={isInitialized}
                    >
                      <RequestorDashboard />
                    </ProtectedRouteInline>
                  }
                />


                {/* ------------------ APPROVER ------------------ */}
                <Route
                  path="/approver/dashboard"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Approver", "Admin"]}
                      isInitialized={isInitialized}
                    >
                      <ApproverDashboard />
                    </ProtectedRouteInline>
                  }
                />


                {/* Report Shared  */}
                <Route
                  path="/shared/department-pos"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Requestor", "Approver", "Admin", "PurchasingOfficer"]}
                      isInitialized={isInitialized}
                    >
                      <DepartmentPOList />
                    </ProtectedRouteInline>
                  }
                />
                <Route
                  path="/shared/department-pos/:po_id"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Requestor", "Approver", "Admin", "PurchasingOfficer"]}
                      isInitialized={isInitialized}
                    >
                      <DepartmentPODetail />
                    </ProtectedRouteInline>
                  }
                />


                {/* ------------------ PURCHASING ------------------ */}
                <Route
                  path="/officer/dashboard"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["PurchasingOfficer", "Admin"]}
                      isInitialized={isInitialized}
                    >
                      <PurchaseOrdersPage />
                    </ProtectedRouteInline>
                  }
                />



                <Route
                  path="/officer/quotations/:rfq_id"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["PurchasingOfficer", "Admin"]}
                      isInitialized={isInitialized}
                    >
                      <QuotationReview />
                    </ProtectedRouteInline>
                  }
                />

                <Route
                  path="/purchasing/po/:id"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["PurchasingOfficer", "Admin"]}
                      isInitialized={isInitialized}
                    >
                      <GeneratePO />
                    </ProtectedRouteInline>
                  }
                />

                {/* ------------------ SHARED ROUTES ------------------ */}
                <Route
                  path="/officer/assignedVendor"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin", "PurchasingOfficer"]}
                      isInitialized={isInitialized}
                    >
                      <AssignVendor />
                    </ProtectedRouteInline>
                  }
                />
                <Route
                  path="/officer/purchase-orders"
                  element={
                    <ProtectedRouteInline
                      isLoggedIn={isLoggedIn}
                      roles={roles}
                      allowedRoles={["Admin", "PurchasingOfficer"]}
                      isInitialized={isInitialized}
                    >
                      <PurchaseOrdersPage />
                    </ProtectedRouteInline>
                  }
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </>
        ) : !isInitialized ? (
          // Show loading while initializing
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', fontSize: '1.2rem', color: '#1E3A8A' }}>
            Loading application...
          </div>
        ) : (
          // ✅ Login routes
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );

};

export default App;
