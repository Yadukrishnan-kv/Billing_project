// src/pages/purchases/CreatePurchase.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './CreatePurchase.css';

function CreatePurchase() {
  const { id: purchaseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!purchaseId;

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

   const [inventoryItems, setInventoryItems] = useState([]); // all fetched inventory
  const [filteredInventory, setFilteredInventory] = useState([]); // filtered by search
  const [itemSearch, setItemSearch] = useState(''); // current search term per row
  const [showDropdownForRow, setShowDropdownForRow] = useState(null); // which row’s dropdown is open

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  const [formData, setFormData] = useState({
    billNumber: '',
    supplier: '',
    title: '',
    status: 'Draft',
    taxInclusive: 'No',
    showQuantityAs: 'Qty',
    date: new Date().toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    references: '',
    discountMethod: 'Line Wise',
    discountValue: 0,
    billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    items: [
      {
        itemId: '',
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0
      }
    ],
    notes: ''
  });

  // Fetch user & suppliers
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

    fetchSuppliers();
  }, [navigate, BACKEND_URL]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/suppliers/getAllSuppliers`);
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  useEffect(() => {
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/inventories/getAllInventories?limit=1000`); // get all (or paginate if large)
      setInventoryItems(res.data.data || []);
      setFilteredInventory(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  fetchInventory();
}, [BACKEND_URL]);

  // Fetch purchase in Edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPurchase = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${BACKEND_URL}/api/purchases/getPurchaseById/${purchaseId}`);
        const pur = res.data.data;

        setFormData({
          billNumber: pur.billNumber || '',
          supplier: pur.supplier?._id || '',
          title: pur.title || '',
          status: pur.status || 'Draft',
          taxInclusive: pur.taxInclusive || 'No',
          showQuantityAs: pur.showQuantityAs || 'Qty',
          date: new Date(pur.date).toISOString().split('T')[0],
          paymentTerms: pur.paymentTerms || 'Net 30',
          references: pur.references || '',
          discountMethod: pur.discountMethod || 'Line Wise',
          discountValue: pur.discountValue || 0,
          billingAddress: pur.billingAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
          shippingAddress: pur.shippingAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
          items: (pur.items || []).map(item => ({
            itemId: item.itemId?._id || '',
            itemName: item.itemName || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            discount: item.discount || 0,
            total: item.total || 0
          })),
          notes: pur.notes || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load purchase');
      } finally {
        setFetching(false);
      }
    };

    fetchPurchase();
  }, [purchaseId, isEditMode, BACKEND_URL]);

  // AUTO-FILL BOTH BILLING & SHIPPING ADDRESS FROM SUPPLIER (Create & Edit)
  useEffect(() => {
    if (!formData.supplier) {
      setFormData(prev => ({
        ...prev,
        billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' }
      }));
      return;
    }

    const selected = suppliers.find(s => s._id === formData.supplier);
    if (!selected) return;

    const address = {
      street: selected.address || '',
      city: selected.city || '',
      state: selected.state || '',
      zipCode: selected.zipCode || '',
      country: selected.country || 'United Arab Emirates'
    };

    setFormData(prev => ({
      ...prev,
      billingAddress: address,
      shippingAddress: address  // Same address for both
    }));
  }, [formData.supplier, suppliers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (i, field, value) => {
    const items = [...formData.items];
    items[i][field] = ['quantity', 'unitPrice', 'discount'].includes(field)
      ? parseFloat(value) || 0
      : value;

    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemId: '',
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0
      }]
    }));
  };

  const removeItem = (i) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i)
    }));
  };

  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    let lineDiscountTotal = 0;

    formData.items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discount / 100);
      const taxable = lineTotal - lineDiscount;
      const tax = taxable * 0.05;
      subtotal += taxable;
      totalTax += tax;
      lineDiscountTotal += lineDiscount;
    });

    let billDiscount = 0;
    if (formData.discountMethod === 'Bill Wise Before Tax') {
      billDiscount = subtotal * (formData.discountValue / 100);
    } else if (formData.discountMethod === 'Bill Wise After Tax') {
      billDiscount = (subtotal + totalTax) * (formData.discountValue / 100);
    }

    const total = subtotal + totalTax - billDiscount - lineDiscountTotal;

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      discountAmount: (lineDiscountTotal + billDiscount).toFixed(2),
      total: total.toFixed(2)
    };
  }, [formData.items, formData.discountMethod, formData.discountValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/purchases/updatePurchase/${purchaseId}`, formData);
      } else {
        await axios.post(`${BACKEND_URL}/api/purchases/createPurchase`, formData);
      }
      navigate('/admin/Purchase/Purchase-Bill');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createpurchase-loading">Loading…</div>;
  if (fetching) return <div className="createpurchase-loading">Loading purchase…</div>;

  const selectedSupplier = suppliers.find(s => s._id === formData.supplier);

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
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} openMenu={openMenu} setOpenMenu={setOpenMenu} />

      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="createpurchase-container">
          <div className="createpurchase-header">
            <h1>{isEditMode ? `Edit Purchase #${formData.billNumber || purchaseId?.slice(-6)}` : 'Create New Purchase'}</h1>
            <button className="createpurchase-btn-back" onClick={() => navigate('/admin/Purchase/Purchase-Bill')}>
              <FiArrowLeft /> Back
            </button>
          </div>

          {error && <div className="createpurchase-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="createpurchase-form">
            
            {/* Supplier & Bill Number */}
            <div className="createpurchase-row">
              <div className="createpurchase-group">
                <label>Supplier <span className="createpurchase-required">*</span></label>
                <select name="supplier" value={formData.supplier} onChange={handleInputChange} required>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="createpurchase-group">
                <label>Bill Number <span className="createpurchase-required">*</span></label>
                <input type="text" name="billNumber" value={formData.billNumber} onChange={handleInputChange} required />
              </div>
            </div>

            {/* Title & Status */}
            <div className="createpurchase-row">
              <div className="createpurchase-group">
                <label>Purchase Title <span className="createpurchase-required">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="createpurchase-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Address Cards */}
            <div className="createpurchase-address-flex">
              <div className="createpurchase-address-col">
                <div className="createpurchase-section-title">Billing Address</div>
                <div className="createpurchase-address-card">
                  {formData.billingAddress.street ? (
                    <div className="address-content">
                      <p>{formData.billingAddress.street}</p>
                      <p>{formData.billingAddress.city}, {formData.billingAddress.state} {formData.billingAddress.zipCode}</p>
                      <p>{formData.billingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="address-placeholder">Select a supplier to load address</p>
                  )}
                </div>
              </div>

              <div className="createpurchase-address-col">
                <div className="createpurchase-section-title">Shipping Address (Same as Billing)</div>
                <div className="createpurchase-address-card">
                  {formData.shippingAddress.street ? (
                    <div className="address-content">
                      <p>{formData.shippingAddress.street}</p>
                      <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
                      <p>{formData.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="address-placeholder">Select a supplier to load address</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of form - unchanged */}
            <div className="createpurchase-row">
              <div className="createpurchase-group">
                <label>Show Quantity As</label>
                <select name="showQuantityAs" value={formData.showQuantityAs} onChange={handleInputChange}>
                  <option value="Qty">Qty</option>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                  <option value="Units">Units</option>
                </select>
              </div>
              <div className="createpurchase-group">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
            </div>

            <div className="createpurchase-row">
              <div className="createpurchase-group">
                <label>Payment Terms</label>
                <select name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange}>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 1">Net 1</option>
                  <option value="Net 3">Net 3</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 10">Net 10</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div className="createpurchase-group">
                <label>Reference</label>
                <input type="text" name="references" value={formData.references} onChange={handleInputChange} placeholder="PO #" />
              </div>
            </div>

            <div className="createpurchase-row">
              <div className="createpurchase-group">
                <label>Discount Method</label>
                <select name="discountMethod" value={formData.discountMethod} onChange={handleInputChange}>
                  <option value="Line Wise">Line Wise</option>
                  <option value="Bill Wise Before Tax">Bill Wise Before Tax</option>
                  <option value="Bill Wise After Tax">Bill Wise After Tax</option>
                </select>
              </div>
              {formData.discountMethod !== 'Line Wise' && (
                <div className="createpurchase-group">
                  <label>Discount Value (%)</label>
                  <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} min="0" max="100" step="0.01" />
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="createpurchase-section-title">
              Purchase Items
              <button type="button" className="createpurchase-btn-add-item" onClick={addItem}>
                <FiPlus /> Add Item
              </button>
            </div>

            <div className="createpurchase-items-table-wrapper">
              <table className="createpurchase-items-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>{formData.showQuantityAs}</th>
                    <th>Unit Price</th>
                    <th>Discount %</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, i) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const discounted = lineTotal * (1 - item.discount / 100);
                    return (
                      <tr key={i}>
                          <td className="item-name-cell">
  <div className="item-search-wrapper">
    <input
      type="text"
      className="item-search-input"
      placeholder="Choose the product..."
      value={item.itemName}
      onFocus={() => {
        setItemSearch(item.itemName || '');
        setFilteredInventory(inventoryItems);
        setShowDropdownForRow(i);
      }}
      onChange={(e) => {
        const value = e.target.value;
        handleItemChange(i, 'itemName', value);
        setItemSearch(value);

        const filtered = value.trim()
          ? inventoryItems.filter(inv =>
              inv.productName.toLowerCase().includes(value.toLowerCase())
            )
          : inventoryItems;

        setFilteredInventory(filtered);
        setShowDropdownForRow(i);
      }}
      onBlur={() => setTimeout(() => setShowDropdownForRow(null), 180)}
    />

    {/* DROPDOWN — NOW ON TOP */}
    {showDropdownForRow === i && filteredInventory.length > 0 && (
      <div className="item-search-dropdown">
        {filteredInventory.map((inv) => (
          <div
            key={inv._id}
            className="item-search-option"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              handleItemChange(i, 'itemName', inv.productName);
              if (inv.sales?.[0]?.rate) {
                handleItemChange(i, 'price', inv.sales[0].rate);
              }
              setShowDropdownForRow(null);
            }}
          >
            <div className="item-search-main">
              <strong>{inv.productName}</strong>
            </div>
           
          </div>
        ))}
      </div>
    )}
  </div>
</td>
                        <td><input value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} /></td>
                        <td><input type="number" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} min="1" required /></td>
                        <td><input type="number" value={item.unitPrice} onChange={e => handleItemChange(i, 'unitPrice', e.target.value)} step="0.01" min="0" required /></td>
                        <td><input type="number" value={item.discount} onChange={e => handleItemChange(i, 'discount', e.target.value)} min="0" max="100" /></td>
                        <td><strong>AED {discounted.toFixed(2)}</strong></td>
                        <td>
                          <button type="button" className="createpurchase-btn-remove-item" onClick={() => removeItem(i)}>
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="createpurchase-totals">
              <div className="total-row"><span>Subtotal:</span> <strong>AED {calculations.subtotal}</strong></div>
              <div className="total-row"><span>Tax (5% VAT):</span> <strong>AED {calculations.totalTax}</strong></div>
              <div className="total-row"><span>Total Discount:</span> <strong>-AED {calculations.discountAmount}</strong></div>
              <div className="total-row grand-total"><span>Total Amount:</span> <strong>AED {calculations.total}</strong></div>
            </div>

            <div className="createpurchase-section-title">Notes</div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="5"
              className="createpurchase-textarea"
              placeholder="Any additional notes..."
            />

            <div className="createpurchase-actions">
              <button type="submit" className="createpurchase-btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Purchase' : 'Create Purchase'}
              </button>
              <button type="button" className="createpurchase-btn-cancel" onClick={() => navigate('/admin/purchases')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreatePurchase;