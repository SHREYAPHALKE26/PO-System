import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-title">PO System Dashboard</div>
      <div className="user-profile">
        <span>John Doe</span>
        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;