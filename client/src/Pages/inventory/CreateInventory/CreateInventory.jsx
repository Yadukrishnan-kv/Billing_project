// src/pages/inventory/CreateInventory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './CreateInventory.css';

function CreateInventory() {
  const { id: inventoryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!inventoryId;

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [itemGroups, setItemGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  const [formData, setFormData] = useState({
    type: 'product',
    productName: '',
    itemNumber: '',
    unit: '',
    tax: 'Vat-5.00%',
    hsnSac: '',
    offer: '',
    description: '',
    purchase: [{ purchaseAccount: '', debitNoteAccount: '', rate: 0 }],
    sales: [{ saleAccount: '', creditPriceType: '', noteAccount: '', rate: 0 }],
    itemAttribute: [{ trackInventory: false, openingStock: 0, openingStockValue: 0 }],
    itemGroup: ''
  });

  // ... (all useEffect, fetchItemGroups, fetchInventory remain exactly the same)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    axios.get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUser(res.data.user)).catch(() => {
      localStorage.clear(); navigate('/');
    });

    fetchItemGroups();
  }, [navigate, BACKEND_URL]);

  const fetchItemGroups = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/itemgroups/getAllItemGroups`);
      setItemGroups(res.data.data || []);
    } catch (err) { console.error('Failed to fetch item groups:', err); }
  };

  useEffect(() => {
    if (!isEditMode) return;
    const fetchInventory = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${BACKEND_URL}/api/inventories/getInventoryById/${inventoryId}`);
        const inv = res.data.data;

        setFormData({
          type: inv.type || 'product',
          productName: inv.productName || '',
          itemNumber: inv.itemNumber || '',
          unit: inv.unit || '',
          tax: inv.tax || 'Vat-5.00%',
          hsnSac: inv.hsnSac || '',
          offer: inv.offer || '',
          description: inv.description || '',
          purchase: inv.purchase?.length ? inv.purchase : [{ purchaseAccount: '', debitNoteAccount: '', rate: 0 }],
          sales: inv.sales?.length ? inv.sales : [{ saleAccount: '', creditPriceType: '', noteAccount: '', rate: 0 }],
          itemAttribute: inv.itemAttribute?.length ? inv.itemAttribute : [{ trackInventory: false, openingStock: 0, openingStockValue: 0 }],
          itemGroup: inv.itemGroup?._id || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load inventory');
      } finally {
        setFetching(false);
      }
    };
    fetchInventory();
  }, [inventoryId, isEditMode, BACKEND_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Purchase handlers
  const handlePurchaseChange = (i, field, value) => {
    const purchase = [...formData.purchase];
    purchase[i][field] = field === 'rate' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, purchase }));
  };
  const addPurchase = () => setFormData(prev => ({ ...prev, purchase: [...prev.purchase, { purchaseAccount: '', debitNoteAccount: '', rate: 0 }] }));
  const removePurchase = (i) => setFormData(prev => ({ ...prev, purchase: prev.purchase.filter((_, idx) => idx !== i) }));

  // Sales handlers
  const handleSalesChange = (i, field, value) => {
    const sales = [...formData.sales];
    sales[i][field] = field === 'rate' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, sales }));
  };
  const addSales = () => setFormData(prev => ({ ...prev, sales: [...prev.sales, { saleAccount: '', creditPriceType: '', noteAccount: '', rate: 0 }] }));
  const removeSales = (i) => setFormData(prev => ({ ...prev, sales: prev.sales.filter((_, idx) => idx !== i) }));

  // Attribute handlers
  const handleAttributeChange = (i, field, value) => {
    const itemAttribute = [...formData.itemAttribute];
    itemAttribute[i][field] = field === 'trackInventory' ? value === 'true' : parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, itemAttribute }));
  };
  const addAttribute = () => setFormData(prev => ({ ...prev, itemAttribute: [...prev.itemAttribute, { trackInventory: false, openingStock: 0, openingStockValue: 0 }] }));
  const removeAttribute = (i) => setFormData(prev => ({ ...prev, itemAttribute: prev.itemAttribute.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/inventories/updateInventory/${inventoryId}`, formData);
      } else {
        await axios.post(`${BACKEND_URL}/api/inventories/createInventory`, formData);
      }
      navigate('/admin/items/Inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createinventory-loading">Loading…</div>;
  if (fetching) return <div className="createinventory-loading">Loading inventory…</div>;

  return (
    <div className="admin-layout">
      <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} collapsed={collapsed} setCollapsed={setCollapsed} />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} openMenu={openMenu} setOpenMenu={setOpenMenu} />
      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="createinventory-container">
          <div className="createinventory-header">
            <h1>{isEditMode ? `Edit Inventory #${inventoryId?.slice(-6).toUpperCase()}` : 'Create New Inventory'}</h1>
            <button className="createinventory-btn-back" onClick={() => navigate('/admin/inventory')}>
              <FiArrowLeft /> Back
            </button>
          </div>

          {error && <div className="createinventory-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="createinventory-form">

            {/* Basic Info */}
            <div className="createinventory-row">
              <div className="createinventory-group">
                <label>Type <span className="createinventory-required">*</span></label>
                <select name="type" value={formData.type} onChange={handleInputChange} required>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div className="createinventory-group">
                <label>Product Name <span className="createinventory-required">*</span></label>
                <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="createinventory-row">
              <div className="createinventory-group">
                <label>Item Number <span className="createinventory-required">*</span></label>
                <input type="text" name="itemNumber" value={formData.itemNumber} onChange={handleInputChange} required />
              </div>
              <div className="createinventory-group">
                <label>Unit <span className="createinventory-required">*</span></label>
                <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="createinventory-row">
              <div className="createinventory-group">
                <label>Tax</label>
                <select name="tax" value={formData.tax} onChange={handleInputChange}>
                  <option value="Vat-5.00%">Vat-5.00%</option>
                  <option value="zero rate-0.00%">Zero rate-0.00%</option>
                </select>
              </div>
              <div className="createinventory-group">
                <label>HSN / SAC <span className="createinventory-required">*</span></label>
                <input type="text" name="hsnSac" value={formData.hsnSac} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="createinventory-row">
              <div className="createinventory-group">
                <label>Offer</label>
                <input type="text" name="offer" value={formData.offer} onChange={handleInputChange} />
              </div>
              <div className="createinventory-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
              </div>
            </div>

            {/* Purchase Details - Free Form */}
            <div className="createinventory-section-title">
              Purchase Details
              <button type="button" className="createinventory-btn-add-item" onClick={addPurchase}>
                <FiPlus /> Add Purchase
              </button>
            </div>
            {formData.purchase.map((pur, i) => (
              <div key={i} className="createinventory-dynamic-section">
                <div className="createinventory-row">
                  <div className="createinventory-group">
                    <label>Purchase Account</label>
                    <input value={pur.purchaseAccount} onChange={e => handlePurchaseChange(i, 'purchaseAccount', e.target.value)} />
                  </div>
                  <div className="createinventory-group">
                    <label>Debit Note Account</label>
                    <input value={pur.debitNoteAccount} onChange={e => handlePurchaseChange(i, 'debitNoteAccount', e.target.value)} />
                  </div>
                  <div className="createinventory-group">
                    <label>Rate</label>
                    <input type="number" value={pur.rate} onChange={e => handlePurchaseChange(i, 'rate', e.target.value)} min="0" step="0.01" />
                  </div>
                  {formData.purchase.length > 1 && (
                    <button type="button" className="createinventory-btn-remove-section" onClick={() => removePurchase(i)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Sales Details - Free Form */}
            <div className="createinventory-section-title">
              Sales Details
              <button type="button" className="createinventory-btn-add-item" onClick={addSales}>
                <FiPlus /> Add Sale
              </button>
            </div>
            {formData.sales.map((sale, i) => (
              <div key={i} className="createinventory-dynamic-section">
                <div className="createinventory-row">
                  <div className="createinventory-group">
                    <label>Sale Account</label>
                    <input value={sale.saleAccount} onChange={e => handleSalesChange(i, 'saleAccount', e.target.value)} />
                  </div>
                  <div className="createinventory-group">
                    <label>Credit Price Type</label>
                    <input value={sale.creditPriceType} onChange={e => handleSalesChange(i, 'creditPriceType', e.target.value)} />
                  </div>
                  <div className="createinventory-group">
                    <label>Note Account</label>
                    <input value={sale.noteAccount} onChange={e => handleSalesChange(i, 'noteAccount', e.target.value)} />
                  </div>
                  <div className="createinventory-group">
                    <label>Rate</label>
                    <input type="number" value={sale.rate} onChange={e => handleSalesChange(i, 'rate', e.target.value)} min="0" step="0.01" />
                  </div>
                  {formData.sales.length > 1 && (
                    <button type="button" className="createinventory-btn-remove-section" onClick={() => removeSales(i)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Item Attributes - Free Form */}
            <div className="createinventory-section-title">
              Item Attributes
              <button type="button" className="createinventory-btn-add-item" onClick={addAttribute}>
                <FiPlus /> Add Attribute
              </button>
            </div>
            {formData.itemAttribute.map((attr, i) => (
              <div key={i} className="createinventory-dynamic-section">
                <div className="createinventory-row">
                  <div className="createinventory-group">
                    <label>Track Inventory</label>
                    <select value={attr.trackInventory.toString()} onChange={e => handleAttributeChange(i, 'trackInventory', e.target.value)}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="createinventory-group">
                    <label>Opening Stock</label>
                    <input type="number" value={attr.openingStock} onChange={e => handleAttributeChange(i, 'openingStock', e.target.value)} min="0" />
                  </div>
                  <div className="createinventory-group">
                    <label>Opening Stock Value</label>
                    <input type="number" value={attr.openingStockValue} onChange={e => handleAttributeChange(i, 'openingStockValue', e.target.value)} min="0" step="0.01" />
                  </div>
                  {formData.itemAttribute.length > 1 && (
                    <button type="button" className="createinventory-btn-remove-section" onClick={() => removeAttribute(i)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Item Group */}
            <div className="createinventory-row">
              <div className="createinventory-group">
                <label>Item Group <span className="createinventory-required">*</span></label>
                <select name="itemGroup" value={formData.itemGroup} onChange={handleInputChange} required>
                  <option value="">Select Item Group</option>
                  {itemGroups.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="createinventory-actions">
              <button type="submit" className="createinventory-btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Inventory' : 'Create Inventory'}
              </button>
              <button type="button" className="createinventory-btn-cancel" onClick={() => navigate('/admin/items/Inventory')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateInventory;