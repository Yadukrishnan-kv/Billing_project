// src/pages/inventory/ViewInventory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiEdit2, FiPrinter } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './ViewInventory.css';               // <-- new CSS file (see below)

function ViewInventory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  // ───── Auth & Profile ─────
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

  // ───── Fetch Inventory ─────
  useEffect(() => {
    if (!user) return;
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/inventories/getInventoryById/${id}`);
        setInventory(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [id, BACKEND_URL, user]);

  // ───── Print ─────
  const handlePrint = () => window.print();

  // ───── Loading / Error ─────
  if (!user) return null;
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} collapsed={collapsed} setCollapsed={setCollapsed} />
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading inventory details...</p>
          </div>
        </main>
      </div>
    );
  }
  if (error || !inventory) {
    return (
      <div className="admin-layout">
        <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} collapsed={collapsed} setCollapsed={setCollapsed} />
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
          <div className="error-message">{error || 'Inventory not found'}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} collapsed={collapsed} setCollapsed={setCollapsed} />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="details-wrapper">

          {/* ─────── Header Card ─────── */}
          <div className="details-header-card">
            <div className="header-top">
              <button className="btn-back" onClick={() => navigate('/admin/inventory')}>
                <FiArrowLeft size={18} />
                Back to Inventory
              </button>

              <h1 className="supplier-title">{inventory.productName}</h1>

              <div className="header-actions">
                <button className="btn-edit" onClick={() => navigate(`/admin/inventory/edit/${id}`)}>
                  <FiEdit2 size={18} />
                  <span>Edit</span>
                </button>
                <button className="btn-edit" onClick={handlePrint} style={{ marginLeft: '8px' }}>
                  <FiPrinter size={18} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="header-meta">
              <div className="meta-item">
                <span className="meta-label">Item #</span>
                <span className="meta-value">{inventory.itemNumber}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Type</span>
                <span className="meta-value">{inventory.type}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Unit</span>
                <span className="meta-value">{inventory.unit}</span>
              </div>
            </div>
          </div>

          {/* ─────── Colored Cards Grid ─────── */}
          <div className="details-grid">

            {/* Basic Information */}
            <div className="details-card card-blue">
              <div className="card-header"><h2>Basic Information</h2><div className="header-accent"></div></div>
              <div className="card-content">
                <div className="detail-row"><span className="label">Product Name</span><span className="value">{inventory.productName}</span></div>
                <div className="detail-row"><span className="label">Item Number</span><span className="value">{inventory.itemNumber}</span></div>
                <div className="detail-row"><span className="label">Type</span><span className="value">{inventory.type}</span></div>
                <div className="detail-row"><span className="label">Unit</span><span className="value">{inventory.unit}</span></div>
                <div className="detail-row"><span className="label">Tax</span><span className="value">{inventory.tax}</span></div>
                <div className="detail-row"><span className="label">HSN/SAC</span><span className="value">{inventory.hsnSac}</span></div>
                <div className="detail-row"><span className="label">Offer</span><span className="value">{inventory.offer || 'N/A'}</span></div>
                <div className="detail-row"><span className="label">Item Group</span><span className="value">{inventory.itemGroup?.name || 'N/A'}</span></div>
              </div>
            </div>

            {/* Description */}
            {inventory.description && (
              <div className="details-card card-teal">
                <div className="card-header"><h2>Description</h2><div className="header-accent"></div></div>
                <div className="card-content">
                  <div className="detail-row description-row">
                    <span className="value">{inventory.description}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Details */}
            <div className="details-card card-purple">
              <div className="card-header"><h2>Purchase Details</h2><div className="header-accent"></div></div>
              <div className="card-content">
                {inventory.purchase.map((p, i) => (
                  <React.Fragment key={i}>
                    <div className="detail-row"><span className="label">Purchase Account</span><span className="value">{p.purchaseAccount}</span></div>
                    <div className="detail-row"><span className="label">Debit Note Account</span><span className="value">{p.debitNoteAccount}</span></div>
                    <div className="detail-row"><span className="label">Rate</span><span className="value">AED {Number(p.rate).toFixed(2)}</span></div>
                    {i < inventory.purchase.length - 1 && <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '12px 0' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Sales Details */}
            <div className="details-card card-orange">
              <div className="card-header"><h2>Sales Details</h2><div className="header-accent"></div></div>
              <div className="card-content">
                {inventory.sales.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="detail-row"><span className="label">Sale Account</span><span className="value">{s.saleAccount}</span></div>
                    <div className="detail-row"><span className="label">Credit Price Type</span><span className="value">{s.creditPriceType}</span></div>
                    <div className="detail-row"><span className="label">Note Account</span><span className="value">{s.noteAccount}</span></div>
                    <div className="detail-row"><span className="label">Rate</span><span className="value">AED {Number(s.rate).toFixed(2)}</span></div>
                    {i < inventory.sales.length - 1 && <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '12px 0' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Item Attributes / Stock */}
            <div className="details-card card-indigo">
              <div className="card-header"><h2>Stock & Attributes</h2><div className="header-accent"></div></div>
              <div className="card-content">
                {inventory.itemAttribute.map((a, i) => (
                  <React.Fragment key={i}>
                    <div className="detail-row"><span className="label">Track Inventory</span><span className="value">{a.trackInventory ? 'Yes' : 'No'}</span></div>
                    <div className="detail-row"><span className="label">Opening Stock</span><span className="value">{a.openingStock}</span></div>
                    <div className="detail-row"><span className="label">Opening Stock Value</span><span className="value">AED {Number(a.openingStockValue).toFixed(2)}</span></div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="details-card card-red">
              <div className="card-header"><h2>Metadata</h2><div className="header-accent"></div></div>
              <div className="card-content">
                <div className="detail-row"><span className="label">Created</span><span className="value">{new Date(inventory.createdAt).toLocaleString()}</span></div>
                <div className="detail-row"><span className="label">Last Updated</span><span className="value">{new Date(inventory.updatedAt).toLocaleString()}</span></div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewInventory;