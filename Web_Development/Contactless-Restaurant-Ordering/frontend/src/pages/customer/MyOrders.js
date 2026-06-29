import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiX, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-secondary-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <FiPackage className="mx-auto text-6xl text-secondary-300 mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">No orders yet</h2>
            <p className="text-secondary-500 mb-6">Start ordering from our delicious menu</p>
            <Link
              to="/menu"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-4"
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-secondary-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold text-secondary-800">Order #{order.order_number}</p>
                        <p className="text-sm text-secondary-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                      <span className="font-bold text-secondary-900">₹{order.total_amount?.toFixed(2)}</span>
                      {expandedOrder === order.id ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t p-4 bg-secondary-50">
                        <div className="space-y-2 mb-4">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-secondary-600">{item.name} x {item.quantity}</span>
                              <span className="font-medium text-secondary-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{order.total_amount?.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to={`/track/${order.order_number}`}
                            className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                          >
                            Track Order →
                          </Link>
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center space-x-1"
                            >
                              <FiX />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
