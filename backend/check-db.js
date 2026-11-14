const db = require('./db');
(async () => {
  try {
    const [r1] = await db.execute('SELECT COUNT(*) as n FROM admins');
    console.log('Admins:', r1[0].n);
    const [r2] = await db.execute('SELECT COUNT(*) as n FROM products');
    console.log('Products:', r2[0].n);
    const [r3] = await db.execute('SELECT COUNT(*) as n FROM categories');
    console.log('Categories:', r3[0].n);
    const [r4] = await db.execute('SHOW COLUMNS FROM orders LIKE "status"');
    console.log('orders.status column:', r4.length > 0 ? 'EXISTS' : 'MISSING');
  } catch(e) { console.error('ERROR:', e.message); }
  process.exit(0);
})();
