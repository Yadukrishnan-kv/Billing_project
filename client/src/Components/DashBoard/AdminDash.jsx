// src/components/admin/AdminDash.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../AdminHeader/AdminHeader';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminDash.css';

const AdminDash = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_IP || 'http://localhost:5000';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <AdminHeader
        user={user}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="welcome-wrapper">
          <h1 className="welcome-title">
            Welcome back, {user.username}!
          </h1>
          <p className="admin-note">
            You are logged in as <strong>{user.role}</strong> — manage your business with full control.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDash;