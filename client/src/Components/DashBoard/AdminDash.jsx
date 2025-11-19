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
          <p className="welcome-subtitle">Your dashboard is ready.</p>
          <p className="admin-note">
            You are logged in as <strong>{user.username}</strong> — manage your business with full control.
          </p>
        </div>

        {/* ---------- STAT CARDS ---------- */}
        <section className="dashboard-grid">
          {/* Total Sales */}
          <div className="stat-card">
            <div className="card-header">
              <span className="card-title">Total Sales</span>
              <div className="card-icon sales"><FiShoppingBag /></div>
            </div>
            <div className="card-value">$48,574</div>
            <div className="card-change positive">+12.5% Up</div>
            <svg className="progress-ring" viewBox="0 0 80 80" style={{ '--percent': 72 }}>
              <defs>
                <linearGradient id="gradient-sales" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle className="bg" cx="40" cy="40" r="36" />
              <circle className="fg" cx="40" cy="40" r="36" stroke="url(#gradient-sales)" />
            </svg>
          </div>

          {/* Revenue */}
          <div className="stat-card">
            <div className="card-header">
              <span className="card-title">Revenue</span>
              <div className="card-icon revenue"><FiDollarSign /></div>
            </div>
            <div className="card-value">$124,320</div>
            <div className="card-change positive">+8.3% Up</div>
            <svg className="progress-ring" viewBox="0 0 80 80" style={{ '--percent': 84 }}>
              <defs>
                <linearGradient id="gradient-revenue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <circle className="bg" cx="40" cy="40" r="36" />
              <circle className="fg" cx="40" cy="40" r="36" stroke="url(#gradient-revenue)" />
            </svg>
          </div>

          {/* Orders */}
          <div className="stat-card">
            <div className="card-header">
              <span className="card-title">Orders</span>
              <div className="card-icon orders"><FiPackage /></div>
            </div>
            <div className="card-value">1,428</div>
            <div className="card-change negative">-3.1% Down</div>
            <svg className="progress-ring" viewBox="0 0 80 80" style={{ '--percent': 56 }}>
              <defs>
                <linearGradient id="gradient-orders" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <circle className="bg" cx="40" cy="40" r="36" />
              <circle className="fg" cx="40" cy="40" r="36" stroke="url(#gradient-orders)" />
            </svg>
          </div>

          {/* Active Users */}
          <div className="stat-card">
            <div className="card-header">
              <span className="card-title">Active Users</span>
              <div className="card-icon users"><FiUser /></div>
            </div>
            <div className="card-value">3,214</div>
            <div className="card-change positive">+18.7% Up</div>
            <svg className="progress-ring" viewBox="0 0 80 80" style={{ '--percent': 91 }}>
              <defs>
                <linearGradient id="gradient-users" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle className="bg" cx="40" cy="40" r="36" />
              <circle className="fg" cx="40" cy="40" r="36" stroke="url(#gradient-users)" />
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDash;   // match the file name