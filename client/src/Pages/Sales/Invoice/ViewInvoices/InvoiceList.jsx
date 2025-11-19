import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './InvoiceList.css';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('ID');
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [viewSettingsDropdownOpen, setViewSettingsDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dropdownValues, setDropdownValues] = useState({
    options: null,
    viewSettings: null
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;
  const API_URL = `${BACKEND_URL}/api/invoices/getAllInvoices`;

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

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setInvoices(response.data.data || []);
      setError('');
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'ID':
        return invoice._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
      case 'Title':
        return invoice.title.toLowerCase().includes(searchLower);
      case 'Status':
        return (invoice.status || '').toLowerCase().includes(searchLower);
      case 'Customer':
        return (invoice.customer?.company || '').toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    switch (sortConfig.key) {
      case 'ID':
        aValue = a._id.slice(-6).toUpperCase();
        bValue = b._id.slice(-6).toUpperCase();
        break;
      case 'Title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'Status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/invoices/deleteInvoice/${id}`);
        setInvoices(invoices.filter(i => i._id !== id));
      } catch (err) {
        setError('Failed to delete invoice');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/admin/sales/invoices/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/sales/invoices/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/admin/sales/invoices/create');
  };

  const handleBulkUpdate = () => {
    setDropdownValues(prev => ({ ...prev, options: 'Bulk Update' }));
    setOptionsDropdownOpen(false);
  };

  const handleBulkDelete = () => {
    setDropdownValues(prev => ({ ...prev, options: 'Bulk Delete' }));
    setOptionsDropdownOpen(false);
  };

  const handleSetAsDefault = () => {
    setDropdownValues(prev => ({ ...prev, viewSettings: 'Set as Default' }));
    setViewSettingsDropdownOpen(false);
  };

  const handleEditView = () => {
    setDropdownValues(prev => ({ ...prev, viewSettings: 'Edit View' }));
    setViewSettingsDropdownOpen(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Customer', 'Status', 'Date', 'Total'],
      ...filteredInvoices.map(inv => [
        inv._id.slice(-6).toUpperCase(),
        inv.title,
        inv.customer?.company || '',
        inv.status || '',
        new Date(inv.date).toLocaleDateString(),
        inv.total || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!user) return <div className="invoiceList-loading">Loading…</div>;

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
        <div className="invoiceList-wrapper">
          <div className="invoiceList-viewTabs">
            <span className="invoiceList-viewTab invoiceList-viewTab-active">Primary View</span>
          </div>

          <div className="invoiceList-headerContainer">
            <div className="invoiceList-headerContent">
              <h1 className="invoiceList-title">Invoices</h1>
            </div>
          </div>

          <div className="invoiceList-toolbarSection">
            <div className="invoiceList-toolbarButtons">
              <div className="invoiceList-dropdownWrapper">
                <button className="invoiceList-btnToolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  {dropdownValues.options ? dropdownValues.options : 'Options'} <FiChevronDown className="invoiceList-dropdownIcon" />
                </button>
                {optionsDropdownOpen && (
                  <div className="invoiceList-dropdownMenu">
                    <button className="invoiceList-dropdownItem" onClick={handleBulkUpdate}>Bulk Update</button>
                    <button className="invoiceList-dropdownItem" onClick={handleBulkDelete}>Bulk Delete</button>
                  </div>
                )}
              </div>

              <div className="invoiceList-dropdownWrapper">
                <button className="invoiceList-btnToolbar" onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}>
                  {dropdownValues.viewSettings ? dropdownValues.viewSettings : 'View Settings'} <FiChevronDown className="invoiceList-dropdownIcon" />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="invoiceList-dropdownMenu">
                    <button className="invoiceList-dropdownItem" onClick={handleSetAsDefault}>Set as Default</button>
                    <button className="invoiceList-dropdownItem" onClick={handleEditView}>Edit View</button>
                  </div>
                )}
              </div>

              <button className="invoiceList-btnToolbar">
                <FiFilter className="invoiceList-icon" /> Add Filter <FiChevronDown className="invoiceList-dropdownIcon" />
              </button>
            </div>

            <button className="invoiceList-btnCreate" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="invoiceList-searchExportSection">
            <div className="invoiceList-searchWrapper">
              <select 
                className="invoiceList-searchFieldSelect" 
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="ID">ID</option>
                <option value="Title">Title</option>
                <option value="Status">Status</option>
                <option value="Customer">Customer</option>
              </select>
              <input
                type="text"
                className="invoiceList-searchInput"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="invoiceList-btnExport" onClick={handleExport}>
              <FiDownload className="invoiceList-exportIcon" /> Export
            </button>
          </div>

          <div className="invoiceList-tableContainer">
            {error && <div className="invoiceList-errorMessage">{error}</div>}

            {loading ? (
              <div className="invoiceList-loading">Loading invoices...</div>
            ) : (
              <>
                <div className="invoiceList-tableWrapper">
                  <table className="invoiceList-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('ID')} className="invoiceList-sortableHeader">
                          ID {sortConfig.key === 'ID' && <span className="invoiceList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th onClick={() => handleSort('Title')} className="invoiceList-sortableHeader">
                          Title {sortConfig.key === 'Title' && <span className="invoiceList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Customer</th>
                        <th onClick={() => handleSort('Status')} className="invoiceList-sortableHeader">
                          Status {sortConfig.key === 'Status' && <span className="invoiceList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Date</th>
                        <th>Subtotal</th>
                        <th>Discount</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInvoices.length > 0 ? (
                        paginatedInvoices.map((invoice) => (
                          <tr key={invoice._id} className="invoiceList-row">
                            <td className="invoiceList-idCell">
                              {invoice._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="invoiceList-titleCell">{invoice.title}</td>
                            <td className="invoiceList-customerCell">{invoice.customer?.company || '-'}</td>
                            <td className={`invoiceList-statusCell invoiceList-status-${invoice.status?.toLowerCase()}`}>
                              {invoice.status || '-'}
                            </td>
                            <td>{new Date(invoice.date).toLocaleDateString()}</td>
                            <td>{invoice.subtotal ? `$${invoice.subtotal.toFixed(2)}` : '-'}</td>
                            <td>{invoice.discountAmount ? `$${invoice.discountAmount.toFixed(2)}` : '-'}</td>
                            <td className="invoiceList-totalCell">${invoice.total ? invoice.total.toFixed(2) : '0.00'}</td>
                            <td className="invoiceList-actionsCell">
                              <button
                                className="invoiceList-btnAction invoiceList-btnView"
                                onClick={() => handleView(invoice._id)}
                                title="View"
                              >
                                <AiOutlineEye />
                              </button>
                              <button
                                className="invoiceList-btnAction invoiceList-btnEdit"
                                onClick={() => handleEdit(invoice._id)}
                                title="Edit"
                              >
                                <AiOutlineEdit />
                              </button>
                              <button
                                className="invoiceList-btnAction invoiceList-btnDelete"
                                onClick={() => handleDelete(invoice._id)}
                                title="Delete"
                              >
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="invoiceList-noData">
                            No invoices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedInvoices.length > 0 && (
                  <div className="invoiceList-paginationContainer">
                    <div className="invoiceList-paginationInfo">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedInvoices.length)} of {sortedInvoices.length} invoices
                    </div>
                    <div className="invoiceList-paginationButtons">
                      <button
                        className="invoiceList-btnPagination"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </button>
                      <span className="invoiceList-paginationCounter">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="invoiceList-btnPagination"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default InvoiceList;
