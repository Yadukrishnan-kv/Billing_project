// src/components/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../AdminHeader/AdminHeader';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminDash.css'; // Make sure path is correct
import { FiDollarSign, FiPackage, FiShoppingBag, FiUser } from 'react-icons/fi';

const AdminDash = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_IP || 'http://localhost:5000';

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch logged-in user
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

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <AdminHeader
        user={user}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      {/* Main Content */}
      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="welcome-wrapper">
          <h1 className="welcome-title">
            Welcome to {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Dashboard'}
          </h1>
          <p className="admin-note">
            You are logged in as <strong>{user.username}</strong> — manage your business with full control.
          </p>
        </div>

        {/* Optional: Add stats grid later */}
        {/* <div className="dashboard-grid">...</div> */}
      </main>
    </div>
  );
};

export default AdminDash;