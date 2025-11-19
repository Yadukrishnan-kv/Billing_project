// src/pages/inventory/ViewCatalogue.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './ViewCatalogue.css';

function ViewCatalogue() {
  const { id: catalogueId } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [catalogue, setCatalogue] = useState(null);
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
    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/catalogues/getCatalogueById/${catalogueId}`);
        setCatalogue(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load catalogue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, [catalogueId, BACKEND_URL]);

  if (!user) return <div className="viewcatalogue-loading">Loading…</div>;
  if (loading) return <div className="viewcatalogue-loading">Loading catalogue…</div>;
  if (error) return <div className="viewcatalogue-error-message">{error}</div>;
  if (!catalogue) return <div className="viewcatalogue-error-message">Catalogue not found</div>;

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
        <div className="viewcatalogue-container">
          <div className="viewcatalogue-header">
            <h1>Catalogue: {catalogue.name}</h1>
            <button
              className="viewcatalogue-btn-back"
              onClick={() => navigate('/admin/inventory/catalogues')}
            >
              <FiArrowLeft /> Back
            </button>
          </div>

          <div className="viewcatalogue-card">
            <div className="viewcatalogue-info">
              <div className="viewcatalogue-field">
                <span className="viewcatalogue-label">ID</span>
                <span className="viewcatalogue-value">{catalogue._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="viewcatalogue-field">
                <span className="viewcatalogue-label">Name</span>
                <span className="viewcatalogue-value">{catalogue.name}</span>
              </div>
              <div className="viewcatalogue-field">
                <span className="viewcatalogue-label">Module</span>
                <span className="viewcatalogue-value">{catalogue.module}</span>
              </div>
              <div className="viewcatalogue-field">
                <span className="viewcatalogue-label">Created At</span>
                <span className="viewcatalogue-value">{new Date(catalogue.createdAt).toLocaleString()}</span>
              </div>
              <div className="viewcatalogue-field">
                <span className="viewcatalogue-label">Updated At</span>
                <span className="viewcatalogue-value">{new Date(catalogue.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="viewcatalogue-actions">
              <button className="viewcatalogue-btn-edit" onClick={() => navigate(`/admin/inventory/catalogue/edit/${catalogueId}`)}>
                <FiEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewCatalogue;