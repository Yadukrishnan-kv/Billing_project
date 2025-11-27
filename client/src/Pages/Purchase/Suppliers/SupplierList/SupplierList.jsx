// src/pages/admin/purchase/Suppliers/SupplierList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../../Components/AdminSidebar/AdminSidebar';
import '../SupplierList/SupplierList.css';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
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
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;
  const API_URL = `${BACKEND_URL}/api/suppliers/getAllSuppliers`;

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
      fetchSuppliers();
    }
  }, [user]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setSuppliers(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  // Safe ID: Show SUP-0001 if exists, otherwise fallback to last 6 of _id
  const getSupplierId = (supplier) => {
    return supplier.supplierId || supplier._id.slice(-6).toUpperCase();
  };

  // Safe catalogue name
  const getCatalogueName = (catalogue) => {
    if (!catalogue) return '-';
    if (typeof catalogue === 'object' && catalogue.name) return catalogue.name;
    return catalogue;
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const id = getSupplierId(supplier);

    switch (searchField) {
      case 'ID':
        return id.includes(searchQuery.toUpperCase());
      case 'Name':
        return supplier.supplierName.toLowerCase().includes(q);
      case 'Company':
        return (supplier.company || '').toLowerCase().includes(q);
      case 'Email':
        return (supplier.email || '').toLowerCase().includes(q);
      case 'Phone':
        return (supplier.phone || '').toLowerCase().includes(q);
      default:
        return true;
    }
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;

    switch (sortConfig.key) {
      case 'ID':
        aValue = getSupplierId(a);
        bValue = getSupplierId(b);
        break;
      case 'Name':
        aValue = a.supplierName;
        bValue = b.supplierName;
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

 const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this supplier?')) {
    try {
      // FIXED URL — now matches your backend route
      await axios.delete(`${BACKEND_URL}/api/suppliers/deleteSupplier/${id}`);
      
      // Remove from UI instantly
      setSuppliers(prev => prev.filter(s => s._id !== id));
      
      alert('Supplier deleted successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to delete supplier');
    }
  }
};

  const handleView = (id) => navigate(`/admin/purchase/Suppliers/details/${id}`);
  const handleEdit = (id) => navigate(`/admin/purchase/Suppliers/edit/${id}`);
  const handleCreateNew = () => navigate('/admin/purchase/Suppliers/createSupplier');

  const handleExport = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BACKEND_URL}/api/suppliers/exportSuppliers`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' // Critical: treat as binary file
    });

    // Create file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'suppliers.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed:', err);
    setError('Failed to export suppliers. Please try again.');
    alert('Export failed. Please try again.');
  }
};

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSuppliers = sortedSuppliers.slice(startIndex, endIndex);

  if (!user) return <div className="supplierlist-loading">Authenticating...</div>;

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
        <div className="supplierlist-wrapper">
          <div className="supplierlist-header-container">
            <div className="supplierlist-header-content">
              <h1 className="supplierlist-title">Suppliers</h1>
            </div>
          </div>

          <div className="supplierlist-toolbar-section">
            <div className="supplierlist-toolbar-buttons">
              <div className="supplierlist-dropdown-wrapper">
                <button className="supplierlist-btn-toolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  Options <FiChevronDown />
                </button>
                {optionsDropdownOpen && (
                  <div className="supplierlist-dropdown-menu">
                    <button className="supplierlist-dropdown-item">Bulk Update</button>
                    <button className="supplierlist-dropdown-item">Bulk Delete</button>
                    <button className="supplierlist-dropdown-item">Import Suppliers</button>
                  </div>
                )}
              </div>
            </div>

            <button className="supplierlist-btn-create-toolbar" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="supplierlist-search-export-section">
            <div className="supplierlist-search-wrapper">
              <select
                className="supplierlist-search-field-select"
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
                className="supplierlist-search-input"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="supplierlist-btn-export" onClick={handleExport}>
              <FiDownload /> Export
            </button>
          </div>

          <div className="supplierlist-table-container">
            {error && <div className="supplierlist-error-message">{error}</div>}

            {loading ? (
              <div className="supplierlist-loading">Loading suppliers...</div>
            ) : (
              <>
                <div className="supplierlist-table-wrapper">
                  <table className="supplierlist-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('ID')} className="supplierlist-sortable-header">
                          ID {sortConfig.key === 'ID' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
                        </th>
                        <th onClick={() => handleSort('Name')} className="supplierlist-sortable-header">
                          Name {sortConfig.key === 'Name' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
                        </th>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Catalogue</th>
                        <th>Currency</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSuppliers.length > 0 ? (
                        paginatedSuppliers.map((supplier) => (
                          <tr key={supplier._id} className="supplierlist-row">
                            <td className="supplierlist-id-cell">
                              <strong>{getSupplierId(supplier)}</strong>
                            </td>
                            <td className="supplierlist-name-cell">{supplier.supplierName}</td>
                            <td>{supplier.company || '-'}</td>
                            <td>{supplier.email || '-'}</td>
                            <td>{supplier.phone || '-'}</td>
                            <td>{getCatalogueName(supplier.catalogue)}</td>
                            <td>{supplier.currency || '-'}</td>
                            <td className="supplierlist-actions-cell">
                              <button className="supplierlist-btn-action supplierlist-btn-view" onClick={() => handleView(supplier._id)} title="View">
                                <AiOutlineEye />
                              </button>
                              <button className="supplierlist-btn-action supplierlist-btn-edit" onClick={() => handleEdit(supplier._id)} title="Edit">
                                <AiOutlineEdit />
                              </button>
                              <button className="supplierlist-btn-action supplierlist-btn-delete" onClick={() => handleDelete(supplier._id)} title="Delete">
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="supplierlist-no-data">
                            No suppliers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedSuppliers.length > itemsPerPage && (
                  <div className="supplierlist-pagination-container">
                    <div className="supplierlist-pagination-info">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedSuppliers.length)} of {sortedSuppliers.length} suppliers
                    </div>
                    <div className="supplierlist-pagination-buttons">
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                        Previous
                      </button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
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

export default SupplierList;