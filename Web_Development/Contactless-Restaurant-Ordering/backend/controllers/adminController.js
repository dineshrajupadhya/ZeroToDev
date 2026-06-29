const db = require('../config/database');

exports.getDashboard = (req, res, next) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != ?').get('cancelled').total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE(?)").get(today).count;

    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `).all();

    const topProducts = db.prepare(`
      SELECT oi.name, SUM(oi.quantity) as total_quantity, SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.name
      ORDER BY total_quantity DESC
      LIMIT 5
    `).all();

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        todayOrders,
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, email, phone, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const users = db.prepare(query).all(...params);

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid role (customer or admin)' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);

    const updatedUser = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(userId);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};
