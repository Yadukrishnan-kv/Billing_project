// src/components/admin/AdminHeader.jsx
import React from 'react';
import {
  FiBell,
  FiChevronDown,
  FiUser,
  FiLock,
  FiLogOut,
  FiMenu,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css'; // Make sure path is correct

const AdminHeader = ({
  user,
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
        <button
          className="menu-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
      </div>

      <div className="header-right">
        {/* Notification Bell */}
        <div className="bell-wrapper">
          {/* <FiBell className="icon-bell" /> */}
        </div>

        {/* User Dropdown */}
        <div
          className={`user-dropdown ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.username || 'User'}</span>
          <FiChevronDown className="chevron" />

          {/* Dropdown Menu */}
          <div className="dropdown-menu">
            <a href="/profile">
              <FiUser /> View Profile
            </a>
            
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <FiLogOut /> Logout
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;