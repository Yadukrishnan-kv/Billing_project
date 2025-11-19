// src/components/admin/AdminHeader.jsx
import React from 'react';
import {
  FiBell,
  FiChevronDown,
  FiMoon,
  FiSun,
  FiUser,
  FiLock,
  FiLogOut,
  FiMenu,               // <-- FIXED: was missing
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../DashBoard/AdminDash.css';

const AdminHeader = ({
  user,
  darkMode,
  setDarkMode,
  dropdownOpen,
  setDropdownOpen,
  collapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)}>
          <FiMenu />
        </button>
        <button className="create-btn">Create new</button>
      </div>

      <div className="header-right">
        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <FiBell className="icon-bell" />

        <div
          className={`user-dropdown ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="user-avatar">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user.username || 'User'}</span>
          <FiChevronDown className="chevron" />

          <div className="dropdown-menu">
            <a href="/profile">
              <FiUser /> View Profile
            </a>
            <a href="/change-password">
              <FiLock /> Change Password
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <FiLogOut /> Logout
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;