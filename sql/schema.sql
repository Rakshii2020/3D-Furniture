-- ============================================================
-- FURNITURE VIEWER DATABASE SCHEMA
-- Run this file in MySQL to set up the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS furniture_db;
USE furniture_db;

-- ============================================================
-- USERS TABLE (for login/session system)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- store hashed password
    role        ENUM('user','admin') DEFAULT 'user',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    icon        VARCHAR(10)
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    category_id     INT,
    price           DECIMAL(10,2) NOT NULL,
    description     TEXT,
    material        VARCHAR(100),
    dimensions      VARCHAR(100),   -- e.g. "80W x 85H x 90D cm"
    weight          VARCHAR(50),
    color_options   VARCHAR(255),   -- JSON array stored as string
    model_file      VARCHAR(255),   -- path to .glb / .gltf
    image_url       VARCHAR(255),
    in_stock        BOOLEAN DEFAULT TRUE,
    rating          DECIMAL(3,2) DEFAULT 4.5,
    review_count    INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- CART TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT DEFAULT 1,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- WISHLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA: CATEGORIES
-- ============================================================
INSERT INTO categories (name, icon) VALUES
    ('Sofas',    '🛋'),
    ('Chairs',   '🪑'),
    ('Tables',   '🪵'),
    ('Beds',     '🛏'),
    ('Shelves',  '📚'),
    ('Lamps',    '💡');

-- ============================================================
-- SEED DATA: PRODUCTS
-- ============================================================
INSERT INTO products
  (name, category_id, price, description, material, dimensions, weight, color_options, model_file, image_url, rating, review_count)
VALUES
(
  'Nordic Cloud Sofa', 1, 1299.00,
  'Sink into pure comfort with the Nordic Cloud Sofa. Featuring premium Scandinavian design with deep cushioning and solid oak legs, this sofa transforms any living room into a cozy retreat.',
  'Premium Linen, Solid Oak',
  '220W x 85H x 95D cm',
  '48 kg',
  '["#E8DCC8","#6B5B45","#4A6741","#2C3E50","#8B7355"]',
  'models/sofa.glb',
  'images/sofa.jpg',
  4.8, 124
),
(
  'Eames Orbit Chair', 2, 549.00,
  'A masterpiece of mid-century modern design reimagined for today. The Eames Orbit Chair features molded fiberglass shell, chrome legs, and unparalleled ergonomic support for those long working sessions.',
  'Fiberglass Shell, Chrome Steel',
  '65W x 80H x 60D cm',
  '12 kg',
  '["#F5F5F0","#2C2C2C","#C41E3A","#1E4D8C","#4A7C59"]',
  'models/chair.glb',
  'images/chair.jpg',
  4.9, 89
),
(
  'Zen Coffee Table', 3, 399.00,
  'Clean lines and Japanese minimalism define the Zen Coffee Table. Hand-crafted walnut top with hairpin steel legs creates a perfect balance of warmth and industrial chic.',
  'Solid Walnut, Steel',
  '120W x 42H x 60D cm',
  '18 kg',
  '["#8B6914","#3D2B1F","#D4A853","#F0EBE3"]',
  'models/table.glb',
  'images/table.jpg',
  4.7, 67
),
(
  'Serenity Platform Bed', 4, 1899.00,
  'Experience sleep like never before with the Serenity Platform Bed. Low-profile design with upholstered headboard and solid wood slats, supporting any mattress type with silent elegance.',
  'Upholstered Velvet, Solid Beech',
  '160W x 45H x 210D cm',
  '65 kg',
  '["#7B6B8D","#2C2C2C","#C4A882","#4A4A6A","#8B4513"]',
  'models/bed.glb',
  'images/bed.jpg',
  4.6, 203
),
(
  'Modular Floating Shelf', 5, 249.00,
  'Rethink your storage with this infinitely configurable floating shelf system. Mix and match modules to create a wall display that is uniquely yours, with hidden mounting hardware.',
  'Powder-Coated Steel, MDF',
  '90W x 20H x 25D cm (per module)',
  '4 kg',
  '["#FFFFFF","#2C2C2C","#E8DCC8","#5C7A5C","#4A6B8A"]',
  'models/shelf.glb',
  'images/shelf.jpg',
  4.5, 156
),
(
  'Arc Floor Lamp', 6, 329.00,
  'Cast a warm, directional glow with the Arc Floor Lamp. Its sweeping marble base and brushed brass arc bring designer flair to any corner. Compatible with smart bulbs.',
  'Marble Base, Brass, Fabric Shade',
  '35W x 180H x 120 Arc cm',
  '14 kg',
  '["#B8A88A","#2C2C2C","#D4AF37","#C0C0C0"]',
  'models/lamp.glb',
  'images/lamp.jpg',
  4.8, 91
),
(
  'Lounge Accent Chair', 2, 699.00,
  'Bold and sculptural, the Lounge Accent Chair commands attention in any room. Solid beech frame with hand-stitched leather upholstery and polished brass accents scream quiet luxury.',
  'Full-Grain Leather, Solid Beech, Brass',
  '75W x 88H x 80D cm',
  '22 kg',
  '["#8B4513","#2C1810","#D4A853","#1C1C1C","#8B8B6B"]',
  'models/accent_chair.glb',
  'images/accent_chair.jpg',
  4.9, 44
),
(
  'Oslo Dining Table', 3, 899.00,
  'Gather around the Oslo Dining Table for unforgettable meals. Extendable solid oak top seats 6–8 guests, with a simple butterfly leaf mechanism hidden within the sleek silhouette.',
  'Solid Oak, Powder-Coated Steel',
  '160-220W x 75H x 90D cm',
  '55 kg',
  '["#A0835A","#3D2B1F","#D4C4A8","#2C2C2C"]',
  'models/dining_table.glb',
  'images/dining_table.jpg',
  4.7, 78
);

-- ============================================================
-- SEED DATA: DEMO ADMIN USER
-- password = "admin123" (SHA-256 hashed)
-- ============================================================
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@furniture.com',
   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
   'admin'),
  ('demo', 'demo@furniture.com',
   '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea',
   'user');

-- NOTE: In production, use bcrypt for password hashing!
