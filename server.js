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
const Jimp = require('jimp');

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
const HOSTINGER_PERSISTENT_DIR = '/home/u447214693/domains/monikaopticals.com/uploads';
const uploadDir = fs.existsSync('/home/u447214693/domains/monikaopticals.com')
  ? HOSTINGER_PERSISTENT_DIR
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Auto-heal symlinks for products & banners subfolders in production
if (fs.existsSync('/home/u447214693/domains/monikaopticals.com')) {
  const uploadsRoot = path.join(__dirname, 'uploads');
  // Ensure the parent directory public_html/uploads exists
  if (!fs.existsSync(uploadsRoot)) {
    try {
      fs.mkdirSync(uploadsRoot, { recursive: true });
    } catch(e) {}
  }

  const subfolders = ['products', 'banners'];
  global.symlinkError = '';
  
  subfolders.forEach(sub => {
    const targetLink = path.join(uploadsRoot, sub);
    const targetFolder = path.join(HOSTINGER_PERSISTENT_DIR, sub);

    // Ensure the persistent folder exists
    if (!fs.existsSync(targetFolder)) {
      try {
        fs.mkdirSync(targetFolder, { recursive: true });
      } catch(e) {}
    }

    try {
      if (fs.existsSync(targetLink)) {
        const lstat = fs.lstatSync(targetLink);
        if (!lstat.isSymbolicLink()) {
          fs.rmSync(targetLink, { recursive: true, force: true });
        }
      }
      if (!fs.existsSync(targetLink)) {
        fs.symlinkSync(targetFolder, targetLink, 'dir');
        console.log(`  🔗 Restored symlink from public_html/uploads/${sub} to persistent folder`);
      }
    } catch (err) {
      console.error(`  ⚠️ Symlink creation failed for ${sub}:`, err.message);
      global.symlinkError += `| ${sub}: ${err.message}`;
    }
  });
  if (!global.symlinkError) {
    global.symlinkError = 'None';
  }
} else {
  global.symlinkError = 'Not on Hostinger';
}

app.use('/uploads', express.static(uploadDir, {
  maxAge: '7d'
}));

