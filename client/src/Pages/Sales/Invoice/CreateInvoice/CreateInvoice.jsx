// src/pages/invoices/CreateInvoice.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './CreateInvoice.css';

function CreateInvoice() {
  const { id: invoiceId } = useParams(); // ← Matches route /edit/:id
  const navigate = useNavigate();
  const isEditMode = !!invoiceId;

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  const [inventoryItems, setInventoryItems] = useState([]); // all fetched inventory
const [filteredInventory, setFilteredInventory] = useState([]); // filtered by search
const [itemSearch, setItemSearch] = useState(''); // current search term per row
const [showDropdownForRow, setShowDropdownForRow] = useState(null); // which row’s dropdown is open

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  const [formData, setFormData] = useState({
    customer: '',
    status: 'Draft',
    title: '',
    taxInclusive: 'No',
    showQuantityAs: 'Qty',
    date: new Date().toISOString().split('T')[0],
    paymentTerms: 'Due on Receipt',
    reference: '',
    salesPerson: '',
    discountMethod: 'Line Wise',
    trn: '',
    billingAddress: { address: '', city: '', stateRegion: '', zipPostalCode: '', country: '' },
    shippingAddress: {
      sameAsBilling: false,
      contactPerson: '',
      address: '',
      city: '',
      stateRegion: '',
      zipPostalCode: '',
      country: '',
      phone: ''
    },
    items: [{ itemName: '', qty: 0, price: 0, discount: 0, taxRate: 0 }],
    adjustment: 0,
    terms: 'Bank Details: Account Name : ZYDANS TECHNOLOGIES L.L.C\nBank Name : RAK\nA/c. No. : 0333620685001'
  });

  // === FETCH USER & CUSTOMERS ===
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

    fetchCustomers();
  }, [navigate, BACKEND_URL]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/customers/getCustomers`);
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  // === FETCH INVOICE FOR EDIT MODE ===
  useEffect(() => {
    if (!isEditMode) return;

    const fetchInvoice = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${BACKEND_URL}/api/invoices/getInvoiceById/${invoiceId}`);
        const inv = res.data.data;

        const formattedDate = new Date(inv.date).toISOString().split('T')[0];

        setFormData({
          customer: inv.customer?._id || '',
          status: inv.status || 'Draft',
          title: inv.title || '',
          taxInclusive: inv.taxInclusive || 'No',
          showQuantityAs: inv.showQuantityAs || 'Qty',
          date: formattedDate,
          paymentTerms: inv.paymentTerms || 'Due on Receipt',
          reference: inv.reference || '',
          salesPerson: inv.salesPerson || '',
          discountMethod: inv.discountMethod || 'Line Wise',
          trn: inv.trn || '',
          billingAddress: {
            address: inv.billingAddress?.address || '',
            city: inv.billingAddress?.city || '',
            stateRegion: inv.billingAddress?.stateRegion || '',
            zipPostalCode: inv.billingAddress?.zipPostalCode || '',
            country: inv.billingAddress?.country || ''
          },
          shippingAddress: {
            sameAsBilling: inv.shippingAddress?.sameAsBilling || false,
            contactPerson: inv.shippingAddress?.contactPerson || '',
            address: inv.shippingAddress?.address || '',
            city: inv.shippingAddress?.city || '',
            stateRegion: inv.shippingAddress?.stateRegion || '',
            zipPostalCode: inv.shippingAddress?.zipPostalCode || '',
            country: inv.shippingAddress?.country || '',
            phone: inv.shippingAddress?.phone || ''
          },
          items: (inv.items || []).map(item => ({
            itemName: item.itemName || '',
            qty: item.qty || 0,
            price: item.price || 0,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0
          })),
          adjustment: inv.adjustment || 0,
          terms: inv.terms || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoice');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, isEditMode, BACKEND_URL]);

  // === AUTO-FILL ON CUSTOMER CHANGE (CREATE MODE ONLY) ===
  useEffect(() => {
    if (!formData.customer || isEditMode) return;

    const selected = customers.find(c => c._id === formData.customer);
    if (!selected) return;

    const billing = selected.billingAddress || {};
    const shipping = selected.shippingAddress || {};

    setFormData(prev => ({
      ...prev,
      trn: selected.trn || '',
      billingAddress: {
        address: billing.address || '',
        city: billing.city || '',
        stateRegion: billing.stateRegion || '',
        zipPostalCode: billing.zipPostalCode || '',
        country: billing.country || ''
      },
      shippingAddress: {
        ...prev.shippingAddress,
        contactPerson: shipping.contactPerson || '',
        address: shipping.address || '',
        city: shipping.city || '',
        stateRegion: shipping.stateRegion || '',
        zipPostalCode: shipping.zipPostalCode || '',
        country: shipping.country || '',
        phone: shipping.phone || ''
      }
    }));
  }, [formData.customer, customers, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (i, field, value) => {
    const items = [...formData.items];
    items[i][field] = ['qty', 'price', 'discount', 'taxRate'].includes(field)
      ? parseFloat(value) || 0
      : value;
    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemName: '', qty: 0, price: 0, discount: 0, taxRate: 0 }]
    }));
  };

  const removeItem = (i) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i)
    }));
  };

  const handleSameAsBilling = (checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          sameAsBilling: true,
          contactPerson: prev.shippingAddress.contactPerson,
          ...prev.billingAddress
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        shippingAddress: { ...prev.shippingAddress, sameAsBilling: false }
      }));
    }
  };

  // === LIVE CALCULATION ===
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    formData.items.forEach(item => {
      const lineTotal = item.qty * item.price;
      const lineDiscount = lineTotal * (item.discount / 100);
      const taxable = lineTotal - lineDiscount;
      const tax = taxable * (item.taxRate / 100);
      subtotal += taxable;
      totalTax += tax;
    });

    const discountAmount = 0;
    const total = subtotal + totalTax - discountAmount + (parseFloat(formData.adjustment) || 0);

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      total: total.toFixed(2)
    };
  }, [formData.items, formData.adjustment]);


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
  
  // === SUBMIT (CREATE OR UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/invoices/updateInvoice/${invoiceId}`, formData);
      } else {
        await axios.post(`${BACKEND_URL}/api/invoices/createInvoice`, formData);
      }
      navigate('/admin/sales/Invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="createinvoice-loading">Loading…</div>;
  if (fetching) return <div className="createinvoice-loading">Loading invoice…</div>;

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
        <div className="createinvoice-container">
          <div className="createinvoice-header">
            <h1>
              {isEditMode
                ? `Edit Invoice #${invoiceId?.slice(-6).toUpperCase()}`
                : 'Create New Invoice'}
            </h1>
            <button
              className="createinvoice-btn-back"
              onClick={() => navigate('/admin/sales/Invoices')}
            >
              <FiArrowLeft /> Back
            </button>
          </div>

          {error && <div className="createinvoice-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="createinvoice-form">
            {/* CUSTOMER & STATUS */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
                <label>Customer <span className="createinvoice-required">*</span></label>
                <select name="customer" value={formData.customer} onChange={handleInputChange} required>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.customer} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="createinvoice-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* TITLE & TAX INCLUSIVE */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
                <label>Invoice Title <span className="createinvoice-required">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="createinvoice-group">
                <label>Tax Inclusive</label>
                <select name="taxInclusive" value={formData.taxInclusive} onChange={handleInputChange}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* ADDRESSES */}
            <div className="createinvoice-address-flex">
              <div className="createinvoice-address-col">
                <div className="createinvoice-section-title">Billing Address</div>
                <div className="createinvoice-address-card">
                  {formData.billingAddress.address ? (
                    <div className="address-content">
                      <p><strong>{formData.billingAddress.address}</strong></p>
                      <p>{formData.billingAddress.city}, {formData.billingAddress.stateRegion}</p>
                      <p>{formData.billingAddress.zipPostalCode}, {formData.billingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="address-placeholder">Select customer</p>
                  )}
                </div>
              </div>
              <div className="createinvoice-address-col">
                <div className="createinvoice-section-title">
                  Shipping Address
                  <label className="same-as-billing">
                    <input
                      type="checkbox"
                      checked={formData.shippingAddress.sameAsBilling}
                      onChange={e => handleSameAsBilling(e.target.checked)}
                    />{' '}
                    Same as Billing
                  </label>
                </div>
                <div className="createinvoice-address-card">
                  {formData.shippingAddress.address ? (
                    <div className="address-content">
                      {formData.shippingAddress.contactPerson && (
                        <p><strong>Contact:</strong> {formData.shippingAddress.contactPerson}</p>
                      )}
                      <p><strong>{formData.shippingAddress.address}</strong></p>
                      <p>{formData.shippingAddress.city}, {formData.shippingAddress.stateRegion}</p>
                      <p>{formData.shippingAddress.zipPostalCode}, {formData.shippingAddress.country}</p>
                      {formData.shippingAddress.phone && (
                        <p><strong>Phone:</strong> {formData.shippingAddress.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="address-placeholder">Select customer</p>
                  )}
                </div>
              </div>
            </div>

            {/* SHOW QTY & DATE */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
                <label>Show Quantity As</label>
                <select name="showQuantityAs" value={formData.showQuantityAs} onChange={handleInputChange}>
                  <option value="Qty">Qty</option>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                  <option value="Units">Units</option>
                </select>
              </div>
              <div className="createinvoice-group">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
            </div>

            {/* PAYMENT TERMS & REFERENCE */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
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
              <div className="createinvoice-group">
                <label>Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="PO #"
                />
              </div>
            </div>

            {/* SALES PERSON & DISCOUNT METHOD */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
                <label>Sales Person</label>
                <input
                  type="text"
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleInputChange}
                  placeholder="e.g. Balakrishnan"
                />
              </div>
              <div className="createinvoice-group">
                <label>Discount Method</label>
                <select name="discountMethod" value={formData.discountMethod} onChange={handleInputChange}>
                  <option value="Line Wise">Line Wise</option>
                  <option value="Bill Wise Before Tax">Bill Wise Before Tax</option>
                  <option value="Bill Wise After Tax">Bill Wise After Tax</option>
                </select>
              </div>
            </div>

            {/* TRN */}
            <div className="createinvoice-row">
              <div className="createinvoice-group">
                <label>TRN</label>
                <input type="text" value={formData.trn} disabled className="input-disabled" />
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="createinvoice-section-title">
              Invoice Items
              <button type="button" className="createinvoice-btn-add-item" onClick={addItem}>
                <FiPlus /> Add Item
              </button>
            </div>
            <div className="createinvoice-items-table-wrapper">
              <table className="createinvoice-items-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>{formData.showQuantityAs}</th>
                    <th>Price</th>
                    <th>Discount %</th>
                    <th>Tax Rate %</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, i) => (
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
                      <td>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => handleItemChange(i, 'qty', e.target.value)}
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(i, 'price', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.discount}
                          onChange={e => handleItemChange(i, 'discount', e.target.value)}
                          min="0"
                          max="100"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.taxRate}
                          onChange={e => handleItemChange(i, 'taxRate', e.target.value)}
                          min="0"
                          max="100"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="createinvoice-btn-remove-item"
                          onClick={() => removeItem(i)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="createinvoice-totals">
              <div className="total-row">
                <span>Subtotal:</span> <strong>AED {calculations.subtotal}</strong>
              </div>
              <div className="total-row">
                <span>Discount:</span> <strong>AED {calculations.discountAmount}</strong>
              </div>
              <div className="total-row">
                <span>Tax:</span> <strong>AED {calculations.totalTax}</strong>
              </div>
              <div className="total-row">
                <span>Adjustment:</span>
                <input
                  type="number"
                  name="adjustment"
                  value={formData.adjustment}
                  onChange={handleInputChange}
                  step="0.01"
                  style={{ width: '80px', marginLeft: '10px' }}
                />
              </div>
              <div className="total-row grand-total">
                <span>Total:</span> <strong>AED {calculations.total}</strong>
              </div>
            </div>

            {/* TERMS */}
            <div className="createinvoice-section-title">Terms & Conditions</div>
            <div className="createinvoice-row">
              <div className="createinvoice-group createinvoice-group-full">
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows="5"
                  className="createinvoice-textarea"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="createinvoice-actions">
              <button type="submit" className="createinvoice-btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Create Invoice'}
              </button>
              <button
                type="button"
                className="createinvoice-btn-cancel"
                onClick={() => navigate('/admin/sales/Invoices')}
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

export default CreateInvoice;