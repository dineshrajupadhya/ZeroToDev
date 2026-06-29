import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';
import PageTransition from './components/PageTransition';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import OrderTracking from './pages/customer/OrderTracking';
import QRScan from './pages/customer/QRScan';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTables from './pages/admin/AdminTables';
import AdminUsers from './pages/admin/AdminUsers';

const CustomerLayout = () => (
  <>
    <Navbar />
    <PageTransition>
      <Outlet />
    </PageTransition>
  </>
);

const AnimatedRoute = ({ children }) => (
  <PageTransition>{children}</PageTransition>
);

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<GuestRoute><AnimatedRoute><Login /></AnimatedRoute></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><AnimatedRoute><Signup /></AnimatedRoute></GuestRoute>} />
        <Route path="/scan" element={<AnimatedRoute><QRScan /></AnimatedRoute>} />

        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/track/:orderNumber" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AnimatedRoute><AdminDashboard /></AnimatedRoute>} />
          <Route path="products" element={<AnimatedRoute><AdminProducts /></AnimatedRoute>} />
          <Route path="orders" element={<AnimatedRoute><AdminOrders /></AnimatedRoute>} />
          <Route path="tables" element={<AnimatedRoute><AdminTables /></AnimatedRoute>} />
          <Route path="users" element={<AnimatedRoute><AdminUsers /></AnimatedRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
