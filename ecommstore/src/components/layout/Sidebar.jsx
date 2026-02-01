'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { 
  Home, 
  FolderTree, 
  Package, 
  FileText, 
  Tag, 
  Users, 
  ShoppingCart, 
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus,
  Edit
} from 'lucide-react';

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { adminID } = useParams();
  const menuItems = [
  {
    name: 'Home',
    href: `/admin/${adminID}`,
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: 'Categories',
    href: `/admin/${adminID}/categories`,
    icon: <FolderTree className="w-5 h-5" />,
    subItems: [
      { name: 'Add Category', href: `/admin/${adminID}/categories/new`, icon: <Plus className="w-4 h-4" /> },
    ],
  },
  {
    name: 'Products',
    href: `/admin/${adminID}/products`,
    icon: <Package className="w-5 h-5" />,
    subItems: [
      { name: 'Add Product', href: `/admin/${adminID}/products/new`, icon: <Plus className="w-4 h-4" /> },
    ],
  },
  {
    name: 'Blog',
    href: `/admin/${adminID}/blog`,
    icon: <FileText className="w-5 h-5" />,
    subItems: [
      { name: 'Add Blog Post', href: `/admin/${adminID}/blog/add`, icon: <Plus className="w-4 h-4" /> },
    ],
  },
  {
    name: 'Coupons',
    href: `/admin/${adminID}/coupons`,
    icon: <Tag className="w-5 h-5" />,
  },
  {
    name: 'Customers',
    href: `/admin/${adminID}/customers`,
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Orders',
    href: `/admin/${adminID}/orders`,
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    name: 'Settings',
    href: `/admin/${adminID}/settings`,
    icon: <Settings className="w-5 h-5" />,
  },
];


  const toggleExpanded = (itemName) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href) => {
    if (href === '/admin/' + adminID) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-5.5 left-4 z-50 p-2 bg-black text-white rounded shadow-lg hover:bg-blue-600 transition-all duration-300"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-(--border-default)
          transition-transform duration-300 ease-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 flex flex-col shadow-xl lg:shadow-none
        `}
      >
        {/* Logo/Header */}
        <div className="h-20 flex items-center px-6 border-b border-(--border-default) bg-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-(--color-brand-primary) rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-300)">E-Commerce</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              {/* Main Menu Item */}
              <div className="relative group">
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center justify-between mb-2.5 px-4 py-3 rounded-lg
                    transition-all duration-200 font-medium text-sm
                    ${
                      isActive(item.href)
                        ? 'bg-black text-white shadow-md'
                        : 'text-(--text-primary) hover:bg-(--bg-surface) hover:text-(--text-hover)'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive(item.href) ? 'text-white' : ''}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  
                  {item.subItems && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpanded(item.name);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </Link>

                {/* Active Indicator */}
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-(--color-brand-primary) rounded-r-full" />
                )}
              </div>

              {/* Sub Menu Items */}
              {item.subItems && expandedItems.includes(item.name) && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-(--border-default) pl-4">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center space-x-3 px-4 py-2.5 rounded-lg
                        transition-all duration-200 text-sm
                        ${
                          pathname === subItem.href
                            ? 'bg-(--color-brand-primary) text-white shadow-sm'
                            : 'text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-hover)'
                        }
                      `}
                    >
                      {subItem.icon}
                      <span>{subItem.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-(--border-default)] bg-(--bg-surface)">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 bg-(--color-brand-primary) rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--text-primary) truncate">
                Admin User
              </p>
              <p className="text-xs text-(--text-secondary) truncate">
                admin@store.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for main content on desktop */}
      <div className="hidden lg:block w-72 shrink-0" />
    </>
  );
}

export default Sidebar;