import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiGrid as FiTables, FiUsers, FiLogOut, FiMenu, FiX, FiChevronLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FiGrid },
    { path: '/admin/products', label: 'Products', icon: FiPackage },
    { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { path: '/admin/tables', label: 'Tables & QR', icon: FiTables },
    { path: '/admin/users', label: 'Users', icon: FiUsers },
  ];

  const handleLogout = () => { logout(); };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-secondary-900 text-white hidden md:flex flex-col"
      >
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg font-bold">
                Admin Panel
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:text-primary-400"
          >
            <motion.span animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <FiChevronLeft />
            </motion.span>
          </motion.button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-primary-500' : 'hover:bg-secondary-700'
                  }`}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-secondary-700">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-secondary-400 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="mt-3 w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-secondary-700 text-red-400"
          >
            <FiLogOut />
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 bg-secondary-900 text-white z-50"
            >
              <div className="p-4 flex items-center justify-between">
                <span className="text-lg font-bold">Admin Panel</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="hover:text-primary-400"
                >
                  <FiX />
                </motion.button>
              </div>
              <nav className="px-4 space-y-2">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive ? 'bg-primary-500' : 'hover:bg-secondary-700'
                        }`}
                      >
                        <Icon className="text-lg" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-secondary-700 text-red-400"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-secondary-600 hover:text-secondary-900"
            >
              <FiMenu className="text-xl" />
            </motion.button>
            <h1 className="text-xl font-semibold text-secondary-800">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-secondary-600">Welcome, {user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
