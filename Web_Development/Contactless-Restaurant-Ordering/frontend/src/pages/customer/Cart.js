import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, tableNumber, setTableNumber } = useCart();
  const [orderType, setOrderType] = useState('dine_in');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const tax = totalPrice * 0.05;
  const total = totalPrice + tax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (orderType === 'dine_in' && !tableNumber) {
      toast.error('Please enter your table number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      });
      await clearCart();
      setTableNumber('');
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FiShoppingBag className="mx-auto text-6xl text-secondary-300 mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Your cart is empty</h2>
          <p className="text-secondary-500 mb-6">Add some delicious items from our menu</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              to="/menu"
              className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FiArrowLeft />
              <span>Browse Menu</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900">Your Cart</h1>
          <Link to="/menu" className="text-primary-500 hover:text-primary-600 font-medium flex items-center space-x-1">
            <FiArrowLeft />
            <span>Continue Shopping</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                  className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-300 to-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {(item.name || 'I').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-800">{item.name}</h3>
                    <p className="text-primary-500 font-medium">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiMinus />
                    </motion.button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="font-semibold w-8 text-center"
                    >
                      {item.quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center"
                    >
                      <FiPlus />
                    </motion.button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <motion.button
                      whileHover={{ scale: 1.2, color: '#ef4444' }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 mt-1"
                    >
                      <FiTrash2 />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Order Summary</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-3">Order Type</label>
                <div className="flex space-x-4">
                  {['dine_in', 'takeaway'].map((type) => (
                    <motion.label
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                        orderType === type ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value={type}
                        checked={orderType === type}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span>{type === 'dine_in' ? 'Dine In' : 'Takeaway'}</span>
                    </motion.label>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {orderType === 'dine_in' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 overflow-hidden"
                  >
                    {tableNumber ? (
                      <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2 text-primary-700">
                          <FiMapPin className="text-primary-500" />
                          <span>Table <strong>{tableNumber}</strong> (from QR scan)</span>
                        </div>
                        <button
                          onClick={() => setTableNumber('')}
                          className="text-sm text-primary-500 hover:text-primary-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Table Number</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="e.g. T1"
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <motion.span key={totalPrice} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                    ₹{totalPrice.toFixed(2)}
                  </motion.span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-secondary-900">
                  <span>Total</span>
                  <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-primary-500">
                    ₹{total.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-primary-500/30"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
