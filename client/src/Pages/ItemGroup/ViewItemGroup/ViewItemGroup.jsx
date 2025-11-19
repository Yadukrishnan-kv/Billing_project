// src/pages/inventory/ViewItemGroup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './ViewItemGroup.css';

function ViewItemGroup() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [itemGroup, setItemGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    axios
      .get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        navigate('/');
      });
  }, [navigate, BACKEND_URL]);

  useEffect(() => {
    const fetchItemGroup = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/itemgroups/getItemGroupById/${groupId}`);
        setItemGroup(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item group');
      } finally {
        setLoading(false);
      }
    };

    fetchItemGroup();
  }, [groupId, BACKEND_URL]);

  if (!user) return <div className="viewitemgroup-loading">Loading…</div>;
  if (loading) return <div className="viewitemgroup-loading">Loading item group…</div>;
  if (error) return <div className="viewitemgroup-error-message">{error}</div>;
  if (!itemGroup) return <div className="viewitemgroup-error-message">Item Group not found</div>;

  return (
    <div className="admin-layout">
      <AdminHeader
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
        <div className="viewitemgroup-container">
          <div className="viewitemgroup-header">
            <h1>Item Group: {itemGroup.name}</h1>
            <button
              className="viewitemgroup-btn-back"
              onClick={() => navigate('/admin/inventory/itemgroups')}
            >
              <FiArrowLeft /> Back
            </button>
          </div>

          <div className="viewitemgroup-card">
            <div className="viewitemgroup-info">
              <div className="viewitemgroup-field">
                <span className="viewitemgroup-label">ID</span>
                <span className="viewitemgroup-value">{itemGroup._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="viewitemgroup-field">
                <span className="viewitemgroup-label">Name</span>
                <span className="viewitemgroup-value">{itemGroup.name}</span>
              </div>
              <div className="viewitemgroup-field">
                <span className="viewitemgroup-label">Created At</span>
                <span className="viewitemgroup-value">{new Date(itemGroup.createdAt).toLocaleString()}</span>
              </div>
              <div className="viewitemgroup-field">
                <span className="viewitemgroup-label">Updated At</span>
                <span className="viewitemgroup-value">{new Date(itemGroup.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="viewitemgroup-actions">
              <button className="viewitemgroup-btn-edit" onClick={() => navigate(`/admin/inventory/itemgroup/edit/${groupId}`)}>
                <FiEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewItemGroup;