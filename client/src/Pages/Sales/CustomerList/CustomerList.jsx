import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './CustomerList.css';

function CustomerList() {
  // === State ===
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Admin layout
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('ID');

  // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Dropdowns
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [viewSettingsDropdownOpen, setViewSettingsDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({
    options: null,
    viewSettings: null,
    filter: null
  });

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;
  const API_URL = `${BACKEND_URL}/api/customers/getCustomers`;

  // === Effects ===
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auth Guard
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

  // Fetch Customers
  useEffect(() => {
    if (user) fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCustomers(response.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // === Filter ===
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    switch (searchField) {
      case 'ID':
        return (customer.customerId || '').toLowerCase().includes(query);
      case 'Name':
        return (customer.customer || '').toLowerCase().includes(query);
      case 'Company':
        return (customer.company || '').toLowerCase().includes(query);
      case 'Email':
        return (customer.email || '').toLowerCase().includes(query);
      case 'Phone':
        return (customer.phone || '').toLowerCase().includes(query);
      default:
        return true;
    }
  });

  // === Sort ===
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = '';
    let bValue = '';

    switch (sortConfig.key) {
      case 'ID':
        aValue = a.customerId || '';
        bValue = b.customerId || '';
        break;
      case 'Name':
        aValue = a.customer || '';
        bValue = b.customer || '';
        break;
      case 'Company':
        aValue = a.company || '';
        bValue = b.company || '';
        break;
      case 'Email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'Phone':
        aValue = a.phone || '';
        bValue = b.phone || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // === Handlers ===
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/customers/deleteCustomer/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert('Error deleting customer');
      console.error(err);
    }
  };

  const handleView = (id) => navigate(`/admin/sales/Customer/view/${id}`);
  const handleEdit = (id) => navigate(`/admin/sales/Customer/edit/${id}`);
  const handleCreateNew = () => navigate('/admin/sales/Customer/createCustomer');

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Customer Name', 'Company', 'Email', 'Phone'],
      ...sortedCustomers.map((c) => [
        c.customerId || '',
        c.customer || '',
        c.company || '',
        c.email || '',
        c.phone || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Dropdown Actions (placeholders)
  const handleBulkUpdate = () => {
    setDropdownValues((prev) => ({ ...prev, options: 'Bulk Update' }));
    setOptionsDropdownOpen(false);
  };
  const handleBulkDelete = () => {
    setDropdownValues((prev) => ({ ...prev, options: 'Bulk Delete' }));
    setOptionsDropdownOpen(false);
  };
  const handleImportCustomers = () => {
    setDropdownValues((prev) => ({ ...prev, options: 'Import Customers' }));
    setOptionsDropdownOpen(false);
  };
  const handleSetAsDefault = () => {
    setDropdownValues((prev) => ({ ...prev, viewSettings: 'Set as Default' }));
    setViewSettingsDropdownOpen(false);
  };
  const handleEditView = () => {
    setDropdownValues((prev) => ({ ...prev, viewSettings: 'Edit View' }));
    setViewSettingsDropdownOpen(false);
  };
  const handleDeleteView = () => {
    setDropdownValues((prev) => ({ ...prev, viewSettings: 'Delete View' }));
    setViewSettingsDropdownOpen(false);
  };
  const handleCreateView = () => {
    setDropdownValues((prev) => ({ ...prev, viewSettings: 'Create View' }));
    setViewSettingsDropdownOpen(false);
  };
  const handleCloneView = () => {
    setDropdownValues((prev) => ({ ...prev, viewSettings: 'Clone View' }));
    setViewSettingsDropdownOpen(false);
  };

  if (!user) return <div className="loading">Loading…</div>;

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
        <div className="customer-list-wrapper">
          <div className="view-tabs">
            <span className="view-tab active">Primary View</span>
          </div>

          <div className="customer-header-container">
            <div className="customer-header-content">
              <h1 className="customer-title">Customers</h1>
            </div>
          </div>

          <div className="toolbar-section">
            <div className="toolbar-buttons">
              {/* Options Dropdown */}
              <div className="dropdown-wrapper">
                <button
                  className="btn-toolbar"
                  onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
                >
                  {dropdownValues.options || 'Options'} <FiChevronDown className="dropdown-icon" />
                </button>
                {optionsDropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={handleBulkUpdate}>
                      Bulk Update
                    </button>
                    <button className="dropdown-item" onClick={handleBulkDelete}>
                      Bulk Delete
                    </button>
                    <button className="dropdown-item" onClick={handleImportCustomers}>
                      Import Customers
                    </button>
                  </div>
                )}
              </div>

              {/* View Settings Dropdown */}
              <div className="dropdown-wrapper">
                <button
                  className="btn-toolbar"
                  onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}
                >
                  {dropdownValues.viewSettings || 'View Settings'} <FiChevronDown className="dropdown-icon" />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={handleSetAsDefault}>
                      Set as Default
                    </button>
                    <button className="dropdown-item" onClick={handleEditView}>
                      Edit View
                    </button>
                    <button className="dropdown-item" onClick={handleDeleteView}>
                      Delete View
                    </button>
                    <button className="dropdown-item" onClick={handleCreateView}>
                      Create View
                    </button>
                    <button className="dropdown-item" onClick={handleCloneView}>
                      Clone View
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="dropdown-wrapper">
                <button
                  className="btn-toolbar"
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                >
                  <FiFilter className="icon" /> {dropdownValues.filter || 'Add Filter'}{' '}
                  <FiChevronDown className="dropdown-icon" />
                </button>
                {filterDropdownOpen && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownValues((prev) => ({ ...prev, filter: 'Company Filter' }));
                        setFilterDropdownOpen(false);
                      }}
                    >
                      Filter by Company
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownValues((prev) => ({ ...prev, filter: 'Email Filter' }));
                        setFilterDropdownOpen(false);
                      }}
                    >
                      Filter by Email
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownValues((prev) => ({ ...prev, filter: 'Phone Filter' }));
                        setFilterDropdownOpen(false);
                      }}
                    >
                      Filter by Phone
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button className="btn-create-toolbar" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="search-export-section">
            <div className="search-wrapper">
              <select
                className="search-field-select"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="ID">ID</option>
                <option value="Name">Name</option>
                <option value="Company">Company</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="btn-export" onClick={handleExport}>
              <FiDownload className="export-icon" /> Export
            </button>
          </div>

          <div className="customer-table-container">
            {loading ? (
              <div className="loading">Loading customers...</div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="customers-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('ID')} className="sortable-header">
                          ID{' '}
                          {sortConfig.key === 'ID' && (
                            <span className="sort-icon">
                              {sortConfig.direction === 'asc' ? 'Up' : 'Down'}
                            </span>
                          )}
                        </th>
                        <th onClick={() => handleSort('Name')} className="sortable-header">
                          Name{' '}
                          {sortConfig.key === 'Name' && (
                            <span className="sort-icon">
                              {sortConfig.direction === 'asc' ? 'Up' : 'Down'}
                            </span>
                          )}
                        </th>
                        <th onClick={() => handleSort('Company')} className="sortable-header">
                          Company{' '}
                          {sortConfig.key === 'Company' && (
                            <span className="sort-icon">
                              {sortConfig.direction === 'asc' ? 'Up' : 'Down'}
                            </span>
                          )}
                        </th>
                        <th onClick={() => handleSort('Email')} className="sortable-header">
                          Email{' '}
                          {sortConfig.key === 'Email' && (
                            <span className="sort-icon">
                              {sortConfig.direction === 'asc' ? 'Up' : 'Down'}
                            </span>
                          )}
                        </th>
                        <th onClick={() => handleSort('Phone')} className="sortable-header">
                          Phone{' '}
                          {sortConfig.key === 'Phone' && (
                            <span className="sort-icon">
                              {sortConfig.direction === 'asc' ? 'Up' : 'Down'}
                            </span>
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.length > 0 ? (
                        paginatedCustomers.map((c) => (
                          <tr key={c._id} className="customer-row">
                            <td className="id-cell">{c.customerId || '-'}</td>
                            <td className="name-cell">{c.customer || '-'}</td>
                            <td>{c.company || '-'}</td>
                            <td>{c.email || '-'}</td>
                            <td>{c.phone || '-'}</td>
                            <td className="actions-cell">
                              <button
                                className="btn-action btn-view"
                                onClick={() => handleView(c._id)}
                                title="View"
                              >
                                <AiOutlineEye />
                              </button>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleEdit(c._id)}
                                title="Edit"
                              >
                                <AiOutlineEdit />
                              </button>
                              <button
                                className="btn-action btn-delete"
                                onClick={() => handleDelete(c._id, c.customer)}
                                title="Delete"
                              >
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="no-data">
                            No customers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedCustomers.length > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {startIndex + 1} to{' '}
                      {Math.min(endIndex, sortedCustomers.length)} of{' '}
                      {sortedCustomers.length} customers
                    </div>
                    <div className="pagination-buttons">
                      <button
                        className="btn-pagination"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="pagination-counter">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn-pagination"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
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

export default CustomerList;