const db = require('../config/database');

exports.getCategories = (req, res, next) => {
  try {
    const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY name').all();
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = (req, res, next) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide category name' });
    }

    const result = db.prepare('INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)').run(name, description, image_url);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = (req, res, next) => {
  try {
    const { name, description, image_url, is_active } = req.body;
    const categoryId = req.params.id;

    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    db.prepare('UPDATE categories SET name = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?').run(
      name || existingCategory.name,
      description !== undefined ? description : existingCategory.description,
      image_url !== undefined ? image_url : existingCategory.image_url,
      is_active !== undefined ? is_active : existingCategory.is_active,
      categoryId
    );

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = (req, res, next) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(req.params.id);

    res.status(200).json({ success: true, message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};
