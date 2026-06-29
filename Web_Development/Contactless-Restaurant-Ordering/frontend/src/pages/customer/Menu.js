import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiMinus, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { items, addToCart, updateQuantity, tableNumber, setTableNumber } = useCart();
  const { token } = useAuth();

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        const catData = catRes.data;
        const prodData = prodRes.data;
        setCategories(Array.isArray(catData) ? catData : catData.categories || []);
        setProducts(Array.isArray(prodData) ? prodData : prodData.products || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === parseInt(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvailable = product.is_available !== 0;
    return matchesCategory && matchesSearch && isAvailable;
  });

  const getCartItem = (productId) => {
    return items.find((item) => item.product_id === productId);
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product.id, 1);
    } catch (error) {}
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Our Menu</h1>
          <AnimatePresence>
            {tableNumber && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-lg text-sm">
                  <FiMapPin className="text-primary-500" />
                  <span>Ordering for <strong>Table {tableNumber}</strong></span>
                  <button onClick={() => setTableNumber('')} className="ml-2 text-primary-400 hover:text-primary-600 underline">
                    Change
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.2)' }}
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 overflow-x-auto pb-2"
        >
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-secondary-700 hover:bg-secondary-100 border border-secondary-200'
              }`}
            >
              All
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(String(category.id))}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === String(category.id)
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-secondary-700 hover:bg-secondary-100 border border-secondary-200'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-40 bg-secondary-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <p className="text-secondary-500 text-lg">No products found</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`${product.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                        <motion.span
                          className="text-white text-5xl font-bold"
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {product.name.charAt(0)}
                        </motion.span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-primary-600 font-bold text-sm">₹{product.price?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-secondary-800">{product.name}</h3>
                      {product.description && (
                        <p className="text-secondary-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-primary-500 font-bold text-xl">₹{product.price?.toFixed(2)}</span>
                        {cartItem ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-3"
                          >
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleQuantityChange(cartItem, cartItem.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center"
                            >
                              <FiMinus />
                            </motion.button>
                            <motion.span
                              key={cartItem.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="font-semibold"
                            >
                              {cartItem.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleQuantityChange(cartItem, cartItem.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center"
                            >
                              <FiPlus />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddToCart(product)}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Add to Cart
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
