/* ═══════════════════════════════════════════════════════════════
   Monika Opticals — Express Backend Server (MySQL Version)
   Full CRUD API for Products & Banners
   Permanent Storage: MySQL + Local Disk Storage
   ═══════════════════════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── MySQL Configuration ── */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monika_opticals',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('  🍀 Initialized MySQL Connection Pool');

/* ── Middleware ── */
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

app.use(compression());

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('json spaces', 2);

/* Serve Uploaded Files */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d'
}));

/* Serve Frontend Static Files */
app.use(express.static(__dirname, {
  maxAge: '1h' // keep html relatively fresh but cache assets
}));

app.use((req, res, next) => {
  console.log(`  → ${req.method} ${req.path}`);
  next();
});

/* ── Debug Route ── */
app.get('/api/debug-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ status: 'OK', message: 'Database connection successful', testQuery: rows[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Multer Storage (Local Disk) ── */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define folders for products vs banners based on route
    let folder = 'uploads/';
    if (req.path.includes('banners')) folder += 'banners/';
    else folder += 'products/';
    
    const fullPath = path.join(__dirname, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

/* Helper to get public URL for local files */
function getPublicUrl(req, file) {
  let folder = req.path.includes('banners') ? 'banners' : 'products';
  return `uploads/${folder}/${file.filename}`;
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT API
   ═══════════════════════════════════════════════════════════ */

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const parsedRows = rows.map(r => {
      let features = [];
      let colors = [];
      let images = [];
      try { features = typeof r.features === 'string' ? JSON.parse(r.features) : r.features; } catch(e) {}
      try { colors = typeof r.colors === 'string' ? JSON.parse(r.colors) : r.colors; } catch(e) {}
      try { images = typeof r.images === 'string' ? JSON.parse(r.images) : r.images; } catch(e) {}
      return {
        ...r,
        features: features || [],
        colors: colors || [],
        images: images || [],
        visible: r.visible === 1 || r.visible === true || r.visible === 'true'
      };
    });
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || [];
    
    const uploadedImages = files.map(file => getPublicUrl(req, file));
    
    let existingImages = [];
    if (body.existingImages) {
      try { existingImages = JSON.parse(body.existingImages); } catch(e) { existingImages = []; }
    }

    const allImages = [...existingImages, ...uploadedImages];
    const prodId = body.id || ('prod-' + Date.now().toString(36));

    const features = body.features ? (typeof body.features === 'string' ? JSON.parse(body.features) : body.features) : [];
    const colors = body.colors ? (typeof body.colors === 'string' ? JSON.parse(body.colors) : body.colors) : [];
    const visible = body.visible !== undefined ? (body.visible === 'true' || body.visible === true) : true;

    await pool.query(`
      INSERT INTO products (id, name, brand, price, category, features, badge, colors, images, image, visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prodId,
      body.name,
      body.brand,
      body.price,
      body.category,
      JSON.stringify(features),
      body.badge || '',
      JSON.stringify(colors),
      JSON.stringify(allImages),
      allImages[0] || '',
      visible
    ]);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
    res.json({ ok: true, product: rows[0] });
  } catch (err) {
    console.error('  ❌ POST /api/products error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || [];
    const uploadedImages = files.map(file => getPublicUrl(req, file));

    let existingImages = [];
    if (body.existingImages) {
      try { existingImages = JSON.parse(body.existingImages); } catch(e) { existingImages = []; }
    }

    const allImages = [...existingImages, ...uploadedImages];

    const updates = [];
    const params = [];

    if (body.name !== undefined) { updates.push('name = ?'); params.push(body.name); }
    if (body.brand !== undefined) { updates.push('brand = ?'); params.push(body.brand); }
    if (body.price !== undefined) { updates.push('price = ?'); params.push(body.price); }
    if (body.category !== undefined) { updates.push('category = ?'); params.push(body.category); }
    if (body.features !== undefined) { 
      updates.push('features = ?'); 
      params.push(JSON.stringify(typeof body.features === 'string' ? JSON.parse(body.features) : body.features)); 
    }
    if (body.badge !== undefined) { updates.push('badge = ?'); params.push(body.badge); }
    if (body.colors !== undefined) { 
      updates.push('colors = ?'); 
      params.push(JSON.stringify(typeof body.colors === 'string' ? JSON.parse(body.colors) : body.colors)); 
    }
    if (allImages.length > 0) { 
      updates.push('images = ?'); params.push(JSON.stringify(allImages)); 
      updates.push('image = ?'); params.push(allImages[0]);
    }
    if (body.visible !== undefined) { 
      updates.push('visible = ?'); 
      params.push(body.visible === 'true' || body.visible === true); 
    }

    if (updates.length > 0) {
      params.push(req.params.id);
      await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true, product: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id/visibility', async (req, res) => {
  try {
    await pool.query('UPDATE products SET visible = ? WHERE id = ?', [req.body.visible, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/bulk', async (req, res) => {
  try {
    const products = req.body;
    await pool.query("DELETE FROM products WHERE id != '_'");
    
    for (const p of products) {
      await pool.query(`
        INSERT INTO products (id, name, brand, price, category, features, badge, colors, images, image, visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id, p.name, p.brand, p.price, p.category, 
        JSON.stringify(p.features), p.badge, JSON.stringify(p.colors), 
        JSON.stringify(p.images), p.image, p.visible
      ]);
    }
    
    res.json({ ok: true, count: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   BANNER API
   ═══════════════════════════════════════════════════════════ */

app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banners', upload.single('image'), async (req, res) => {
  try {
    let imageSrc = '';
    if (req.file) {
      imageSrc = getPublicUrl(req, file);
    } else if (req.body.src) {
      imageSrc = req.body.src;
    }

    const bannerId = 'b-' + Date.now().toString(36);
    const visible = req.body.visible !== undefined ? req.body.visible : true;

    await pool.query(`
      INSERT INTO banners (id, src, alt, visible)
      VALUES (?, ?, ?, ?)
    `, [bannerId, imageSrc, req.body.alt || 'Banner Image', visible]);

    const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [bannerId]);
    res.json({ ok: true, banner: rows[0] });
  } catch (err) {
    console.error('  ❌ Banner Insert Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const updates = [];
    const params = [];

    if (req.body.src !== undefined) { updates.push('src = ?'); params.push(req.body.src); }
    if (req.body.alt !== undefined) { updates.push('alt = ?'); params.push(req.body.alt); }
    if (req.body.visible !== undefined) { updates.push('visible = ?'); params.push(req.body.visible); }

    if (updates.length > 0) {
      params.push(req.params.id);
      await pool.query(`UPDATE banners SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   EXPORT / IMPORT
   ═══════════════════════════════════════════════════════════ */

app.get('/api/export', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    const [banners] = await pool.query('SELECT * FROM banners');
    res.json({ products, banners, exportedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { products, banners } = req.body;
    
    if (Array.isArray(products) && products.length > 0) {
      await pool.query("DELETE FROM products WHERE id != '_'");
      for (const p of products) {
        await pool.query(`
          INSERT INTO products (id, name, brand, price, category, features, badge, colors, images, image, visible)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id, p.name, p.brand, p.price, p.category, 
          JSON.stringify(p.features), p.badge, JSON.stringify(p.colors), 
          JSON.stringify(p.images), p.image, p.visible
        ]);
      }
    }
    
    if (Array.isArray(banners) && banners.length > 0) {
      await pool.query("DELETE FROM banners WHERE id != '_'");
      for (const b of banners) {
        await pool.query(`
          INSERT INTO banners (id, src, alt, visible)
          VALUES (?, ?, ?, ?)
        `, [b.id, b.src, b.alt, b.visible]);
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`  🚀 Server running on port ${PORT} with MySQL Database`);
});
