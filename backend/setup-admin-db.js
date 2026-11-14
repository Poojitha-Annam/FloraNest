const db = require('./db');

(async () => {
  const steps = [
    // admins table
    `CREATE TABLE IF NOT EXISTS admins (
      admin_id   INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // categories table
    `CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      slug        VARCHAR(100) NOT NULL UNIQUE,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // seed categories
    `INSERT IGNORE INTO categories (name, slug) VALUES ('Flowers & Bouquets','flowers'),('Indoor Plants','indoor'),('Garden Plants','garden')`,
    // products table
    `CREATE TABLE IF NOT EXISTS products (
      product_id  INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(200) NOT NULL,
      description TEXT,
      price       DECIMAL(10,2) NOT NULL DEFAULT 0,
      image       VARCHAR(255),
      category_id INT,
      stock_qty   INT NOT NULL DEFAULT 50,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
    )`,
    // seed products
    `INSERT IGNORE INTO products (product_id, name, description, price, image, category_id, stock_qty) VALUES
      (1,'Classic Rose Bouquet','Beautiful roses for special moments.',499.00,'/images/rose-bouquet.png',1,50),
      (2,'Sunshine Bouquet','Bright sunflowers to make someone smile.',399.00,'/images/sunflower-bouquet.png',1,50),
      (3,'Pink Rose Bouquet','A lovely gift filled with pink roses.',599.00,'/images/pink-rose-bouquet.png',1,50),
      (4,'Mixed Flower Bouquet','A colorful collection of fresh flowers.',699.00,'/images/mixed-bouquet.png',1,50),
      (5,'Peace Lily Plant','A graceful touch of green for your home.',349.00,'/images/peace-lily.png',2,50),
      (6,'Money Plant','A refreshing green companion for your room.',199.00,'/images/money-plant.png',2,50),
      (7,'Snake Plant','An elegant plant for modern interiors.',299.00,'/images/snake-plant.png',2,50),
      (8,'Lucky Bamboo','A lovely green accent for your desk.',249.00,'/images/lucky-bamboo.png',2,50),
      (9,'Rose Garden Plant','Grow beautiful roses in your garden.',249.00,'/images/rose-plant.png',3,50),
      (10,'Mango Sapling','Start growing your own mango tree.',199.00,'/images/mango-sapling.png',3,50),
      (11,'Tomato Plant','Grow fresh tomatoes at home.',99.00,'/images/tomato-plant.png',3,50),
      (12,'Jasmine Plant','Enjoy fragrant jasmine flowers in your garden.',179.00,'/images/jasmine-plant.png',3,50)`,
    // add status column to orders
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'`,
    // add created_at to orders
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    // insert default admin — password: admin@floranest123
    `INSERT IGNORE INTO admins (name, email, password_hash) VALUES ('Admin','admin@floranest.com','$2b$12$voOmN.NGVxlJGxNr7mjzGeBXASAW1vf.oGj6rNsWxvqhjboDqK97q')`,
  ];

  for (const sql of steps) {
    try {
      await db.execute(sql);
      console.log('✅', sql.trim().substring(0, 60));
    } catch (e) {
      console.error('❌', e.message, '\n   SQL:', sql.trim().substring(0, 60));
    }
  }

  // Verify
  const [r1] = await db.execute('SELECT COUNT(*) as n FROM admins');
  const [r2] = await db.execute('SELECT COUNT(*) as n FROM products');
  const [r3] = await db.execute('SELECT COUNT(*) as n FROM categories');
  console.log('\n📋 Final counts — Admins:', r1[0].n, '| Products:', r2[0].n, '| Categories:', r3[0].n);
  process.exit(0);
})();
