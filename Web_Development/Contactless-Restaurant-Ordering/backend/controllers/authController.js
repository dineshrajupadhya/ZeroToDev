const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = db.prepare('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)').run(name, email, passwordHash, phone);

    const token = generateToken(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      token,
      user: { id: result.lastInsertRowid, name, email, phone, role: 'customer' }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.updateProfile = (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
    }
    if (phone) {
      db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, userId);
    }

    const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(userId);

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
