const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seed = async () => {
  try {
    console.log('Seeding database...');

    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM cart_items');
    db.exec('DELETE FROM payments');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM tables');
    db.exec('DELETE FROM users');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@cafe.com', adminPassword, 'admin');
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('John Doe', 'user@cafe.com', userPassword, 'customer');

    console.log('Users created');

    const categories = [
      { name: 'Beverages', description: 'Hot and cold drinks', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop' },
      { name: 'Main Course', description: 'Delicious main dishes', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' },
      { name: 'Appetizers', description: 'Starters and small plates', image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop' },
      { name: 'Desserts', description: 'Sweet treats', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop' },
      { name: 'Snacks', description: 'Light bites', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop' },
      { name: 'Salads', description: 'Fresh and healthy salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' }
    ];

    const insertCategory = db.prepare('INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)');
    const categoryIds = {};

    for (const cat of categories) {
      const result = insertCategory.run(cat.name, cat.description, cat.image);
      categoryIds[cat.name] = result.lastInsertRowid;
    }

    console.log('Categories created');

    const products = [
      { name: 'Espresso', description: 'Rich and bold single shot espresso', price: 99, category: 'Beverages', prepTime: 5, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop' },
      { name: 'Cappuccino', description: 'Classic Italian coffee with steamed milk foam', price: 149, category: 'Beverages', prepTime: 7, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop' },
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 179, category: 'Beverages', prepTime: 5, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop' },
      { name: 'Mojito', description: 'Refreshing mint and lime cocktail', price: 229, category: 'Beverages', prepTime: 5, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop' },
      { name: 'Grilled Chicken Breast', description: 'Tender grilled chicken with herbs and spices', price: 449, category: 'Main Course', prepTime: 25, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop' },
      { name: 'Beef Steak', description: 'Premium cut beef steak grilled to perfection', price: 699, category: 'Main Course', prepTime: 30, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop' },
      { name: 'Pasta Carbonara', description: 'Classic Italian pasta with creamy egg sauce and pancetta', price: 399, category: 'Main Course', prepTime: 20, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop' },
      { name: 'Margherita Pizza', description: 'Traditional pizza with tomato sauce, mozzarella, and basil', price: 349, category: 'Main Course', prepTime: 18, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop' },
      { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce', price: 599, category: 'Main Course', prepTime: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop' },
      { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 249, category: 'Appetizers', prepTime: 12, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop' },
      { name: 'Bruschetta', description: 'Toasted bread with fresh tomatoes, garlic, and basil', price: 279, category: 'Appetizers', prepTime: 10, image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop' },
      { name: 'Calamari', description: 'Crispy fried squid rings with marinara sauce', price: 349, category: 'Appetizers', prepTime: 15, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop' },
      { name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 299, category: 'Desserts', prepTime: 5, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop' },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center', price: 349, category: 'Desserts', prepTime: 15, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop' },
      { name: 'Cheesecake', description: 'Creamy New York style cheesecake', price: 279, category: 'Desserts', prepTime: 5, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop' },
      { name: 'French Fries', description: 'Crispy golden french fries', price: 149, category: 'Snacks', prepTime: 10, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 179, category: 'Snacks', prepTime: 8, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop' },
      { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing and croutons', price: 329, category: 'Salads', prepTime: 10, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop' },
      { name: 'Greek Salad', description: 'Mediterranean salad with feta cheese and olives', price: 349, category: 'Salads', prepTime: 8, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop' }
    ];

    const insertProduct = db.prepare('INSERT INTO products (name, description, price, category_id, preparation_time, image_url) VALUES (?, ?, ?, ?, ?, ?)');

    for (const prod of products) {
      insertProduct.run(prod.name, prod.description, prod.price, categoryIds[prod.category], prod.prepTime, prod.image);
    }

    console.log('Products created');

    const tables = [
      { number: 'T1', capacity: 2, section: 'indoor' },
      { number: 'T2', capacity: 4, section: 'indoor' },
      { number: 'T3', capacity: 4, section: 'indoor' },
      { number: 'T4', capacity: 6, section: 'indoor' },
      { number: 'T5', capacity: 2, section: 'outdoor' },
      { number: 'T6', capacity: 4, section: 'outdoor' },
      { number: 'T7', capacity: 4, section: 'outdoor' },
      { number: 'T8', capacity: 8, section: 'outdoor' },
      { number: 'T9', capacity: 2, section: 'indoor' },
      { number: 'T10', capacity: 6, section: 'outdoor' }
    ];

    const insertTable = db.prepare('INSERT INTO tables (table_number, capacity, section) VALUES (?, ?, ?)');

    for (const table of tables) {
      insertTable.run(table.number, table.capacity, table.section);
    }

    console.log('Tables created');
    console.log('Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@cafe.com / admin123');
    console.log('Customer: user@cafe.com / user123');

    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    return false;
  }
};

module.exports = seed;

if (require.main === module) {
  seed().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
