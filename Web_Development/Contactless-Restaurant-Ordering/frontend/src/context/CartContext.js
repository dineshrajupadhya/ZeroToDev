import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumberState] = useState(() => localStorage.getItem('tableNumber') || '');
  const { token } = useAuth();

  const setTableNumber = (num) => {
    setTableNumberState(num);
    if (num) {
      localStorage.setItem('tableNumber', num);
    } else {
      localStorage.removeItem('tableNumber');
    }
  };

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, specialInstructions = '') => {
    try {
      const response = await api.post('/cart/add', { productId, quantity, specialInstructions });
      setItems(response.data.items || []);
      toast.success('Item added to cart!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      setItems(response.data.items || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      setItems(response.data.items || []);
      toast.success('Item removed from cart');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear/all');
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      throw error;
    }
  };

  const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0);

  const totalPrice = items.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + price * (item.quantity || 1);
  }, 0);

  const value = {
    items,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    totalPrice,
    tableNumber,
    setTableNumber,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
