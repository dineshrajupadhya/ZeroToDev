const db = require('../config/database');

exports.getCart = (req, res, next) => {
  try {
    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.is_available
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({ success: true, count: cartItems.length, items: cartItems, total });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = (req, res, next) => {
  try {
    const product_id = req.body.product_id || req.body.productId;
    const quantity = req.body.quantity;
    const special_instructions = req.body.special_instructions || req.body.specialInstructions;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Please provide product_id' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_available = 1').get(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const existingItem = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);

    if (existingItem) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ?, special_instructions = ? WHERE id = ?').run(
        quantity || 1,
        special_instructions || existingItem.special_instructions,
        existingItem.id
      );
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity, special_instructions) VALUES (?, ?, ?, ?)').run(
        req.user.id,
        product_id,
        quantity || 1,
        special_instructions
      );
    }

    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({ success: true, count: cartItems.length, items: cartItems, total });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = (req, res, next) => {
  try {
    const { quantity, special_instructions } = req.body;
    const cartItemId = req.params.itemId;

    const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(cartItemId, req.user.id);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(cartItemId);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ?, special_instructions = ? WHERE id = ?').run(
          quantity,
          special_instructions !== undefined ? special_instructions : cartItem.special_instructions,
          cartItemId
        );
      }
    }

    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({ success: true, count: cartItems.length, items: cartItems, total });
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = (req, res, next) => {
  try {
    const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.itemId, req.user.id);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.itemId);

    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({ success: true, count: cartItems.length, items: cartItems, total });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = (req, res, next) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    res.status(200).json({ success: true, message: 'Cart cleared', cartItems: [], total: 0 });
  } catch (error) {
    next(error);
  }
};
