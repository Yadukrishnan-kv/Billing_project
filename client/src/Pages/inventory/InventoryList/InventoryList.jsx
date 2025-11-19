// src/pages/inventory/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './InventoryList.css';

function InventoryList() {
  const [inventories, setInventories] = useState([]);
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
  const API_URL = `${BACKEND_URL}/api/inventories/getAllInventories`;

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
      fetchInventories();
    }
  }, [user]);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setInventories(response.data.data || []);
      setError('');
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch inventories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventories = inventories.filter((inventory) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'ID':
        return inventory._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
      case 'Product Name':
        return inventory.productName.toLowerCase().includes(searchLower);
      case 'Item Number':
        return inventory.itemNumber.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const sortedInventories = [...filteredInventories].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    switch (sortConfig.key) {
      case 'ID':
        aValue = a._id.slice(-6).toUpperCase();
        bValue = b._id.slice(-6).toUpperCase();
        break;
      case 'Product Name':
        aValue = a.productName;
        bValue = b.productName;
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
    if (window.confirm('Are you sure you want to delete this inventory?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/inventories/deleteInventory/${id}`);
        setInventories(inventories.filter(i => i._id !== id));
      } catch (err) {
        setError('Failed to delete inventory');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/admin/items/Inventory/viewInventory/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/items/Inventory/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/admin/items/Inventory/CreateInventory');
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
      ['ID', 'Type', 'Product Name', 'Item Number', 'Unit', 'Tax', 'HSN/SAC', 'Item Group'],
      ...filteredInventories.map(inv => [
        inv._id.slice(-6).toUpperCase(),
        inv.type,
        inv.productName,
        inv.itemNumber,
        inv.unit,
        inv.tax,
        inv.hsnSac,
        inv.itemGroup?.name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventories.csv';
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

  const totalPages = Math.ceil(sortedInventories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventories = sortedInventories.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!user) return <div className="inventoryList-loading">Loading…</div>;

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
        <div className="inventoryList-wrapper">
          <div className="inventoryList-viewTabs">
            <span className="inventoryList-viewTab inventoryList-viewTab-active">Primary View</span>
          </div>

          <div className="inventoryList-headerContainer">
            <div className="inventoryList-headerContent">
              <h1 className="inventoryList-title">Inventory</h1>
            </div>
          </div>

          <div className="inventoryList-toolbarSection">
            <div className="inventoryList-toolbarButtons">
              <div className="inventoryList-dropdownWrapper">
                <button className="inventoryList-btnToolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  {dropdownValues.options || 'Options'} <FiChevronDown className="inventoryList-dropdownIcon" />
                </button>
                {optionsDropdownOpen && (
                  <div className="inventoryList-dropdownMenu">
                    <button className="inventoryList-dropdownItem" onClick={handleBulkUpdate}>Bulk Update</button>
                    <button className="inventoryList-dropdownItem" onClick={handleBulkDelete}>Bulk Delete</button>
                  </div>
                )}
              </div>

              <div className="inventoryList-dropdownWrapper">
                <button className="inventoryList-btnToolbar" onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}>
                  {dropdownValues.viewSettings || 'View Settings'} <FiChevronDown className="inventoryList-dropdownIcon" />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="inventoryList-dropdownMenu">
                    <button className="inventoryList-dropdownItem" onClick={handleSetAsDefault}>Set as Default</button>
                    <button className="inventoryList-dropdownItem" onClick={handleEditView}>Edit View</button>
                  </div>
                )}
              </div>

              <button className="inventoryList-btnToolbar">
                <FiFilter className="inventoryList-icon" /> Add Filter <FiChevronDown className="inventoryList-dropdownIcon" />
              </button>
            </div>

            <button className="inventoryList-btnCreate" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="inventoryList-searchExportSection">
            <div className="inventoryList-searchWrapper">
              <select 
                className="inventoryList-searchFieldSelect" 
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="ID">ID</option>
                <option value="Product Name">Product Name</option>
                <option value="Item Number">Item Number</option>
              </select>
              <input
                type="text"
                className="inventoryList-searchInput"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="inventoryList-btnExport" onClick={handleExport}>
              <FiDownload className="inventoryList-exportIcon" /> Export
            </button>
          </div>

          <div className="inventoryList-tableContainer">
            {error && <div className="inventoryList-errorMessage">{error}</div>}

            {loading ? (
              <div className="inventoryList-loading">Loading inventories...</div>
            ) : (
              <>
                <div className="inventoryList-tableWrapper">
                  <table className="inventoryList-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('ID')} className="inventoryList-sortableHeader">
                          ID {sortConfig.key === 'ID' && <span className="inventoryList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th onClick={() => handleSort('Product Name')} className="inventoryList-sortableHeader">
                          Product Name {sortConfig.key === 'Product Name' && <span className="inventoryList-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Type</th>
                        <th>Item Number</th>
                        <th>Unit</th>
                        <th>Tax</th>
                        <th>HSN/SAC</th>
                        <th>Item Group</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInventories.length > 0 ? (
                        paginatedInventories.map((inventory) => (
                          <tr key={inventory._id} className="inventoryList-row">
                            <td className="inventoryList-idCell">
                              {inventory._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="inventoryList-titleCell">{inventory.productName}</td>
                            <td>{inventory.type}</td>
                            <td>{inventory.itemNumber}</td>
                            <td>{inventory.unit}</td>
                            <td>{inventory.tax}</td>
                            <td>{inventory.hsnSac}</td>
                            <td>{inventory.itemGroup?.name || '-'}</td>
                            <td className="inventoryList-actionsCell">
                              <button className="inventoryList-btnAction inventoryList-btnView" onClick={() => handleView(inventory._id)} title="View">
                                <AiOutlineEye />
                              </button>
                              <button className="inventoryList-btnAction inventoryList-btnEdit" onClick={() => handleEdit(inventory._id)} title="Edit">
                                <AiOutlineEdit />
                              </button>
                              <button className="inventoryList-btnAction inventoryList-btnDelete" onClick={() => handleDelete(inventory._id)} title="Delete">
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="inventoryList-noData">
                            No inventories found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedInventories.length > 0 && (
                  <div className="inventoryList-paginationContainer">
                    <div className="inventoryList-paginationInfo">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedInventories.length)} of {sortedInventories.length} inventories
                    </div>
                    <div className="inventoryList-paginationButtons">
                      <button className="inventoryList-btnPagination" onClick={handlePrevPage} disabled={currentPage === 1}>
                        ← Previous
                      </button>
                      <span className="inventoryList-paginationCounter">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button className="inventoryList-btnPagination" onClick={handleNextPage} disabled={currentPage === totalPages}>
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

export default InventoryList;