const db = require('../config/database');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/email');

const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const lastOrder = db.prepare("SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1").get(`ORD-${dateStr}-%`);

  let sequence = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.order_number.split('-')[2], 10);
    sequence = lastSeq + 1;
  }

  return `ORD-${dateStr}-${String(sequence).padStart(4, '0')}`;
};

exports.createOrder = (req, res, next) => {
  try {
    const table_number = req.body.table_number || req.body.tableNumber;
    const order_type = req.body.order_type || req.body.orderType || 'dine_in';

    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.is_available
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const unavailableItems = cartItems.filter(item => !item.is_available);
    if (unavailableItems.length > 0) {
      return res.status(400).json({ success: false, message: 'Some items in cart are no longer available' });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const totalAmount = subtotal + tax;

    const orderNumber = generateOrderNumber();

    const insertOrder = db.prepare(
      'INSERT INTO orders (order_number, user_id, table_number, order_type, subtotal, tax, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const orderResult = insertOrder.run(orderNumber, req.user.id, table_number, order_type || 'dine_in', subtotal, tax, totalAmount);

    const orderId = orderResult.lastInsertRowid;

    const insertOrderItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, name, price, quantity, special_instructions) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertOrderItem.run(orderId, item.product_id, item.name, item.price, item.quantity, item.special_instructions);
      }
    });

    insertMany(cartItems);

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(req.user.id);
    if (user) {
      sendOrderConfirmation(user, { ...order, items: orderItems }).catch(err =>
        console.error('Order confirmation email failed:', err.message)
      );
    }

    res.status(201).json({ success: true, order: { ...order, items: orderItems } });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = (req, res, next) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.status(200).json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = (req, res, next) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    res.status(200).json({ success: true, order: { ...order, items } });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = (req, res, next) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);

    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.status(200).json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served'],
      served: [],
      cancelled: []
    };

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(order.user_id);
    if (user) {
      const oldStatus = order.status;
      sendOrderStatusUpdate(user, { ...updatedOrder, items }, oldStatus).catch(err =>
        console.error('Status update email failed:', err.message)
      );
    }

    res.status(200).json({ success: true, order: { ...updatedOrder, items } });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = (req, res, next) => {
  try {
    const orderId = req.params.id;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', orderId);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(order.user_id);
    if (user) {
      sendOrderStatusUpdate(user, { ...updatedOrder, items }, order.status).catch(err =>
        console.error('Cancel email failed:', err.message)
      );
    }

    res.status(200).json({ success: true, order: { ...updatedOrder, items } });
  } catch (error) {
    next(error);
  }
};
