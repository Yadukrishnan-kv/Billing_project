// src/components/admin/AdminSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiFileText,
  FiBell,
  FiClipboard,
  FiBarChart2,
  FiSettings,
  FiUsers,
  FiFilePlus,
  FiShoppingCart,
  FiTruck,
  FiBox,
  FiLayers,
  FiBookOpen,
  FiMenu,
} from 'react-icons/fi';

const submenuIcons = {
  Customer: <FiUsers />,
  Invoices: <FiFilePlus />,
  'Sales Order': <FiShoppingCart />,
  Suppliers: <FiTruck />,
  'Purchase-Bill': <FiFileText />,
  'Purchase Order': <FiPackage />,
  Inventory: <FiBox />,
  'Item-Group': <FiLayers />,
  Catalogue: <FiBookOpen />,
};

const menu = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  {
    icon: FiShoppingBag,
    label: 'Sales',
    sub: ['Customer', 'Invoices', 'Sales Order'],
    basePath: '/admin/sales',
  },
  {
    icon: FiPackage,
    label: 'Purchase',
    sub: ['Suppliers', 'Purchase-Bill', 'Purchase Order'],
    basePath: '/admin/purchase',
  },
  { icon: FiDollarSign, label: 'Accounting', path: '/admin/accounting' },
  { icon: FiFileText, label: 'Documents', path: '/admin/documents' },
  { icon: FiBell, label: 'Reminder', path: '/admin/reminder' },
  {
    icon: FiClipboard,
    label: 'Items',
    sub: ['Inventory', 'Item-Group', 'Catalogue'],
    basePath: '/admin/items',
  },
  { icon: FiBarChart2, label: 'Reports', path: '/admin/reports' },
  { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
];

const getSubmenuPath = (parentLabel, subLabel) => {
  const base = menu.find((m) => m.label === parentLabel)?.basePath;
  const cleanSub = subLabel.toLowerCase().replace(/\s+/g, '-');
  return `${base}/${cleanSub}`;
};

const AdminSidebar = ({ collapsed: externalCollapsed, setCollapsed: setExternalCollapsed }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  // Manage desktop collapse state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setExternalCollapsed(false);
        setMobileOpen(false);
      } else {
        setExternalCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setExternalCollapsed]);

  const isMobile = window.innerWidth <= 768;

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleNavigation = () => {
    if (isMobile) {
      setMobileOpen(false);
      setOpenSubmenu(null); // Also close any open submenu
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (parent, sub) =>
    location.pathname.startsWith(getSubmenuPath(parent, sub));

  return (
    <>
      {/* Hamburger toggle — ONLY on mobile (≤768px) */}
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <FiMenu size={24} />
        </button>
      )}

     

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          isMobile
            ? mobileOpen
              ? 'mobile-open'
              : 'mobile-collapsed'
            : externalCollapsed
            ? 'collapsed'
            : ''
        }`}
      >
        <div className="sidebar-logo"></div>

        <nav className="sidebar-menu">
          {menu.map((item, idx) => {
            if (!item.sub) {
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={handleNavigation}
                >
                  <item.icon className="menu-icon" />
                  <span className="menu-label">{item.label}</span>
                </Link>
              );
            }

            const isOpen = openSubmenu === item.label;

            return (
              <div key={idx} className="menu-item-container">
                <div
                  className={`menu-item has-sub ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <item.icon className="menu-icon" />
                  <span className="menu-label">{item.label}</span>
                </div>

                {isOpen && (
                  <div className="submenu">
                    {item.sub.map((sub, sidx) => (
                      <Link
                        key={sidx}
                        to={getSubmenuPath(item.label, sub)}
                        className={`submenu-item ${isSubmenuActive(item.label, sub) ? 'active' : ''}`}
                        onClick={handleNavigation}
                      >
                        {submenuIcons[sub] && (
                          <span className="submenu-icon">{submenuIcons[sub]}</span>
                        )}
                        <span>{sub}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;