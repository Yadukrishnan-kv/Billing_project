// src/pages/purchases/PurchaseList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import './PurchaseList.css';

function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
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
  const API_URL = `${BACKEND_URL}/api/purchases/getAllPurchases`;

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
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setPurchases(response.data.data || []);
      setError('');
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'ID':
        return purchase.billNumber?.toUpperCase().includes(searchQuery.toUpperCase()) ||
               purchase._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
      case 'Title':
        return purchase.title.toLowerCase().includes(searchLower);
      case 'Status':
        return (purchase.status || '').toLowerCase().includes(searchLower);
      case 'Supplier':
        return (purchase.supplier?.companyName || '').toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    switch (sortConfig.key) {
      case 'ID':
        aValue = a.billNumber || a._id.slice(-6).toUpperCase();
        bValue = b.billNumber || b._id.slice(-6).toUpperCase();
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
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/purchases/deletePurchase/${id}`);
        setPurchases(purchases.filter(p => p._id !== id));
      } catch (err) {
        setError('Failed to delete purchase');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/admin/purchase/Purchase-Bill/ViewPurchase/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/purchase/Purchase-Bill/editt/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/admin/purchase/Purchase-Bill/CreatePurchase');
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
      ['Bill No', 'Title', 'Supplier', 'Status', 'Date', 'Subtotal', 'Discount', 'Total'],
      ...filteredPurchases.map(pur => [
        pur.billNumber || pur._id.slice(-6).toUpperCase(),
        pur.title,
        pur.supplier?.companyName || '',
        pur.status || '',
        new Date(pur.date).toLocaleDateString(),
        pur.subtotal?.toFixed(2) || '0.00',
        pur.discountAmount?.toFixed(2) || '0.00',
        pur.total?.toFixed(2) || '0.00'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases.csv';
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

  const totalPages = Math.ceil(sortedPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPurchases = sortedPurchases.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!user) return <div className="purchaseList-loading">Loading…</div>;

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
        <div className="purchaseList-wrapper">
          <div className="purchaseList-viewTabs">
            <span className="purchaseList-viewTab purchaseList-viewTab-active">Primary View</span>
          </div>

          <div className="purchaseList-headerContainer">
            <div className="purchaseList-headerContent">
              <h1 className="purchaseList-title">Purchases</h1>
            </div>
          </div>

          <div className="purchaseList-toolbarSection">
            <div className="purchaseList-toolbarButtons">
              <div className="purchaseList-dropdownWrapper">
                <button className="purchaseList-btnToolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  {dropdownValues.options || 'Options'} <FiChevronDown className="purchaseList-dropdownIcon" />
                </button>
                {optionsDropdownOpen && (
                  <div className="purchaseList-dropdownMenu">
                    <button className="purchaseList-dropdownItem" onClick={handleBulkUpdate}>Bulk Update</button>
                    <button className="purchaseList-dropdownItem" onClick={handleBulkDelete}>Bulk Delete</button>
                  </div>
                )}
              </div>

              <div className="purchaseList-dropdownWrapper">
                <button className="purchaseList-btnToolbar" onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}>
                  {dropdownValues.viewSettings || 'View Settings'} <FiChevronDown className="purchaseList-dropdownIcon" />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="purchaseList-dropdownMenu">
                    <button className="purchaseList-dropdownItem" onClick={handleSetAsDefault}>Set as Default</button>
                    <button className="purchaseList-dropdownItem" onClick={handleEditView}>Edit View</button>
                  </div>
                )}
              </div>

              <button className="purchaseList-btnToolbar">
                <FiFilter className="purchaseList-icon" /> Add Filter <FiChevronDown className="purchaseList-dropdownIcon" />
              </button>
            </div>

            <button className="purchaseList-btnCreate" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="purchaseList-searchExportSection">
            <div className="purchaseList-searchWrapper">
              <select 
                className="purchaseList-searchFieldSelect" 
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="ID">Bill No / ID</option>
                <option value="Title">Title</option>
                <option value="Status">Status</option>
                <option value="Supplier">Supplier</option>
              </select>
              <input
                type="text"
                className="purchaseList-searchInput"
                placeholder="Search purchases..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="purchaseList-btnExport" onClick={handleExport}>
              <FiDownload className="purchaseList-exportIcon" /> Export
            </button>
          </div>

          <div className="purchaseList-tableContainer">
            {error && <div className="purchaseList-errorMessage">{error}</div>}

            {loading ? (
              <div className="purchaseList-loading">Loading purchases...</div>
            ) : (
              <>
                <div className="purchaseList-tableWrapper">
                  <table className="purchaseList-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('ID')} className="purchaseList-sortableHeader">
                          Bill No {sortConfig.key === 'ID' && <span className="purchaseList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th onClick={() => handleSort('Title')} className="purchaseList-sortableHeader">
                          Title {sortConfig.key === 'Title' && <span className="purchaseList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Supplier</th>
                        <th onClick={() => handleSort('Status')} className="purchaseList-sortableHeader">
                          Status {sortConfig.key === 'Status' && <span className="purchaseList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Date</th>
                        <th>Subtotal</th>
                        <th>Discount</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPurchases.length > 0 ? (
                        paginatedPurchases.map((purchase) => (
                          <tr key={purchase._id} className="purchaseList-row">
                            <td className="purchaseList-idCell">
                              {purchase.billNumber || purchase._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="purchaseList-titleCell">{purchase.title}</td>
                            <td className="purchaseList-supplierCell">{purchase.supplier?.companyName || '-'}</td>
                            <td className={`purchaseList-statusCell purchaseList-status-${purchase.status?.toLowerCase()}`}>
                              {purchase.status || '-'}
                            </td>
                            <td>{new Date(purchase.date).toLocaleDateString()}</td>
                            <td>AED {purchase.subtotal ? purchase.subtotal.toFixed(2) : '0.00'}</td>
                            <td>AED {purchase.discountAmount ? purchase.discountAmount.toFixed(2) : '0.00'}</td>
                            <td className="purchaseList-totalCell">AED {purchase.total ? purchase.total.toFixed(2) : '0.00'}</td>
                            <td className="purchaseList-actionsCell">
                              <button className="purchaseList-btnAction purchaseList-btnView" onClick={() => handleView(purchase._id)} title="View">
                                <AiOutlineEye />
                              </button>
                              <button className="purchaseList-btnAction purchaseList-btnEdit" onClick={() => handleEdit(purchase._id)} title="Edit">
                                <AiOutlineEdit />
                              </button>
                              <button className="purchaseList-btnAction purchaseList-btnDelete" onClick={() => handleDelete(purchase._id)} title="Delete">
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="purchaseList-noData">
                            No purchases found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedPurchases.length > 0 && (
                  <div className="purchaseList-paginationContainer">
                    <div className="purchaseList-paginationInfo">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedPurchases.length)} of {sortedPurchases.length} purchases
                    </div>
                    <div className="purchaseList-paginationButtons">
                      <button className="purchaseList-btnPagination" onClick={handlePrevPage} disabled={currentPage === 1}>
                        ← Previous
                      </button>
                      <span className="purchaseList-paginationCounter">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button className="purchaseList-btnPagination" onClick={handleNextPage} disabled={currentPage === totalPages}>
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

export default PurchaseList;