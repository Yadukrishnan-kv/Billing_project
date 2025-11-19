// src/pages/inventory/CatalogueList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import './CatalogueList.css';

function CatalogueList() {
  const [catalogues, setCatalogues] = useState([]); // Always an array
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
  const [searchField, setSearchField] = useState('Name');
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [viewSettingsDropdownOpen, setViewSettingsDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dropdownValues, setDropdownValues] = useState({
    options: null,
    viewSettings: null
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

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
      fetchCatalogues();
    }
  }, [user]);

  // FIXED FETCH — Handles both { data: [...] } and plain array
  const fetchCatalogues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/catalogues/getAllCatalogues`);

      let catalogueList = [];

      if (response.data) {
        if (Array.isArray(response.data.data)) {
          catalogueList = response.data.data; // paginated response
        } else if (Array.isArray(response.data)) {
          catalogueList = response.data; // plain array
        }
      }

      console.log("Fetched catalogues:", catalogueList); // Check in browser console
      setCatalogues(catalogueList);
    } catch (err) {
      console.error("Failed to fetch catalogues:", err);
      setError('Failed to load catalogues');
      setCatalogues([]);
    } finally {
      setLoading(false);
    }
  };

  // SAFE ARRAY — Prevents .filter() error
  const safeCatalogues = Array.isArray(catalogues) ? catalogues : [];

  const filteredCatalogues = safeCatalogues.filter((catalogue) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'Name':
        return catalogue.name?.toLowerCase().includes(searchLower);
      case 'Module':
        return catalogue.module?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const sortedCatalogues = [...filteredCatalogues].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = sortConfig.key === 'Name' ? a.name : a.module;
    const bValue = sortConfig.key === 'Name' ? b.name : b.module;

    if (!aValue || !bValue) return 0;

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this catalogue?')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/catalogues/deleteCatalogue/${id}`);
      setCatalogues(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError('Failed to delete catalogue');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/items/Catalogue/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/admin/items/Catalogue/CreateICatalogue');
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Module'],
      ...filteredCatalogues.map(cat => [cat.name || '', cat.module || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogues.csv';
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

  const totalPages = Math.ceil(sortedCatalogues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCatalogues = sortedCatalogues.slice(startIndex, endIndex);

  if (!user) return <div className="cataloguelist-loading">Loading…</div>;

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
        <div className="cataloguelist-wrapper">
          <div className="cataloguelist-viewTabs">
            <span className="cataloguelist-viewTab cataloguelist-viewTab-active">Primary View</span>
          </div>

          <div className="cataloguelist-headerContainer">
            <div className="cataloguelist-headerContent">
              <h1 className="cataloguelist-title">Catalogues</h1>
            </div>
          </div>

          <div className="cataloguelist-toolbarSection">
            <div className="cataloguelist-toolbarButtons">
              <div className="cataloguelist-dropdownWrapper">
                <button className="cataloguelist-btnToolbar" onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}>
                  {dropdownValues.options || 'Options'} <FiChevronDown />
                </button>
                {optionsDropdownOpen && (
                  <div className="cataloguelist-dropdownMenu">
                    <button className="cataloguelist-dropdownItem">Bulk Update</button>
                    <button className="cataloguelist-dropdownItem">Bulk Delete</button>
                  </div>
                )}
              </div>

              <div className="cataloguelist-dropdownWrapper">
                <button className="cataloguelist-btnToolbar" onClick={() => setViewSettingsDropdownOpen(!viewSettingsDropdownOpen)}>
                  {dropdownValues.viewSettings || 'View Settings'} <FiChevronDown />
                </button>
                {viewSettingsDropdownOpen && (
                  <div className="cataloguelist-dropdownMenu">
                    <button className="cataloguelist-dropdownItem">Set as Default</button>
                    <button className="cataloguelist-dropdownItem">Edit View</button>
                  </div>
                )}
              </div>

              <button className="cataloguelist-btnToolbar">
                <FiFilter /> Add Filter <FiChevronDown />
              </button>
            </div>

            <button className="cataloguelist-btnCreate" onClick={handleCreateNew}>
              + Create
            </button>
          </div>

          <div className="cataloguelist-searchExportSection">
            <div className="cataloguelist-searchWrapper">
              <select
                className="cataloguelist-searchFieldSelect"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="Name">Name</option>
                <option value="Module">Module</option>
              </select>
              <input
                type="text"
                className="cataloguelist-searchInput"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="cataloguelist-btnExport" onClick={handleExport}>
              <FiDownload /> Export
            </button>
          </div>

          <div className="cataloguelist-tableContainer">
            {error && <div className="cataloguelist-errorMessage">{error}</div>}

            {loading ? (
              <div className="cataloguelist-loading">Loading catalogues...</div>
            ) : (
              <>
                <div className="cataloguelist-tableWrapper">
                  <table className="cataloguelist-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('Name')} className="cataloguelist-sortableHeader">
                          Name {sortConfig.key === 'Name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('Module')} className="cataloguelist-sortableHeader">
                          Module {sortConfig.key === 'Module' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCatalogues.length > 0 ? (
                        paginatedCatalogues.map((catalogue) => (
                          <tr key={catalogue._id}>
                            <td>{catalogue.name}</td>
                            <td>{catalogue.module}</td>
                            <td className="cataloguelist-actionsCell">
                              <button
                                className="cataloguelist-btnAction cataloguelist-btnEdit"
                                onClick={() => handleEdit(catalogue._id)}
                              >
                                <AiOutlineEdit />
                              </button>
                              <button
                                className="cataloguelist-btnAction cataloguelist-btnDelete"
                                onClick={() => handleDelete(catalogue._id)}
                              >
                                <AiOutlineDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="cataloguelist-noData">
                            No catalogues found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedCatalogues.length > 0 && (
                  <div className="cataloguelist-paginationContainer">
                    <div className="cataloguelist-paginationInfo">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedCatalogues.length)} of {sortedCatalogues.length} catalogues
                    </div>
                    <div className="cataloguelist-paginationButtons">
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                        ← Previous
                      </button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
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

export default CatalogueList;