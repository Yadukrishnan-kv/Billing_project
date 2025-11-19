// src/pages/inventory/ItemGroupList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './ItemGroupList.css';

function ItemGroupList() {
  const [itemGroups, setItemGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
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
  const API_URL = `${BACKEND_URL}/api/itemgroups/getAllItemGroups`;

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
      fetchItemGroups();
    }
  }, [user]);

  const fetchItemGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setItemGroups(response.data.data || []);
      setError('');
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch item groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItemGroups = itemGroups.filter((itemGroup) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'ID':
        return itemGroup._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
      case 'Name':
        return itemGroup.name.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const sortedItemGroups = [...filteredItemGroups].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    switch (sortConfig.key) {
      case 'ID':
        aValue = a._id.slice(-6).toUpperCase();
        bValue = b._id.slice(-6).toUpperCase();
        break;
      case 'Name':
        aValue = a.name;
        bValue = b.name;
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
    if (window.confirm('Are you sure you want to delete this item group?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/itemgroups/deleteItemGroup/${id}`);
        setItemGroups(itemGroups.filter(i => i._id !== id));
      } catch (err) {
        setError('Failed to delete item group');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/admin/inventory/itemgroup/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/items/Item-Group/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/admin/items/Item-Group/CreateIItem-Group');
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
      ['ID', 'Name'],
      ...filteredItemGroups.map(group => [
        group._id.slice(-6).toUpperCase(),
        group.name
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'itemgroups.csv';
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

  const totalPages = Math.ceil(sortedItemGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItemGroups = sortedItemGroups.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!user) return <div className="itemgrouplist-loading">Loading…</div>;

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
        <div className="itemgrouplist-wrapper">
          <div className="itemgrouplist-viewTabs">
            <span className="itemgrouplist-viewTab itemgrouplist-viewTab-active">Primary View</span>
          </div>

          <div className="itemgrouplist-headerContainer">
            <div className="itemgrouplist-headerContent">
              <h1 className="itemgrouplist-title">Item Groups</h1>
            </div>
          </div>

          <div className="itemgrouplist-toolbarSection">
            <div className="itemgrouplist-toolbarButtons">
              <div className="itemgrouplist-dropdownWrapper">
                <button className="itemgrouplist-btnToolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  {dropdownValues.options || 'Options'} <FiChevronDown className="itemgrouplist-dropdownIcon" />
                </button>
                {optionsDropdownOpen && (
                  <div className="itemgrouplist-dropdownMenu">
                    <button className="itemgrouplist-dropdownItem" onClick={handleBulkUpdate}>Bulk Update</button>
                    <button className="itemgrouplist-dropdownItem" onClick={handleBulkDelete}>Bulk Delete</button>
                  </div>
                )}
              </div>

              <div className="itemgrouplist-dropdownWrapper">
                <button className="itemgrouplist-btnToolbar" onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}>
                  {dropdownValues.viewSettings || 'View Settings'} <FiChevronDown className="itemgrouplist-dropdownIcon" />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="itemgrouplist-dropdownMenu">
                    <button className="itemgrouplist-dropdownItem" onClick={handleSetAsDefault}>Set as Default</button>
                    <button className="itemgrouplist-dropdownItem" onClick={handleEditView}>Edit View</button>
                  </div>
                )}
              </div>

              <button className="itemgrouplist-btnToolbar">
                <FiFilter className="itemgrouplist-icon" /> Add Filter <FiChevronDown className="itemgrouplist-dropdownIcon" />
              </button>
            </div>

            <button className="itemgrouplist-btnCreate" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="itemgrouplist-searchExportSection">
            <div className="itemgrouplist-searchWrapper">
              <select 
                className="itemgrouplist-searchFieldSelect" 
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="ID">ID</option>
                <option value="Name">Name</option>
              </select>
              <input
                type="text"
                className="itemgrouplist-searchInput"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="itemgrouplist-btnExport" onClick={handleExport}>
              <FiDownload className="itemgrouplist-exportIcon" /> Export
            </button>
          </div>

          <div className="itemgrouplist-tableContainer">
            {error && <div className="itemgrouplist-errorMessage">{error}</div>}

            {loading ? (
              <div className="itemgrouplist-loading">Loading item groups...</div>
            ) : (
              <>
                <div className="itemgrouplist-tableWrapper">
                  <table className="itemgrouplist-table">
                    <thead>
                      <tr>
                       
                        <th onClick={() => handleSort('Name')} className="itemgrouplist-sortableHeader">
                          Name {sortConfig.key === 'Name' && <span className="itemgrouplist-sortIcon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItemGroups.length > 0 ? (
                        paginatedItemGroups.map((itemGroup) => (
                          <tr key={itemGroup._id} className="itemgrouplist-row">
                           
                            <td className="itemgrouplist-titleCell">{itemGroup.name}</td>
                            <td className="itemgrouplist-actionsCell">
                              <button className="itemgrouplist-btnAction itemgrouplist-btnView" onClick={() => handleView(itemGroup._id)} title="View">
                                <AiOutlineEye />
                              </button>
                              <button className="itemgrouplist-btnAction itemgrouplist-btnEdit" onClick={() => handleEdit(itemGroup._id)} title="Edit">
                                <AiOutlineEdit />
                              </button>
                              <button className="itemgrouplist-btnAction itemgrouplist-btnDelete" onClick={() => handleDelete(itemGroup._id)} title="Delete">
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="itemgrouplist-noData">
                            No item groups found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedItemGroups.length > 0 && (
                  <div className="itemgrouplist-paginationContainer">
                    <div className="itemgrouplist-paginationInfo">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedItemGroups.length)} of {sortedItemGroups.length} item groups
                    </div>
                    <div className="itemgrouplist-paginationButtons">
                      <button className="itemgrouplist-btnPagination" onClick={handlePrevPage} disabled={currentPage === 1}>
                        ← Previous
                      </button>
                      <span className="itemgrouplist-paginationCounter">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button className="itemgrouplist-btnPagination" onClick={handleNextPage} disabled={currentPage === totalPages}>
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

export default ItemGroupList;