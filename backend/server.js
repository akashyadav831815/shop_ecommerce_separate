const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;
const databaseDirectory = path.join(__dirname, "database");
fs.mkdirSync(databaseDirectory, { recursive: true });
const db = new Database(path.join(databaseDirectory, "products.db"));

// Allow the separately hosted frontend to call this API.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL
  )
`);

const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
if (productCount === 0) {
  const insert = db.prepare(`INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)`);
  const products = [
    ["Wireless Headphones", "Comfortable over-ear headphones with clear sound and wireless connectivity.", 2499, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "Electronics"],
    ["Smart Watch", "A stylish smart watch for activity tracking and everyday notifications.", 3999, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", "Electronics"],
    ["Running Shoes", "Lightweight running shoes designed for daily workouts and walking.", 1899, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "Fashion"],
    ["Travel Backpack", "A practical backpack with multiple compartments for work, school, or travel.", 1299, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", "Accessories"],
    ["Classic Sunglasses", "Classic-frame sunglasses for a simple, versatile everyday look.", 799, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800", "Accessories"],
    ["Coffee Maker", "Compact coffee maker for preparing a fresh cup at home.", 2799, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "Home"]
  ];
  const insertMany = db.transaction((items) => items.forEach((item) => insert.run(...item)));
  insertMany(products);
}

function productToJson(row) {
  return { id: row.id, name: row.name, description: row.description, price: row.price, image_url: row.image_url, category: row.category };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", message: "E-commerce API is running" }));

// GET /api/products?search=watch&category=Electronics
app.get("/api/products", (req, res) => {
  const search = String(req.query.search || "").trim();
  const category = String(req.query.category || "").trim();
  if (search.length > 100 || category.length > 60) return res.status(400).json({ error: "Search or category parameter is too long." });
  let sql = "SELECT * FROM products WHERE 1 = 1";
  const params = [];
  if (search) {
    sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (category && category.toLowerCase() !== "all") {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY id";
  try {
    return res.json(db.prepare(sql).all(...params).map(productToJson));
  } catch (error) {
    console.error("Could not fetch products:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) return res.status(400).json({ error: "Product ID must be a positive integer." });
  try {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    return res.json(productToJson(product));
  } catch (error) {
    console.error("Could not fetch product:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.listen(PORT, () => console.log(`E-commerce backend running at http://localhost:${PORT}`));
