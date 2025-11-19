// src/pages/admin/sales/Customer/CustomerView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import '../ViewCustomer/ViewCustomer.css';

const CustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin layout states
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  // Dark mode
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    axios
      .get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        navigate('/');
      });
  }, [navigate, BACKEND_URL]);

  // Fetch customer with populated catalogue
  useEffect(() => {
    if (!user) return;

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/customers/getCustomerById/${id}`);
        setCustomer(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, BACKEND_URL, user]);

  const handleEdit = () => navigate(`/admin/sales/Customer/edit/${id}`);

  // Helper to safely display catalogue name
  const getCatalogueName = () => {
    if (!customer.catalogue) return '-';
    if (typeof customer.catalogue === 'string') return 'Default'; // fallback if only ID
    if (typeof customer.catalogue === 'object' && customer.catalogue.name) {
      return customer.catalogue.name;
    }
    return 'Unknown';
  };

  if (!user) return <div className="loading">Loading…</div>;
  if (loading) return <div className="loading">Loading customer...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!customer) return <div className="error-message">Customer not found</div>;

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
        <div className="details-wrapper">
          {/* Header */}
          <div className="details-header-card">
            <div className="header-top">
              <button className="btn-back" onClick={() => navigate('/admin/sales/Customer')}>
                <FiArrowLeft size={18} /> Back to Customers
              </button>
              <div className="header-actions">
                <button className="btn-edit" onClick={handleEdit}>
                  <FiEdit2 size={18} /> Edit
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="details-grid">

            {/* Basic Information */}
            <div className="details-card card-blue">
              <div className="card-header">
                <h2>Basic Information</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="label">Customer Name</span>
                  <span className="value">{customer.customer}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Company</span>
                  <span className="value">{customer.company || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tax Type</span>
                  <span className="value">{customer.taxType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">TRN</span>
                  <span className="value">{customer.trn || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Place of Supply</span>
                  <span className="value">{customer.placeOfSupply}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="details-card card-teal">
              <div className="card-header">
                <h2>Contact Information</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="label">Email</span>
                  <span className="value email-value">{customer.email || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value phone-value">{customer.phone || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Country</span>
                  <span className="value">{customer.billingAddress?.country || '-'}</span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="details-card card-purple">
              <div className="card-header">
                <h2>Financial Details</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="label">Currency</span>
                  <span className="value">{customer.currency}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment Terms</span>
                  <span className="value">{customer.paymentTerms}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tax Method</span>
                  <span className="value">{customer.taxMethod}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Opening Balance</span>
                  <span className="value balance-value">{customer.openingBalance}</span>
                </div>
              </div>
            </div>

            {/* Catalogue & Tags - FIXED */}
            <div className="details-card card-orange">
              <div className="card-header">
                <h2>Catalogue & Tags</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="label">Catalogue</span>
                  <span className="value">
                    {getCatalogueName()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Tags</span>
                  <div className="value tags-display">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                      ))
                    ) : (
                      <span className="no-data">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="details-card card-red">
              <div className="card-header">
                <h2>Billing Address</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                {customer.billingAddress ? (
                  <>
                    <div className="detail-row">
                      <span className="label">Address</span>
                      <span className="value">{customer.billingAddress.address || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">City</span>
                      <span className="value">{customer.billingAddress.city || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">State/Region</span>
                      <span className="value">{customer.billingAddress.stateRegion || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">ZIP Code</span>
                      <span className="value">{customer.billingAddress.zipPostalCode || '-'}</span>
                    </div>
                  </>
                ) : (
                  <p className="no-data">No billing address</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="details-card card-indigo">
              <div className="card-header">
                <h2>Shipping Address</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                {customer.shippingAddress?.sameAsBilling ? (
                  <p className="same-as-text">Same as billing address</p>
                ) : customer.shippingAddress ? (
                  <>
                    <div className="detail-row">
                      <span className="label">Contact</span>
                      <span className="value">{customer.shippingAddress.contactPerson || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone</span>
                      <span className="value">{customer.shippingAddress.phone || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Address</span>
                      <span className="value">{customer.shippingAddress.address || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">City</span>
                      <span className="value">{customer.shippingAddress.city || '-'}</span>
                    </div>
                  </>
                ) : (
                  <p className="no-data">No shipping address</p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="details-card card-indigo">
              <div className="card-header">
                <h2>Additional Info</h2>
                <div className="header-accent"></div>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="label">Created</span>
                  <span className="value">{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Updated</span>
                  <span className="value">{new Date(customer.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerView;