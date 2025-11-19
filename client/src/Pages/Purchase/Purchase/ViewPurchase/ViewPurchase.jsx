// src/pages/purchases/ViewPurchase.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiDownload, FiEdit, FiPrinter } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './ViewPurchase.css';

function ViewPurchase() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

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

    fetchPurchase();
  }, [navigate, BACKEND_URL, id]);

  const fetchPurchase = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/purchases/getPurchaseById/${id}`);
      setPurchase(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch purchase');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      window.open(`${BACKEND_URL}/api/purchases/downloadPurchasePDF/${id}/download`, '_blank');
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'published') return { label: 'Received', color: 'paid' };
    if (s === 'draft') return { label: 'Draft', color: 'draft' };
    return { label: status || 'Unknown', color: 'draft' };
  };

  const statusInfo = getStatusBadge(purchase?.status);

  if (!user) return <div className="viewPurchase-loading">Loading…</div>;
  if (loading) return <div className="viewPurchase-loading">Loading purchase...</div>;
  if (error) return <div className="viewPurchase-errorMessage">{error}</div>;
  if (!purchase) return <div className="viewPurchase-errorMessage">Purchase not found</div>;

  return (
    <div className="admin-layout">
      <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} collapsed={collapsed} setCollapsed={setCollapsed} />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="viewPurchase-wrapper">
          <div className="viewPurchase-toolbar">
            <button className="viewPurchase-btnBack" onClick={() => navigate('/admin/purchases')}>
              <FiArrowLeft /> Back to Purchases
            </button>
            <div className="viewPurchase-actions">
              <button className="viewPurchase-btnPrint" onClick={handlePrint} title="Print Purchase">
                <FiPrinter /> Print
              </button>
              <button className="viewPurchase-btnEdit" onClick={() => navigate(`/admin/purchases/edit/${id}`)}>
                <FiEdit /> Edit
              </button>
              <button className="viewPurchase-btnDownload" onClick={handleDownloadPDF}>
                <FiDownload /> PDF
              </button>
            </div>
          </div>

          <div className="viewPurchase-document">
            {/* Purchase Header */}
            <div className="viewPurchase-invoiceHeader">
              <div className="viewPurchase-headerLeft">
                <h1 className="viewPurchase-invoiceTitle">PURCHASE BILL</h1>
                <p className="viewPurchase-invoiceNum">Bill #{purchase.billNumber || purchase._id.slice(-6).toUpperCase()}</p>
                <p className="viewPurchase-titleText">{purchase.title}</p>
              </div>
              <div className="viewPurchase-headerRight">
                <div className={`viewPurchase-statusBadge viewPurchase-status-${statusInfo.color}`}>
                  <span>{statusInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Supplier Address */}
            <div className="viewPurchase-addressSection">
              <div className="viewPurchase-addressBlock">
                <h4 className="viewPurchase-addressTitle">Supplier:</h4>
                <div className="viewPurchase-addressContent">
                  <p className="viewPurchase-strong">{purchase.supplier?.companyName || 'N/A'}</p>
                  {purchase.supplier?.contactPerson && <p>{purchase.supplier.contactPerson}</p>}
                  {purchase.billingAddress?.street && <p>{purchase.billingAddress.street}</p>}
                  {purchase.billingAddress?.city && <p>{purchase.billingAddress.city}, {purchase.billingAddress.state} {purchase.billingAddress.zipCode}</p>}
                  {purchase.billingAddress?.country && <p>{purchase.billingAddress.country}</p>}
                  {purchase.supplier?.email && <p className="viewPurchase-link">{purchase.supplier.email}</p>}
                  {purchase.supplier?.phone && <p>{purchase.supplier.phone}</p>}
                </div>
              </div>

              {purchase.shippingAddress?.street && (
                <div className="viewPurchase-addressBlock">
                  <h4 className="viewPurchase-addressTitle">Delivery Address:</h4>
                  <div className="viewPurchase-addressContent">
                    <p className="viewPurchase-strong">ZYDANS TECHNOLOGIES L.L.C</p>
                    <p>{purchase.shippingAddress.street}</p>
                    <p>{purchase.shippingAddress.city}, {purchase.shippingAddress.state} {purchase.shippingAddress.zipCode}</p>
                    <p>{purchase.shippingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Details */}
            <div className="viewPurchase-detailsGrid">
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Purchase Date:</span>
                <span className="viewPurchase-detailValue">
                  {new Date(purchase.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Payment Terms:</span>
                <span className="viewPurchase-detailValue">{purchase.paymentTerms || 'N/A'}</span>
              </div>
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Reference:</span>
                <span className="viewPurchase-detailValue">{purchase.references || 'N/A'}</span>
              </div>
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Discount Method:</span>
                <span className="viewPurchase-detailValue">{purchase.discountMethod || 'Line Wise'}</span>
              </div>
              {purchase.discountMethod !== 'Line Wise' && (
                <div className="viewPurchase-detailItem">
                  <span className="viewPurchase-detailLabel">Bill Discount:</span>
                  <span className="viewPurchase-detailValue">{purchase.discountValue}%</span>
                </div>
              )}
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Tax Inclusive:</span>
                <span className="viewPurchase-detailValue">{purchase.taxInclusive || 'No'}</span>
              </div>
              <div className="viewPurchase-detailItem">
                <span className="viewPurchase-detailLabel">Quantity Unit:</span>
                <span className="viewPurchase-detailValue">{purchase.showQuantityAs || 'Qty'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="viewPurchase-itemsSection">
              <table className="viewPurchase-itemsTable">
                <thead>
                  <tr className="viewPurchase-tableHeaderRow">
                    <th className="viewPurchase-thItemName">Item Name</th>
                    <th className="viewPurchase-thDescription">Description</th>
                    <th className="viewPurchase-thQty">{purchase.showQuantityAs}</th>
                    <th className="viewPurchase-thPrice">Unit Price</th>
                    <th className="viewPurchase-thDiscount">Discount %</th>
                    <th className="viewPurchase-thTotal">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items?.map((item, index) => {
                    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
                    return (
                      <tr key={index} className="viewPurchase-tableRow">
                        <td className="viewPurchase-itemName">{item.itemName || '—'}</td>
                        <td className="viewPurchase-itemDescription">{item.description || '—'}</td>
                        <td className="viewPurchase-itemQty">{item.quantity}</td>
                        <td className="viewPurchase-itemPrice">AED {item.unitPrice.toFixed(2)}</td>
                        <td className="viewPurchase-itemDiscount">{item.discount}%</td>
                        <td className="viewPurchase-itemTotal">AED {lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="viewPurchase-summarySection">
              <div className="viewPurchase-summaryContent">
                <div className="viewPurchase-summaryRow">
                  <span className="viewPurchase-summaryLabel">Subtotal:</span>
                  <span className="viewPurchase-summaryValue">AED {purchase.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="viewPurchase-summaryRow">
                  <span className="viewPurchase-summaryLabel">Tax (5% VAT):</span>
                  <span className="viewPurchase-summaryValue">AED {purchase.totalTax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="viewPurchase-summaryRow">
                  <span className="viewPurchase-summaryLabel">Total Discount:</span>
                  <span className="viewPurchase-summaryValue negative">-AED {purchase.discountAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="viewPurchase-summaryRow viewPurchase-totalRow">
                  <span className="viewPurchase-summaryLabel">Total Amount:</span>
                  <span className="viewPurchase-totalAmount">AED {purchase.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {purchase.notes && (
              <div className="viewPurchase-termsSection">
                <h4 className="viewPurchase-termsTitle">Notes</h4>
                <p className="viewPurchase-termsText">{purchase.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="viewPurchase-metadataSection">
              <div className="viewPurchase-metadataItem">
                <span className="viewPurchase-metaLabel">Created:</span>
                <span className="viewPurchase-metaValue">
                  {new Date(purchase.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="viewPurchase-metadataItem">
                <span className="viewPurchase-metaLabel">Last Updated:</span>
                <span className="viewPurchase-metaValue">
                  {new Date(purchase.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="viewPurchase-invoiceFooter">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewPurchase;