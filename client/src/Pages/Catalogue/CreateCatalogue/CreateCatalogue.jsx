// src/pages/inventory/CreateCatalogue.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './CreateCatalogue.css';

function CreateCatalogue() {
  const { id: catalogueId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!catalogueId;

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  const [formData, setFormData] = useState({
    name: '',
    module: 'sale'
  });

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
    if (!isEditMode) return;

    const fetchCatalogue = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${BACKEND_URL}/api/catalogues/getCatalogueById/${catalogueId}`);
        const cat = res.data.data;
        setFormData({
          name: cat.name || '',
          module: cat.module || 'sale'
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load catalogue');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchCatalogue();
  }, [catalogueId, isEditMode, BACKEND_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/catalogues/updateCatalogue/${catalogueId}`, formData);
      } else {
        await axios.post(`${BACKEND_URL}/api/catalogues/createCatalogue`, formData);
      }
      navigate('/admin/items/Catalogue');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save catalogue');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createcatalogue-loading">Loading…</div>;
  if (fetching) return <div className="createcatalogue-loading">Loading catalogue…</div>;

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
        <div className="createcatalogue-container">
          <div className="createcatalogue-header">
            <h1>
              {isEditMode
                ? `Edit Catalogue #${catalogueId?.slice(-6).toUpperCase()}`
                : 'Create New Catalogue'}
            </h1>
            <button
              className="createcatalogue-btn-back"
              onClick={() => navigate('/admin/items/Catalogue')}
            >
              <FiArrowLeft /> Back
            </button>
          </div>

          {error && <div className="createcatalogue-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="createcatalogue-form">
            <div className="createcatalogue-row">
              <div className="createcatalogue-group">
                <label>Name <span className="createcatalogue-required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="createcatalogue-group">
                <label>Module <span className="createcatalogue-required">*</span></label>
                <select name="module" value={formData.module} onChange={handleInputChange} required>
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
            </div>

            <div className="createcatalogue-actions">
              <button type="submit" className="createcatalogue-btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Catalogue' : 'Create Catalogue'}
              </button>
              <button
                type="button"
                className="createcatalogue-btn-cancel"
                onClick={() => navigate('/admin/inventory/catalogues')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateCatalogue;