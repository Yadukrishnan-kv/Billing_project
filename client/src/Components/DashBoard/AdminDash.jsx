// src/components/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../AdminHeader/AdminHeader';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import '../DashBoard/AdminDash.css';
import { FiDollarSign, FiPackage, FiShoppingBag, FiUser } from 'react-icons/fi';

const AdminDash = () => {                 // renamed to match file name
 const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_IP;

  // ---------- DARK MODE ----------
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ---------- FETCH USER ----------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    axios
      .get(`${backendUrl}/api/admin/viewloginedprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        navigate('/');
      });
  }, [navigate, backendUrl]);

  if (!user) return <div className="loading">Loading…</div>;

  return (
    <div className="admin-layout">
      {/* ---------- HEADER ---------- */}
      <AdminHeader
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ---------- SIDEBAR ---------- */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      {/* ---------- MAIN CONTENT ---------- */}
      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="welcome-wrapper">
          <h1 className="welcome-title">Welcome to {user.role || 'Dashboard'}</h1>
          <p className="admin-note">
            You are logged in as <strong>{user.username}</strong> — manage your business with full control.
          </p>
        </div>

       
      </main>
    </div>
  );
};

export default AdminDash;   // match the file name