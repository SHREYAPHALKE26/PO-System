import React, { useState } from 'react';
// import 'L:/project/PO-System/frontend/src/components/setting.css'; // We'll create this CSS file

const Settings = ({ onLogout }) => { // Accept onLogout as a prop
  const [formState, setFormState] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    theme: 'light',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
    console.log('Profile update data:', { username: formState.username, email: formState.email });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formState.newPassword !== formState.confirmNewPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    console.log('Password change data:', { oldPassword: formState.oldPassword, newPassword: formState.newPassword });
    setFormState({ ...formState, oldPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setFormState({ ...formState, theme: newTheme });
    alert(`Theme changed to ${newTheme}!`);
  };

  return (
    <div className="settings-container">
      <h1 className="page-title">Settings ⚙️</h1>
      <div className="settings-content-wrapper">
        
        {/* Profile Settings Card */}
        <div className="card settings-card">
          <h3 className="card-title">Profile Settings</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formState.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>

        {/* Security Settings Card */}
        <div className="card settings-card">
          <h3 className="card-title">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={formState.oldPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formState.newPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formState.confirmNewPassword}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>
        </div>

        {/* Theme Settings Card */}
        <div className="card settings-card">
          <h3 className="card-title">Theme</h3>
          <div className="form-group">
            <label htmlFor="theme-select">Select Theme</label>
            <select
              id="theme-select"
              name="theme"
              value={formState.theme}
              onChange={handleThemeChange}
              className="theme-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>

        {/* New: Account Actions Card with Logout Button */}
        <div className="card settings-card">
          <h3 className="card-title">Account Actions</h3>
          <button onClick={onLogout} className="btn btn-delete">
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
