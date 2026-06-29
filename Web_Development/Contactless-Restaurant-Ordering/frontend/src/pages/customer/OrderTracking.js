import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const steps = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
];

const statusToStep = {
  pending: 0,
  placed: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  served: 4,
  completed: 4,
};

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderNumber}`);
      setOrder(response.data.order || response.data);
      setError(null);
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 animate-pulse">
            <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-secondary-200 rounded w-1/2 mb-8"></div>
            <div className="flex justify-between mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-secondary-200 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">{error}</h2>
          <p className="text-secondary-500">Please check your order number and try again</p>
        </motion.div>
      </div>
    );
  }

  const currentStep = statusToStep[order?.status] || 0;

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 md:p-8"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-secondary-900"
            >
              Order Tracking
            </motion.h1>
            <p className="text-secondary-500 mt-1">
              Order #{order?.order_number}
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative mb-12">
            <div className="absolute top-4 left-0 right-0 h-1 bg-secondary-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
            <div className="flex justify-between relative">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.15, type: 'spring', stiffness: 300 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'bg-secondary-200 text-secondary-500'
                      } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                    >
                      <AnimatePresence mode="wait">
                        {isActive ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                          >
                            <FiCheck className="text-sm" />
                          </motion.div>
                        ) : (
                          <motion.span
                            key="number"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs"
                          >
                            {index + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.15 + 0.2 }}
                      className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-primary-600' : 'text-secondary-400'
                      }`}
                    >
                      {step.label}
                    </motion.span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t pt-6"
          >
            <h2 className="font-semibold text-secondary-800 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order?.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-secondary-800">{item.name}</p>
                    <p className="text-sm text-secondary-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-secondary-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-t mt-4 pt-4 flex justify-between font-bold text-lg"
            >
              <span>Total</span>
              <span className="text-primary-500">₹{order?.total_amount?.toFixed(2)}</span>
            </motion.div>
          </motion.div>

          <div className="mt-6 text-center text-sm text-secondary-500">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Status updates automatically every 10 seconds
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;
