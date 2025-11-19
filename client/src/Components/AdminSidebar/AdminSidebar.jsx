// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FiChevronRight,
  FiChevronDown,
  FiMenu,
  // Submenu icons
  FiUsers,
  FiFilePlus,
  FiShoppingCart,
  FiTruck,
  FiBox,
  FiLayers,
  FiBookOpen,
} from 'react-icons/fi';
import '../DashBoard/AdminDash.css';

const submenuIcons = {
  Customer: <FiUsers />,
  'Sales invoice': <FiFilePlus />,
  'Sales Order': <FiShoppingCart />,
  Suppliers: <FiTruck />,
  'Purchase Bill': <FiFileText />,   // <-- FiBill does NOT exist
  'Purchase Order': <FiPackage />,
  Inventory: <FiBox />,
  'Item Group': <FiLayers />,
  Catalogue: <FiBookOpen />,
};

const menu = [
  { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
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
  return `${base}/${subLabel.toLowerCase().replace(/\s+/g, '-')}`;
};

const AdminSidebar = ({ collapsed, setCollapsed, openMenu, setOpenMenu }) => {
  const location = useLocation();

  const toggleMenu = (label) => setOpenMenu(openMenu === label ? null : label);
  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (parent, sub) =>
    location.pathname.startsWith(getSubmenuPath(parent, sub));

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <FiMenu />
        </button>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item, idx) => {
          if (!item.sub) {
            return (
              <Link
                key={idx}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="menu-icon" />
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </Link>
            );
          }

          return (
            <div key={idx} className="menu-item-container">
              <div
                className={`menu-item has-sub ${openMenu === item.label ? 'open' : ''}`}
                onClick={() => toggleMenu(item.label)}
              >
                <item.icon className="menu-icon" />
                {!collapsed && <span className="menu-label">{item.label}</span>}
                {!collapsed && (
                  openMenu === item.label ? (
                    <FiChevronDown className="submenu-arrow" />
                  ) : (
                    <FiChevronRight className="submenu-arrow" />
                  )
                )}
              </div>

              {!collapsed && openMenu === item.label && (
                <div className="submenu">
                  {item.sub.map((sub, sidx) => (
                    <Link
                      key={sidx}
                      to={getSubmenuPath(item.label, sub)}
                      className={`submenu-item ${isSubmenuActive(item.label, sub) ? 'active' : ''}`}
                    >
                      {submenuIcons[sub] && (
                        <span className="submenu-icon">{submenuIcons[sub]}</span>
                      )}
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;