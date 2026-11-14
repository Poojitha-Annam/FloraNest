-- ============================================================
-- FloraNest Admin Dashboard — Database Setup
-- Run this once in MySQL Workbench or the MySQL CLI
-- ============================================================

USE floranest;

-- 1. Admins table
CREATE TABLE IF NOT EXISTS admins (
  admin_id   INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed default categories
INSERT IGNORE INTO categories (name, slug) VALUES
  ('Flowers & Bouquets', 'flowers'),
  ('Indoor Plants',      'indoor'),
  ('Garden Plants',      'garden');

-- 4. Products table (synced with existing product list in App.jsx)
CREATE TABLE IF NOT EXISTS products (
  product_id  INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  image       VARCHAR(255),
  category_id INT,
  stock_qty   INT NOT NULL DEFAULT 50,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- 5. Seed products from existing App.jsx product list
INSERT IGNORE INTO products (product_id, name, description, price, image, category_id, stock_qty)
SELECT * FROM (
  SELECT 1,  'Classic Rose Bouquet',  'Beautiful roses for special moments.',               499.00, '/images/rose-bouquet.png',       1, 50
  UNION ALL
  SELECT 2,  'Sunshine Bouquet',      'Bright sunflowers to make someone smile.',            399.00, '/images/sunflower-bouquet.png',  1, 50
  UNION ALL
  SELECT 3,  'Pink Rose Bouquet',     'A lovely gift filled with pink roses.',               599.00, '/images/pink-rose-bouquet.png',  1, 50
  UNION ALL
  SELECT 4,  'Mixed Flower Bouquet',  'A colorful collection of fresh flowers.',             699.00, '/images/mixed-bouquet.png',      1, 50
  UNION ALL
  SELECT 5,  'Peace Lily Plant',      'A graceful touch of green for your home.',            349.00, '/images/peace-lily.png',         2, 50
  UNION ALL
  SELECT 6,  'Money Plant',           'A refreshing green companion for your room.',         199.00, '/images/money-plant.png',        2, 50
  UNION ALL
  SELECT 7,  'Snake Plant',           'An elegant plant for modern interiors.',              299.00, '/images/snake-plant.png',        2, 50
  UNION ALL
  SELECT 8,  'Lucky Bamboo',          'A lovely green accent for your desk.',                249.00, '/images/lucky-bamboo.png',       2, 50
  UNION ALL
  SELECT 9,  'Rose Garden Plant',     'Grow beautiful roses in your garden.',                249.00, '/images/rose-plant.png',         3, 50
  UNION ALL
  SELECT 10, 'Mango Sapling',         'Start growing your own mango tree.',                  199.00, '/images/mango-sapling.png',      3, 50
  UNION ALL
  SELECT 11, 'Tomato Plant',          'Grow fresh tomatoes at home.',                         99.00, '/images/tomato-plant.png',       3, 50
  UNION ALL
  SELECT 12, 'Jasmine Plant',         'Enjoy fragrant jasmine flowers in your garden.',      179.00, '/images/jasmine-plant.png',      3, 50
) AS seed_data (product_id, name, description, price, image, category_id, stock_qty);

-- 6. Add status column to orders (if not present)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status ENUM('pending','processing','shipped','delivered','cancelled')
  NOT NULL DEFAULT 'pending';

-- 7. Add created_at to orders (if not present)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 8. Insert a default admin account
--    Password is: admin@floranest123   (bcrypt hash below)
--    Change this after first login!
INSERT IGNORE INTO admins (name, email, password_hash) VALUES (
  'Admin',
  'admin@floranest.com',
  '$2b$12$voOmN.NGVxlJGxNr7mjzGeBXASAW1vf.oGj6rNsWxvqhjboDqK97q'
);
