// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "L:/project/PO-System/frontend/src/components/sidebar.css";


const Sidebar = ({ roles, onLogout }) => {
  const location = useLocation();

  // Helper function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">PO System</h2>
        <p className="sidebar-subtitle">Procurement Management</p>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {roles.includes("Admin") && (
            <>
              <li className="sidebar-menu-item">
                <Link
                  to="/"
                  className={`sidebar-link ${isActive("/") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link
                  to="/departments"
                  className={`sidebar-link ${isActive("/departments") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">apartment</span>
                  <span>Departments</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link
                  to="/vendors"
                  className={`sidebar-link ${isActive("/vendors") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">store</span>
                  <span>Vendors</span>
                </Link>
              </li>
              {/* <li className="sidebar-menu-item">
                <Link
                  to="/report"
                  className={`sidebar-link ${isActive("/report") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">assessment</span>
                  <span>Reports</span>
                </Link>
              </li> */}
              <li className="sidebar-menu-item">
                <Link
                  to="/officer/purchase-orders"
                  className={`sidebar-link ${isActive("/officer/purchase-orders") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                  <span>Purchasing Officer</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link
                  to="/requestor/dashboard"
                  className={`sidebar-link ${isActive("/requestor/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">request_quote</span>
                  <span>Requests</span>
                </Link>
              </li>
              {/* <li className="sidebar-menu-item">
                <Link
                  to="/officer/quotations"
                  className={`sidebar-link ${isActive("/officer/quotations") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">description</span>
                  <span>Quotations</span>
                </Link>
              </li> */}
              <li className="sidebar-menu-item">
                <Link
                  to="/approver/dashboard"
                  className={`sidebar-link ${isActive("/approver/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">pending_actions</span>
                  <span>Approver</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                {/* <Link 
                  to="/officer/dashboard" 
                  className={`sidebar-link ${isActive("/officer/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Approved Requests</span>
                </Link> */}
              </li>
              <li className="sidebar-menu-item">
                <Link
                  to="/usersManage"
                  className={`sidebar-link ${isActive("/usersManage") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">group</span>
                  <span>Users</span>
                </Link>
              </li>
            </>
          )}

          {/* {roles.includes("Vendor") && (
            <>
              <li className="sidebar-menu-item">
                <Link
                  to="/vendors"
                  className={`sidebar-link ${isActive("/vendors") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">store</span>
                  <span>Vendor Dashboard</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link
                  to="/purchase-orders"
                  className={`sidebar-link ${isActive("/purchase-orders") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                  <span>Purchase Orders</span>
                </Link>
              </li>
            </>
          )} */}

          {/* Requestor Menu */}
          {roles.includes("Requestor") && (
            <>
              <li className="sidebar-menu-item">
                <Link
                  to="/requestor/dashboard"
                  className={`sidebar-link ${isActive("/requestor/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">request_quote</span>
                  <span>My Requests</span>
                </Link>
              </li>

            </>
          )}
          


          {roles.includes("Approver") && (
            <>
              <li className="sidebar-menu-item">
                <Link
                  to="/approver/dashboard"
                  className={`sidebar-link ${isActive("/approver/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">pending_actions</span>
                  <span>Pending Approver</span>
                </Link>
              </li>
              {/* <li className="sidebar-menu-item">
                <Link
                  to="/report"
                  className={`sidebar-link ${isActive("/report") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">assessment</span>
                  <span>Reports</span>
                </Link>
              </li> */}
            </>
          )}

          {roles.includes("PurchasingOfficer") && (
            <>
              <li className="sidebar-menu-item">
                <Link
                  to="/officer/dashboard"
                  className={`sidebar-link ${isActive("/officer/dashboard") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">store</span>
                  <span>Vendor Dashboard</span>
                </Link>

              </li>

              {/* <li className="sidebar-menu-item">
                <Link
                  to="/report"
                  className={`sidebar-link ${isActive("/report") ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">assessment</span>
                  <span>Reports</span>
                </Link>
              </li> */}
            </>
          )}

          {/* po report  */}
          {roles.includes("Approver")|| roles.includes("PurchasingOfficer") || roles.includes("Requestor") || roles.includes("Admin") ? (
            <Link to="/shared/department-pos" className="sidebar-link">
               <span className="material-symbols-outlined">assessment</span><span>Reports</span>
            </Link>
          ) : null}

          {/* Divider */}
          <li className="sidebar-divider"></li>

          {/* Bottom Menu Items */}
          <li className="sidebar-menu-item">
            <Link
              to="/profile"
              className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </Link>
          </li>
          <li className="sidebar-menu-item">
            <button onClick={onLogout} className="sidebar-logout-btn">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;