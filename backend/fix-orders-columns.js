const db = require('./db');

(async () => {
  // Add status column if not already present
  try {
    const [cols] = await db.execute('SHOW COLUMNS FROM orders LIKE "status"');
    if (cols.length === 0) {
      await db.execute(`ALTER TABLE orders ADD COLUMN status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'`);
      console.log('✅ Added orders.status column');
    } else {
      console.log('ℹ️  orders.status already exists');
    }
  } catch(e) { console.error('❌ status column:', e.message); }

  // Add created_at column if not already present
  try {
    const [cols] = await db.execute('SHOW COLUMNS FROM orders LIKE "created_at"');
    if (cols.length === 0) {
      await db.execute('ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ Added orders.created_at column');
    } else {
      console.log('ℹ️  orders.created_at already exists');
    }
  } catch(e) { console.error('❌ created_at column:', e.message); }

  console.log('Done!');
  process.exit(0);
})();
