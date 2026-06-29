import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiChevronDown, FiCamera } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [qrMenuOpen, setQrMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    ...(user ? [{ to: '/orders', label: 'My Orders' }] : []),
  ];

  return (
    <nav className="bg-secondary-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.span
              className="text-2xl font-bold text-primary-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contactless Cafe
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div key={link.to} whileHover={{ y: -2 }}>
                <Link
                  to={link.to}
                  className="hover:text-primary-400 transition-colors relative group"
                >
                  <span>{link.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}

            {/* Scan QR Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setQrMenuOpen(!qrMenuOpen)}
                className="hover:text-primary-400 transition-colors flex items-center space-x-1"
              >
                <FiCamera className="text-sm" />
                <span>Scan QR</span>
                <motion.span animate={{ rotate: qrMenuOpen ? 180 : 0 }}>
                  <FiChevronDown />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {qrMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-48 bg-white text-secondary-900 rounded-md shadow-lg py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-sm">Select a Table</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {tables.map((table) => (
                        <Link
                          key={table}
                          to={`/scan?table=${table}`}
                          className="block px-3 py-2 text-sm rounded hover:bg-primary-50 hover:text-primary-600 text-center font-medium transition-colors"
                          onClick={() => setQrMenuOpen(false)}
                        >
                          {table}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/cart" className="relative hover:text-primary-400 transition-colors">
                <FiShoppingCart className="text-xl" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 hover:text-primary-400 transition-colors"
                >
                  <FiUser className="text-xl" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }}>
                    <FiChevronDown />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white text-secondary-900 rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-secondary-500">{user.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 hover:bg-secondary-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 hover:bg-secondary-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-secondary-100 text-red-600"
                      >
                        <FiLogOut className="inline mr-2" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden hover:text-primary-400 transition-colors"
            >
              {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-secondary-700"
            >
              <div className="py-4 space-y-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      className="block hover:text-primary-400 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile QR Tables */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <div className="flex items-center space-x-1 text-primary-400 py-1">
                    <FiCamera className="text-sm" />
                    <span className="font-medium">Scan QR</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2 ml-6">
                    {tables.map((table) => (
                      <Link
                        key={table}
                        to={`/scan?table=${table}`}
                        className="block px-2 py-1.5 text-xs text-center bg-secondary-800 hover:bg-primary-500 rounded transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {table}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {user ? (
                  <>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <Link to="/cart" className="block hover:text-primary-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                        Cart ({itemCount})
                      </Link>
                    </motion.div>
                    {isAdmin && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: (navLinks.length + 2) * 0.1 }}
                      >
                        <Link to="/admin" className="block hover:text-primary-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                          Admin Panel
                        </Link>
                      </motion.div>
                    )}
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 3) * 0.1 }}
                      onClick={handleLogout}
                      className="text-left text-red-400 hover:text-red-300 py-1"
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <Link to="/login" className="block hover:text-primary-400 py-1" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navLinks.length + 2) * 0.1 }}
                    >
                      <Link
                        to="/signup"
                        className="block bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
