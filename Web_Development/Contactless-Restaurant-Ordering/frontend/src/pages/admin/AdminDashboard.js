import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiDollarSign, FiClock, FiStar, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { CountUp, FadeIn, StaggerContainer, StaggerItem } from '../../components/PageTransition';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      const data = response.data.dashboard || response.data;
      setStats(data);
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-500', suffix: '' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'bg-green-500', suffix: '' },
    { label: 'Total Revenue', value: stats?.totalRevenue || 0, icon: FiDollarSign, color: 'bg-primary-500', suffix: '', prefix: '₹', decimals: 2 },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: FiClock, color: 'bg-yellow-500', suffix: '' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: FiTrendingUp, color: 'bg-purple-500', suffix: '' },
  ];

  return (
    <div className="space-y-6">
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" staggerDelay={0.1}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-xl shadow-md p-6 cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-500">{card.label}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">
                      {card.prefix || ''}
                      <CountUp target={card.value} duration={1.5} />
                      {card.suffix}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`${card.color} p-3 rounded-lg`}
                  >
                    <Icon className="text-white text-xl" />
                  </motion.div>
                </div>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary-500 hover:text-primary-600 font-medium text-sm">
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {recentOrders.slice(0, 5).map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="hover:bg-secondary-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">#{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">{order.user_name || 'Guest'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">₹{order.total_amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-secondary-500">No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.4}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                <FiStar className="text-yellow-500" />
                <span>Top Products</span>
              </h2>
            </div>
            <div className="p-6">
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-secondary-300'
                        }`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-800">{product.name}</p>
                          <p className="text-xs text-secondary-500">{product.total_quantity} sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-secondary-900">₹{product.total_revenue?.toFixed(2)}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 text-center py-4">No product data yet</p>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-secondary-900">Order Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-secondary-600">Total Revenue</span>
                <span className="text-xl font-bold text-green-600">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-secondary-600">Today's Orders</span>
                <span className="text-xl font-bold text-primary-500">{stats?.todayOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-secondary-600">Pending Orders</span>
                <span className="text-xl font-bold text-yellow-500">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-secondary-600">Avg. Order Value</span>
                <span className="text-xl font-bold text-secondary-900">
                  ₹{stats?.totalOrders > 0 ? (stats?.totalRevenue / stats?.totalOrders).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default AdminDashboard;
