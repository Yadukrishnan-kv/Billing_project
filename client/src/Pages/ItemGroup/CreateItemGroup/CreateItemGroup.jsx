// src/pages/inventory/CreateItemGroup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './CreateItemGroup.css';

function CreateItemGroup() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!groupId;

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
    name: ''
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

    const fetchItemGroup = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${BACKEND_URL}/api/itemgroups/getItemGroupById/${groupId}`);
        const group = res.data.data;
        setFormData({
          name: group.name || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item group');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchItemGroup();
  }, [groupId, isEditMode, BACKEND_URL]);

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
        await axios.put(`${BACKEND_URL}/api/itemgroups/updateItemGroup/${groupId}`, formData);
      } else {
        await axios.post(`${BACKEND_URL}/api/itemgroups/createItemGroup`, formData);
      }
      navigate('/admin/items/Item-Group');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item group');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createitemgroup-loading">Loading…</div>;
  if (fetching) return <div className="createitemgroup-loading">Loading item group…</div>;

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
        <div className="createitemgroup-container">
          <div className="createitemgroup-header">
            <h1>
              {isEditMode
                ? `Edit Item Group #${groupId?.slice(-6).toUpperCase()}`
                : 'Create New Item Group'}
            </h1>
            <button
              className="createitemgroup-btn-back"
              onClick={() => navigate('/admin/items/Item-Group')}
            >
              <FiArrowLeft /> Back
            </button>
          </div>

          {error && <div className="createitemgroup-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="createitemgroup-form">
            <div className="createitemgroup-row">
              <div className="createitemgroup-group createitemgroup-group-full">
                <label>Name <span className="createitemgroup-required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="createitemgroup-actions">
              <button type="submit" className="createitemgroup-btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Item Group' : 'Create Item Group'}
              </button>
              <button
                type="button"
                className="createitemgroup-btn-cancel"
                onClick={() => navigate('/admin/inventory/itemgroups')}
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

export default CreateItemGroup;