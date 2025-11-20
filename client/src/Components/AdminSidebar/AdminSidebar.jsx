// src/components/admin/AdminSidebar.jsx
import React, { useEffect } from 'react';
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
  
  FiUsers,
  FiFilePlus,
  FiShoppingCart,
  FiTruck,
  FiBox,
  FiLayers,
  FiBookOpen,
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
  const cleanSub = subLabel.toLowerCase().replace(/\s+/g, '-');
  return `${base}/${cleanSub}`;
};

const AdminSidebar = ({ collapsed, setCollapsed, openMenu, setOpenMenu }) => {
  const location = useLocation();

  // Auto-collapse sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed]);

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (parent, sub) =>
    location.pathname.startsWith(getSubmenuPath(parent, sub));

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
      
      </div>

      <nav className="sidebar-menu">
        {menu.map((item, idx) => {
          if (!item.sub) {
            return (
              <Link
                key={idx}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <item.icon className="menu-icon" />
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </Link>
            );
          }

          const isOpen = openMenu === item.label;

          return (
            <div key={idx} className="menu-item-container">
              <div
                className={`menu-item has-sub ${isOpen ? 'open' : ''}`}
                onClick={() => toggleMenu(item.label)}
              >
                <item.icon className="menu-icon" />
                {!collapsed && <span className="menu-label">{item.label}</span>}
                {!collapsed && (
                  <span className="submenu-arrow">
                    
                  </span>
                )}
              </div>

              {!collapsed && isOpen && (
                <div className="submenu">
                  {item.sub.map((sub, sidx) => (
                    <Link
                      key={sidx}
                      to={getSubmenuPath(item.label, sub)}
                      className={`submenu-item ${isSubmenuActive(item.label, sub) ? 'active' : ''}`}
                      style={{ textDecoration: 'none' }}
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
  );
};

export default AdminSidebar;