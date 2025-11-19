import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiDownload, FiEdit, FiCheck, FiClock, FiX, FiPrinter, FiShare2 } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './ViewInvoice.css';

function ViewInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [invoice, setInvoice] = useState(null);
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

    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/invoices/getInvoiceById/${id}`);
      setInvoice(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch invoice');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      window.open(`${BACKEND_URL}/api/invoices/downloadInvoicePDF/${id}/download`, '_blank');
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return <FiCheck className="viewInvoice-statusIcon" />;
      case 'draft':
        return <FiClock className="viewInvoice-statusIcon" />;
      case 'cancelled':
        return <FiX className="viewInvoice-statusIcon" />;
      default:
        return <FiClock className="viewInvoice-statusIcon" />;
    }
  };

  const calculateDaysUntilDue = () => {
    if (!invoice || !invoice.date) return null;
    const invoiceDate = new Date(invoice.date);
    const dueDate = new Date(invoiceDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const today = new Date();
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  if (!user) return <div className="viewInvoice-loading">Loading…</div>;
  if (loading) return <div className="viewInvoice-loading">Loading invoice...</div>;
  if (error) return <div className="viewInvoice-errorMessage">{error}</div>;
  if (!invoice) return <div className="viewInvoice-errorMessage">Invoice not found</div>;

  return (
    <div className="admin-layout">
      <AdminHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} collapsed={collapsed} setCollapsed={setCollapsed} />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="viewInvoice-wrapper">
          <div className="viewInvoice-toolbar">
            <button className="viewInvoice-btnBack" onClick={() => navigate('/admin/sales/Invoices')}>
              <FiArrowLeft /> Back to Invoices
            </button>
            <div className="viewInvoice-actions">
              <button className="viewInvoice-btnPrint" onClick={handlePrint} title="Print Invoice">
                <FiPrinter /> Print
              </button>
              <button className="viewInvoice-btnEdit" onClick={() => navigate(`/admin/invoices/edit/${id}`)}>
                <FiEdit /> Edit
              </button>
              <button className="viewInvoice-btnDownload" onClick={handleDownloadPDF}>
                <FiDownload /> PDF
              </button>
            </div>
          </div>

          <div className="viewInvoice-document">
            {/* Invoice Header */}
            <div className="viewInvoice-invoiceHeader">
              <div className="viewInvoice-headerLeft">
                <h1 className="viewInvoice-invoiceTitle">INVOICE</h1>
                <p className="viewInvoice-invoiceNum">Invoice #{invoice._id.slice(-6).toUpperCase()}</p>
                <p className="viewInvoice-titleText">{invoice.title}</p>
              </div>
              <div className="viewInvoice-headerRight">
                <div className={`viewInvoice-statusBadge viewInvoice-status-${invoice.status?.toLowerCase()}`}>
                  {getStatusIcon(invoice.status)}
                  <span>{invoice.status}</span>
                </div>
              </div>
            </div>

            {/* Bill To and Ship To Section */}
            <div className="viewInvoice-addressSection">
              <div className="viewInvoice-addressBlock">
                <h4 className="viewInvoice-addressTitle">Bill To:</h4>
                <div className="viewInvoice-addressContent">
                  <p className="viewInvoice-strong">{invoice.customer?.company || 'N/A'}</p>
                  <p>{invoice.customer?.customer || 'N/A'}</p>
                  {invoice.billingAddress?.address && <p>{invoice.billingAddress.address}</p>}
                  {invoice.billingAddress?.city && <p>{invoice.billingAddress.city}, {invoice.billingAddress.stateRegion} {invoice.billingAddress.zipPostalCode}</p>}
                  {invoice.billingAddress?.country && <p>{invoice.billingAddress.country}</p>}
                  {invoice.customer?.email && <p className="viewInvoice-link">{invoice.customer.email}</p>}
                  {invoice.customer?.phone && <p>{invoice.customer.phone}</p>}
                </div>
              </div>

              {!invoice.shippingAddress?.sameAsBilling && (
                <div className="viewInvoice-addressBlock">
                  <h4 className="viewInvoice-addressTitle">Ship To:</h4>
                  <div className="viewInvoice-addressContent">
                    {invoice.shippingAddress?.contactPerson && <p className="viewInvoice-strong">{invoice.shippingAddress.contactPerson}</p>}
                    {invoice.shippingAddress?.address && <p>{invoice.shippingAddress.address}</p>}
                    {invoice.shippingAddress?.city && <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.stateRegion} {invoice.shippingAddress.zipPostalCode}</p>}
                    {invoice.shippingAddress?.country && <p>{invoice.shippingAddress.country}</p>}
                    {invoice.shippingAddress?.phone && <p>{invoice.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Details Grid */}
            <div className="viewInvoice-detailsGrid">
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Invoice Date:</span>
                <span className="viewInvoice-detailValue">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Payment Terms:</span>
                <span className="viewInvoice-detailValue">{invoice.paymentTerms || 'N/A'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Reference:</span>
                <span className="viewInvoice-detailValue">{invoice.reference || 'N/A'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">TRN:</span>
                <span className="viewInvoice-detailValue">{invoice.trn || 'N/A'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Sales Person:</span>
                <span className="viewInvoice-detailValue">{invoice.salesPerson || 'N/A'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Discount Method:</span>
                <span className="viewInvoice-detailValue">{invoice.discountMethod || 'N/A'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Tax Inclusive:</span>
                <span className="viewInvoice-detailValue">{invoice.taxInclusive || 'No'}</span>
              </div>
              <div className="viewInvoice-detailItem">
                <span className="viewInvoice-detailLabel">Quantity Unit:</span>
                <span className="viewInvoice-detailValue">{invoice.showQuantityAs || 'Qty'}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="viewInvoice-itemsSection">
              <table className="viewInvoice-itemsTable">
                <thead>
                  <tr className="viewInvoice-tableHeaderRow">
                    <th className="viewInvoice-thItemName">Item Name</th>
                    <th className="viewInvoice-thQty">Qty</th>
                    <th className="viewInvoice-thPrice">Unit Price</th>
                    <th className="viewInvoice-thDiscount">Discount</th>
                    <th className="viewInvoice-thTax">Tax Rate</th>
                    <th className="viewInvoice-thTotal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.map((item, index) => (
                    <tr key={index} className="viewInvoice-tableRow">
                      <td className="viewInvoice-itemName">{item.itemName}</td>
                      <td className="viewInvoice-itemQty">{item.qty}</td>
                      <td className="viewInvoice-itemPrice">${item.price?.toFixed(2)}</td>
                      <td className="viewInvoice-itemDiscount">{item.discount}%</td>
                      <td className="viewInvoice-itemTax">{item.taxRate}%</td>
                      <td className="viewInvoice-itemTotal">${item.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="viewInvoice-summarySection">
              <div className="viewInvoice-summaryContent">
                <div className="viewInvoice-summaryRow">
                  <span className="viewInvoice-summaryLabel">Subtotal:</span>
                  <span className="viewInvoice-summaryValue">${invoice.subtotal?.toFixed(2)}</span>
                </div>
                <div className="viewInvoice-summaryRow">
                  <span className="viewInvoice-summaryLabel">Discount Amount:</span>
                  <span className="viewInvoice-summaryValue negative">-${invoice.discountAmount?.toFixed(2)}</span>
                </div>
                <div className="viewInvoice-summaryRow">
                  <span className="viewInvoice-summaryLabel">Adjustment:</span>
                  <span className="viewInvoice-summaryValue">${invoice.adjustment?.toFixed(2)}</span>
                </div>
                <div className="viewInvoice-summaryRow viewInvoice-totalRow">
                  <span className="viewInvoice-summaryLabel">Total Amount Due:</span>
                  <span className="viewInvoice-totalAmount">${invoice.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms Section */}
            {invoice.terms && (
              <div className="viewInvoice-termsSection">
                <h4 className="viewInvoice-termsTitle">Terms & Conditions</h4>
                <p className="viewInvoice-termsText">{invoice.terms}</p>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="viewInvoice-metadataSection">
              <div className="viewInvoice-metadataItem">
                <span className="viewInvoice-metaLabel">Created:</span>
                <span className="viewInvoice-metaValue">{new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="viewInvoice-metadataItem">
                <span className="viewInvoice-metaLabel">Last Updated:</span>
                <span className="viewInvoice-metaValue">{new Date(invoice.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="viewInvoice-invoiceFooter">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewInvoice;
