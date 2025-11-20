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
        <div className="viewcustomer-details-wrapper">
          {/* Header */}
          <div className="viewcustomer-details-header-card">
            <div className="viewcustomer-header-top">
              <button className="viewcustomer-btn-back" onClick={() => navigate('/admin/sales/Customer')}>
                <FiArrowLeft size={18} /> Back to Customers
              </button>
              <div className="viewcustomer-header-actions">
                <button className="viewcustomer-btn-edit" onClick={handleEdit}>
                  <FiEdit2 size={18} /> Edit
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="viewcustomer-details-grid">

            {/* Basic Information */}
            <div className="viewcustomer-details-card viewcustomer-card-blue">
              <div className="viewcustomer-viewcustomer-card-header">
                <h2>Basic Information</h2>
                <div className="viewcustomer-viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Customer Name</span>
                  <span className="viewcustomer-value">{customer.customer}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Company</span>
                  <span className="viewcustomer-value">{customer.company || '-'}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Tax Type</span>
                  <span className="viewcustomer-value">{customer.taxType}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">TRN</span>
                  <span className="viewcustomer-value">{customer.trn || '-'}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Place of Supply</span>
                  <span className="viewcustomer-value">{customer.placeOfSupply}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="viewcustomer-details-card viewcustomer-card-teal">
              <div className="viewcustomer-card-header">
                <h2>Contact Information</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Email</span>
                  <span className="viewcustomer-value">{customer.email || '-'}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Phone</span>
                  <span className="viewcustomer-value ">{customer.phone || '-'}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Country</span>
                  <span className="viewcustomer-value">{customer.billingAddress?.country || '-'}</span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="viewcustomer-details-card viewcustomer-card-purple">
              <div className="viewcustomer-card-header">
                <h2>Financial Details</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Currency</span>
                  <span className="viewcustomer-value">{customer.currency}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Payment Terms</span>
                  <span className="viewcustomer-value">{customer.paymentTerms}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Tax Method</span>
                  <span className="viewcustomer-value">{customer.taxMethod}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Opening Balance</span>
                  <span className="viewcustomer-value ">{customer.openingBalance}</span>
                </div>
              </div>
            </div>

            {/* Catalogue & Tags - FIXED */}
            <div className="viewcustomer-details-card viewcustomer-card-orange">
              <div className="viewcustomer-card-header">
                <h2>Catalogue & Tags</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Catalogue</span>
                  <span className="viewcustomer-value">
                    {getCatalogueName()}
                  </span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Tags</span>
                  <div className="viewcustomer-value viewcustomer-tags-display">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map((t, i) => (
                        <span key={i} className="viewcustomer-tag">{t}</span>
                      ))
                    ) : (
                      <span className="viewcustomer-no-data">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="viewcustomer-details-card viewcustomer-card-red">
              <div className="viewcustomer-card-header">
                <h2>Billing Address</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                {customer.billingAddress ? (
                  <>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">Address</span>
                      <span className="viewcustomer-value">{customer.billingAddress.address || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">City</span>
                      <span className="viewcustomer-value">{customer.billingAddress.city || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">State/Region</span>
                      <span className="value">{customer.billingAddress.stateRegion || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">ZIP Code</span>
                      <span className="viewcustomer-value">{customer.billingAddress.zipPostalCode || '-'}</span>
                    </div>
                  </>
                ) : (
                  <p className="viewcustomer-no-data">No billing address</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="viewcustomer-details-card viewcustomer-card-indigo">
              <div className="viewcustomer-card-header">
                <h2>Shipping Address</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                {customer.shippingAddress?.sameAsBilling ? (
                  <p className="viewcustomer-same-as-text">Same as billing address</p>
                ) : customer.shippingAddress ? (
                  <>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">Contact</span>
                      <span className="viewcustomer-value">{customer.shippingAddress.contactPerson || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">Phone</span>
                      <span className="viewcustomer-value">{customer.shippingAddress.phone || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">Address</span>
                      <span className="value">{customer.shippingAddress.address || '-'}</span>
                    </div>
                    <div className="viewcustomer-detail-row">
                      <span className="viewcustomer-label">City</span>
                      <span className="viewcustomer-value">{customer.shippingAddress.city || '-'}</span>
                    </div>
                  </>
                ) : (
                  <p className="viewcustomer-no-data">No shipping address</p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="viewcustomer-details-card viewcustomer-card-indigo">
              <div className="viewcustomer-card-header">
                <h2>Additional Info</h2>
                <div className="viewcustomer-header-accent"></div>
              </div>
              <div className="viewcustomer-card-content">
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Created</span>
                  <span className="viewcustomer-value">{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="viewcustomer-detail-row">
                  <span className="viewcustomer-label">Last Updated</span>
                  <span className="viewcustomer-value">{new Date(customer.updatedAt).toLocaleDateString()}</span>
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