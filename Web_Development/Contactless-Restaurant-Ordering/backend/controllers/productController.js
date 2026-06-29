const db = require('../config/database');

exports.getProducts = (req, res, next) => {
  try {
    const { search, category_id, is_available } = req.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (is_available !== undefined) {
      query += ' AND p.is_available = ?';
      params.push(is_available === 'true' ? 1 : 0);
    }

    query += ' ORDER BY p.created_at DESC';

    const products = db.prepare(query).all(...params);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = (req, res, next) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, is_available, preparation_time } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Please provide name and price' });
    }

    const result = db.prepare(
      'INSERT INTO products (name, description, price, category_id, image_url, is_available, preparation_time) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, description, price, category_id, image_url, is_available !== undefined ? is_available : 1, preparation_time || 15);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, is_available, preparation_time } = req.body;
    const productId = req.params.id;

    const existingProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    db.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?, preparation_time = ? WHERE id = ?'
    ).run(
      name || existingProduct.name,
      description !== undefined ? description : existingProduct.description,
      price || existingProduct.price,
      category_id || existingProduct.category_id,
      image_url !== undefined ? image_url : existingProduct.image_url,
      is_available !== undefined ? is_available : existingProduct.is_available,
      preparation_time || existingProduct.preparation_time,
      productId
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = (req, res, next) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    db.prepare('UPDATE products SET is_available = 0 WHERE id = ?').run(req.params.id);

    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
