import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import '../CreateSupplier/SupplierForm.css';

function CreateSupplier() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplierName: '',
    company: '',
    taxType: 'Vat Registered',
    sourceOfSupply: '',
    trn: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    catalogue: 'Default',
    currency: 'United Arab Emirates Dirham - AED',
    tags: '',
    paymentTerms: 'Default',
    openingBalance: 'Amount Receivable/Amount Payable',
    taxMethod: 'Tax Exclusive',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United Arab Emirates',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      setError('Supplier name is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/suppliers/createSupplier`, formData);
      navigate('/admin/purchase/Suppliers');
    } catch (err) {
      setError('Failed to create supplier: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createsupplier-loading">Loading…</div>;

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
        <div className="createsupplier-container">
          <div className="createsupplier-header">
            <h1>Create New Supplier</h1>
            <button className="createsupplier-btn-back" onClick={() => navigate('/admin/purchase/Suppliers')}>
              Back
            </button>
          </div>
          {error && <div className="createsupplier-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="createsupplier-form">
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="supplierName">
                  Supplier <span className="createsupplier-required">*</span>
                </label>
                <input
                  type="text"
                  id="supplierName"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option>United Arab Emirates Dirham - AED</option>
                  <option>US Dollar - USD</option>
                  <option>Euro - EUR</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Enter tags"
                />
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="taxType">Tax Type</label>
                <select
                  id="taxType"
                  name="taxType"
                  value={formData.taxType}
                  onChange={handleChange}
                >
                  <option>Vat Registered</option>
                  <option>Non Vat Registered</option>
                </select>
              </div>
              <div className="createsupplier-group">
                <label htmlFor="paymentTerms">Payment Terms</label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                >
                  <option>Default</option>
                  <option>Net 30</option>
                  <option>Net 60</option>
                  <option>Net 90</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="sourceOfSupply">Source of Supply</label>
                <select
                  id="sourceOfSupply"
                  name="sourceOfSupply"
                  value={formData.sourceOfSupply}
                  onChange={handleChange}
                >
                  <option value="">Select source</option>
                  <option>Abu Dhabi</option>
                  <option>Dubai</option>
                  <option>Sharjah</option>
                </select>
              </div>
              <div className="createsupplier-group">
                <label htmlFor="openingBalance">Opening Balance</label>
                <select
                  id="openingBalance"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                >
                  <option>Amount Receivable/Amount Payable</option>
                  <option>Amount Receivable</option>
                  <option>Amount Payable</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="trn">TRN</label>
                <input
                  type="text"
                  id="trn"
                  name="trn"
                  value={formData.trn}
                  onChange={handleChange}
                  placeholder="Enter TRN"
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="taxMethod">Tax Method</label>
                <select
                  id="taxMethod"
                  name="taxMethod"
                  value={formData.taxMethod}
                  onChange={handleChange}
                >
                  <option>Tax Exclusive</option>
                  <option>Tax Inclusive</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="catalogue">Catalogue</label>
                <select
                  id="catalogue"
                  name="catalogue"
                  value={formData.catalogue}
                  onChange={handleChange}
                >
                  <option>Default</option>
                  <option>Standard</option>
                  <option>Premium</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="secondaryEmail">Secondary Email</label>
                <input
                  type="email"
                  id="secondaryEmail"
                  name="secondaryEmail"
                  value={formData.secondaryEmail}
                  onChange={handleChange}
                  placeholder="Enter secondary email"
                />
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="createsupplier-section-title">Billing Address</div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="state">State/Region</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state or region"
                />
              </div>
            </div>
            <div className="createsupplier-row">
              <div className="createsupplier-group">
                <label htmlFor="zipCode">ZIP/Postal Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="createsupplier-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option>United Arab Emirates</option>
                  <option>Saudi Arabia</option>
                  <option>Qatar</option>
                  <option>Oman</option>
                </select>
              </div>
            </div>
            <div className="createsupplier-actions">
              <button
                type="submit"
                className="createsupplier-btn-save"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="createsupplier-btn-cancel"
                onClick={() => navigate('/admin/purchase/Suppliers')}
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

export default CreateSupplier;