/* Serve Frontend Static Files with high-performance Cache-Control rules */
app.use(express.static(__dirname, {
  maxAge: '1d',
  setHeaders: function (res, filePath) {
    if (filePath.endsWith('.html')) {
      // Do not cache HTML files to ensure updates are instant
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.match(/\.(css|js|woff2?|svg|png|jpg|jpeg|gif)$/)) {
      // Cache assets for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

/* Prevent caching of API responses */
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use((req, res, next) => {
  console.log(`  → ${req.method} ${req.path}`);
  next();
});

/* ── Debug Route ── */
app.get('/api/debug-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    
    // Check symlink status
    const targetLink = path.join(__dirname, 'uploads');
    let linkExists = false;
    let isSymlink = false;
    let symlinkTarget = '';
    let persistentFiles = [];
    let dbCount = -1;
    try {
      const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE id != "_"');
      dbCount = countRows[0].count;
      
      linkExists = fs.existsSync(targetLink);
      const lstat = fs.lstatSync(targetLink);
      isSymlink = lstat.isSymbolicLink();
      if (isSymlink) {
        symlinkTarget = fs.readlinkSync(targetLink);
      }
      
      const pPath = '/home/u447214693/domains/monikaopticals.com/uploads/products';
      if (fs.existsSync(pPath)) {
        persistentFiles = fs.readdirSync(pPath);
      }
    } catch (e) {}

    res.json({ 
      status: 'OK', 
      message: 'Database connection successful', 
      testQuery: rows[0].solution,
      linkExists,
      isSymlink,
      symlinkTarget,
      persistentFilesCount: persistentFiles.length,
      samplePersistentFiles: persistentFiles.slice(0, 10),
      dbCount,
      symlinkError: global.symlinkError || 'None'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug-symlinks', (req, res) => {
  try {
    const uploadsRoot = path.join(__dirname, 'uploads');
    const pLink = path.join(uploadsRoot, 'products');
    const bLink = path.join(uploadsRoot, 'banners');

    let pLinkExists = false;
    let pIsSymlink = false;
    let pTarget = '';

    let bLinkExists = false;
    let bIsSymlink = false;
    let bTarget = '';

    try {
      pLinkExists = fs.existsSync(pLink);
      const lstat = fs.lstatSync(pLink);
      pIsSymlink = lstat.isSymbolicLink();
      if (pIsSymlink) pTarget = fs.readlinkSync(pLink);
    } catch(e) {}

    try {
      bLinkExists = fs.existsSync(bLink);
      const lstat = fs.lstatSync(bLink);
      bIsSymlink = lstat.isSymbolicLink();
      if (bIsSymlink) bTarget = fs.readlinkSync(bLink);
    } catch(e) {}

    // Test writing to persistent folder directly
    const persistentProducts = '/home/u447214693/domains/monikaopticals.com/uploads/products';
    let persistentProductsWritable = false;
    try {
      if (fs.existsSync(persistentProducts)) {
        const testFile = path.join(persistentProducts, 'test-write.txt');
        fs.writeFileSync(testFile, 'write test');
        fs.unlinkSync(testFile);
        persistentProductsWritable = true;
      }
    } catch(e) {
      persistentProductsWritable = 'error: ' + e.message;
    }

    // Test writing to link path
    let linkProductsWritable = false;
    try {
      if (fs.existsSync(pLink)) {
        const testFile = path.join(pLink, 'test-write-link.txt');
        fs.writeFileSync(testFile, 'link write test');
        fs.unlinkSync(testFile);
        linkProductsWritable = true;
      }
    } catch(e) {
      linkProductsWritable = 'error: ' + e.message;
    }

    res.json({
      __dirname,
      uploadsRoot,
      pLink,
      pLinkExists,
      pIsSymlink,
      pTarget,
      bLink,
      bLinkExists,
      bIsSymlink,
      bTarget,
      persistentProductsWritable,
      linkProductsWritable,
      symlinkError: global.symlinkError || 'None'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




/* ── Multer Storage (Local Disk) ── */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define folders for products vs banners based on route
    let subfolder = req.path.includes('banners') ? 'banners' : 'products';
    const fullPath = path.join(uploadDir, subfolder);
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

/* Helper to compress uploaded files in place using Jimp */
async function compressUploadedFiles(files, req) {
  const uploadedImages = [];
  for (const file of files) {
    const targetUrl = getPublicUrl(req, file);
    const subfolder = req.path.includes('banners') ? 'banners' : 'products';
    const absolutePath = path.join(uploadDir, subfolder, file.filename);
    
    try {
      const image = await Jimp.read(absolutePath);
      // Resize product images to maximum width of 800px to ensure quick loading
      if (image.getWidth() > 800) {
        image.resize(800, Jimp.AUTO);
      }
      // Compress to 75% quality (standard compression for fast loading)
      await image.quality(75).writeAsync(absolutePath);
      console.log(`  ⚡ Jimp: Compressed ${file.filename} successfully`);
    } catch (err) {
      console.error(`  ⚠️ Jimp Compression failed for ${file.filename}:`, err.message);
    }
    uploadedImages.push(targetUrl);
  }
  return uploadedImages;
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
    
    const uploadedImages = await compressUploadedFiles(files, req);
    
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
    const uploadedImages = await compressUploadedFiles(files, req);

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
      // Compress banner
      try {
        const absolutePath = path.join(uploadDir, 'banners', req.file.filename);
        const image = await Jimp.read(absolutePath);
        if (image.getWidth() > 1600) {
          image.resize(1600, Jimp.AUTO);
        }
        await image.quality(75).writeAsync(absolutePath);
        console.log(`  ⚡ Jimp: Compressed banner ${req.file.filename} successfully`);
      } catch (err) {
        console.error('  ⚠️ Jimp Banner Compression failed:', err.message);
      }
      imageSrc = getPublicUrl(req, req.file);
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
