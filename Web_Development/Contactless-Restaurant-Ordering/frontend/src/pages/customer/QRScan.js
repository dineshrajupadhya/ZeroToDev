import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCamera, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const QRScan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableParam = searchParams.get('table');
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tableParam) {
      fetchTable();
    } else {
      setLoading(false);
    }
  }, [tableParam]);

  const fetchTable = async () => {
    try {
      const response = await api.get(`/qr/tables/${tableParam}`);
      setTable(response.data.table || response.data);
    } catch (err) {
      setError('Invalid table');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrdering = () => {
    localStorage.setItem('tableNumber', tableParam);
    navigate(`/menu?table=${tableParam}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
        />
      </div>
    );
  }

  if (!tableParam) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <FiCamera className="mx-auto text-6xl text-secondary-300 mb-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-secondary-900 mb-4"
          >
            Scan QR Code
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <p className="text-secondary-600 mb-6">
              Please scan the QR code at your table to start ordering
            </p>
            <div className="bg-secondary-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-secondary-800 mb-3">How to order:</h3>
              <div className="space-y-3 text-sm text-secondary-600">
                {[
                  'Find the QR code on your table',
                  "Open your phone's camera or QR scanner",
                  'Point your camera at the QR code',
                  'Tap the link to start ordering!',
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex items-start space-x-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    >
                      {i + 1}
                    </motion.div>
                    <span>{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
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
          className="max-w-lg mx-auto px-4 text-center"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Invalid Table</h1>
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-secondary-600 mb-4">{error}</p>
            <p className="text-sm text-secondary-500">Please scan a valid QR code from your table</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="bg-white rounded-xl shadow-md p-8 text-center"
        >
          {/* Pulsing table icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-primary-200 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute inset-0 bg-primary-300 rounded-full"
            />
            <div className="absolute inset-0 bg-primary-100 rounded-full flex items-center justify-center">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-4xl font-bold text-primary-600"
              >
                {table?.table_number || tableParam}
              </motion.span>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-secondary-900 mb-2"
          >
            Table {table?.table_number || tableParam}
          </motion.h1>

          <AnimatePresence>
            {table?.section && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-secondary-500 mb-1"
              >
                Section: {table.section}
              </motion.p>
            )}
            {table?.capacity && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-secondary-500 mb-6"
              >
                Capacity: {table.capacity} people
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartOrdering}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-primary-500/30"
            >
              <span>Start Ordering</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiArrowRight />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default QRScan;
