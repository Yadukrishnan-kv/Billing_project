// src/pages/admin/purchase/Suppliers/SupplierDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './SupplierDetails.css';

function SupplierDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    axios.get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data.user))
    .catch(() => {
      localStorage.clear();
      navigate('/');
    });
  }, [navigate, BACKEND_URL]);

  // Fetch supplier
  useEffect(() => {
    if (!user) return;

    const fetchSupplier = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${BACKEND_URL}/api/suppliers/getSupplierById/${id}`);
        setSupplier(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, user, BACKEND_URL]);

  const handleEdit = () => navigate(`/admin/purchase/Suppliers/edit/${id}`);

  

  // Safe render guards
  if (!user) return <div className="loading">Authenticating...</div>;
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode}
          dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
          collapsed={collapsed} setCollapsed={setCollapsed} />
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed}
          openMenu={openMenu} setOpenMenu={setOpenMenu} />
        <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="supplierdetails-loading-container">
            <div className="supplierdetails-spinner"></div>
            <p>Loading supplier details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="admin-layout">
        <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode}
          dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
          collapsed={collapsed} setCollapsed={setCollapsed} />
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed}
          openMenu={openMenu} setOpenMenu={setOpenMenu} />
        <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="supplierdetails-error-message">
            {error || 'Supplier not found'}
          </div>
        </main>
      </div>
    );
  }

  // SAFE: Convert tags to array no matter what format comes from backend
  const tagsArray = Array.isArray(supplier.tags)
    ? supplier.tags
    : typeof supplier.tags === 'string' && supplier.tags.trim()
      ? supplier.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  // SAFE: Get catalogue name
  const getCatalogueName = () => {
    if (!supplier.catalogue) return '-';
    if (typeof supplier.catalogue === 'object' && supplier.catalogue.name) {
      return supplier.catalogue.name;
    }
    return typeof supplier.catalogue === 'string' ? supplier.catalogue : '-';
  };

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
        <div className="supplierdetails-wrapper">

          {/* Header */}
          <div className="supplierdetails-header-card">
            <div className="supplierdetails-header-top">
              <button className="supplierdetails-btn-back" onClick={() => navigate('/admin/purchase/Suppliers')}>
                <FiArrowLeft size={18} /> Back to Suppliers
              </button>
              <div className="supplierdetails-header-actions">
                <button className="supplierdetails-btn-edit" onClick={handleEdit}>
                  <FiEdit2 size={18} /> Edit
                </button>
               
              </div>
            </div>
          </div>

          <div className="supplierdetails-grid">

            {/* Basic Information */}
            <div className="supplierdetails-card supplierdetails-card-blue">
              <div className="supplierdetails-card-header">
                <h2>Basic Information</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Supplier Name</span>
                  <span className="supplierdetails-value">{supplier.supplierName}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Company</span>
                  <span className="supplierdetails-value">{supplier.company || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Tax Type</span>
                  <span className="supplierdetails-value">{supplier.taxType}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">TRN</span>
                  <span className="supplierdetails-value">{supplier.trn || '-'}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="supplierdetails-card supplierdetails-card-teal">
              <div className="supplierdetails-card-header">
                <h2>Contact Information</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Email</span>
                  <span className="supplierdetails-value supplierdetails-email-value">{supplier.email || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Secondary Email</span>
                  <span className="supplierdetails-value supplierdetails-email-value">{supplier.secondaryEmail || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Phone</span>
                  <span className="supplierdetails-value supplierdetails-phone-value">{supplier.phone || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Country</span>
                  <span className="supplierdetails-value">{supplier.country || '-'}</span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="supplierdetails-card supplierdetails-card-purple">
              <div className="supplierdetails-card-header">
                <h2>Financial Details</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Currency</span>
                  <span className="supplierdetails-value">{supplier.currency}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Payment Terms</span>
                  <span className="supplierdetails-value">{supplier.paymentTerms}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Tax Method</span>
                  <span className="supplierdetails-value">{supplier.taxMethod}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Opening Balance</span>
                  <span className="supplierdetails-value supplierdetails-balance-value">{supplier.openingBalance}</span>
                </div>
              </div>
            </div>

            {/* Supply Information */}
            <div className="supplierdetails-card supplierdetails-card-orange">
              <div className="supplierdetails-card-header">
                <h2>Supply Information</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Source of Supply</span>
                  <span className="supplierdetails-value">{supplier.sourceOfSupply || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Catalogue</span>
                  <span className="supplierdetails-value">{getCatalogueName()}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Tags</span>
                  <div className="supplierdetails-value">
                    {tagsArray.length > 0 ? (
                      tagsArray.map((tag, i) => (
                        <span key={i} className="supplierdetails-tag">{tag}</span>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="supplierdetails-card supplierdetails-card-red">
              <div className="supplierdetails-card-header">
                <h2>Billing Address</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Address</span>
                  <span className="supplierdetails-value">{supplier.address || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">City</span>
                  <span className="supplierdetails-value">{supplier.city || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">State/Region</span>
                  <span className="supplierdetails-value">{supplier.state || '-'}</span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">ZIP Code</span>
                  <span className="supplierdetails-value">{supplier.zipCode || '-'}</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="supplierdetails-card supplierdetails-card-indigo">
              <div className="supplierdetails-card-header">
                <h2>Additional Info</h2>
                <div className="supplierdetails-header-accent"></div>
              </div>
              <div className="supplierdetails-card-content">
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Created</span>
                  <span className="supplierdetails-value">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="supplierdetails-detail-row">
                  <span className="supplierdetails-label">Last Updated</span>
                  <span className="supplierdetails-value">
                    {new Date(supplier.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default SupplierDetails;