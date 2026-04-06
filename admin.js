/* ═══════════════════════════════════════════════════════════════
   Monika Opticals — Admin Panel Logic
   Password gate, CRUD, localStorage, image upload, export/import
   ═══════════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = 'monika1980';
const STORAGE_KEY = 'monika_opticals_products';

/* ── Default product catalog (hardcoded fallback) ── */
const DEFAULT_PRODUCTS = [
  // Sunglasses
  { id: 'sun-1', name: 'Aviator Classic', brand: 'Ray-Ban', price: '₹4,990', category: 'sunglasses', image: 'images/products/sun-1.png', features: ['UV400 Protection', 'Polarized Lenses', 'Gold Metal Frame'], badge: 'Best Seller' },
  { id: 'sun-2', name: 'Cat-Eye Noir', brand: 'Vincent Chase', price: '₹2,490', category: 'sunglasses', image: 'images/products/sun-2.png', features: ['UV Protection', 'Acetate Frame', 'Scratch Resistant'] },
  { id: 'sun-3', name: 'Retro Round', brand: 'John Jacobs', price: '₹3,290', category: 'sunglasses', image: 'images/products/sun-3.png', features: ['Gradient Lenses', 'Tortoiseshell Frame', 'Lightweight'] },
  { id: 'sun-4', name: 'Sport Wrap', brand: 'Oakley', price: '₹6,990', category: 'sunglasses', image: 'images/products/sun-4.png', features: ['Polarized', 'Impact Resistant', 'Wraparound Fit'], badge: 'Premium' },
  { id: 'sun-5', name: 'Oversized Square', brand: 'Vogue', price: '₹3,790', category: 'sunglasses', image: 'images/products/sun-5.png', features: ['Brown Gradient', 'Full Rim', 'Fashion Forward'] },

  // Reading
  { id: 'read-1', name: 'Executive Gold', brand: 'Titan Eyeplus', price: '₹2,190', category: 'reading', image: 'images/products/read-1.png', features: ['Anti-Glare Coating', 'Lightweight Gold Frame', 'Spring Hinges'], badge: 'Popular' },
  { id: 'read-2', name: 'Scholar Half-Rim', brand: 'Lenskart', price: '₹1,490', category: 'reading', image: 'images/products/read-2.png', features: ['Silver Frame', 'Anti-Reflective', 'Comfortable Fit'] },
  { id: 'read-3', name: 'Vintage Round', brand: 'John Jacobs', price: '₹1,990', category: 'reading', image: 'images/products/read-3.png', features: ['Tortoiseshell Acetate', 'Classic Design', 'Durable Build'] },
  { id: 'read-4', name: 'Progressive Pro', brand: 'Bausch & Lomb', price: '₹3,490', category: 'reading', image: 'images/products/read-4.png', features: ['Progressive Lenses', 'Black Acetate', 'Multi-Focal'], badge: 'Advanced' },

  // Computer
  { id: 'comp-1', name: 'Digital Shield', brand: 'Lenskart', price: '₹1,790', category: 'computer', image: 'images/products/comp-1.png', features: ['Blue-Light Filter', 'Anti-Glare', 'Transparent Frame'], badge: 'Top Rated' },
  { id: 'comp-2', name: 'Code Master', brand: 'Vincent Chase', price: '₹1,990', category: 'computer', image: 'images/products/comp-2.png', features: ['Blue-Light Block', 'Matte Black Frame', 'Slight Yellow Tint'] },
  { id: 'comp-3', name: 'Rose Circle', brand: 'John Jacobs', price: '₹2,490', category: 'computer', image: 'images/products/comp-3.png', features: ['Anti-Blue Light', 'Rose Gold Metal', 'Ultra Lightweight'] },
  { id: 'comp-4', name: 'Office Elite', brand: 'Fastrack', price: '₹1,590', category: 'computer', image: 'images/products/comp-4.png', features: ['Anti-Reflective', 'Navy Acetate', 'Ergonomic Fit'] },

  // Sports
  { id: 'sport-1', name: 'Aero Pro', brand: 'Oakley', price: '₹7,490', category: 'sports', image: 'images/products/sport-1.png', features: ['Polarized', 'Impact Resistant', 'Wraparound Design'], badge: 'Pro Choice' },
  { id: 'sport-2', name: 'Velocity', brand: 'Oakley', price: '₹5,990', category: 'sports', image: 'images/products/sport-2.png', features: ['Mirrored Blue Lenses', 'White Frame', 'Cycling Optimized'] },
  { id: 'sport-3', name: 'Trail Runner', brand: 'Fastrack', price: '₹3,290', category: 'sports', image: 'images/products/sport-3.png', features: ['Polarized Grey', 'Orange Frame', 'Ultra-Light'] },

  // Kids
  { id: 'kids-1', name: 'Fun Purple', brand: 'Lenskart', price: '₹990', category: 'kids', image: 'images/products/kids-1.png', features: ['Flexible Frame', 'Scratch Proof', 'Fun Purple Color'], badge: 'Kid Fav' },
  { id: 'kids-2', name: 'Tiny Scholar', brand: 'Titan Eyeplus', price: '₹1,190', category: 'kids', image: 'images/products/kids-2.png', features: ['Lightweight', 'Anti-Glare', 'Gold Frame'] },
  { id: 'kids-3', name: 'Mini Round', brand: 'Vincent Chase', price: '₹890', category: 'kids', image: 'images/products/kids-3.png', features: ['Durable Build', 'Round Shape', 'Tortoiseshell'] },

  // Contacts
  { id: 'contact-1', name: 'Daily Fresh', brand: 'Bausch & Lomb', price: '₹799/box', category: 'contacts', image: 'images/products/contact-1.png', features: ['Daily Disposable', 'High Moisture', '30 Pack'], badge: 'Best Value' },
  { id: 'contact-2', name: 'Monthly Comfort', brand: 'Bausch & Lomb', price: '₹1,290/pair', category: 'contacts', image: 'images/products/contact-2.png', features: ['Monthly Wear', 'UV Blocking', 'Breathable'] },
  { id: 'contact-3', name: 'Toric Precision', brand: 'Bausch & Lomb', price: '₹1,590/pair', category: 'contacts', image: 'images/products/contact-3.png', features: ['For Astigmatism', 'Stable Fit', 'Clear Vision'], badge: 'Specialist' },
];

const CATEGORY_LABELS = {
  sunglasses: 'Sunglasses',
  reading: 'Reading',
  computer: 'Computer',
  sports: 'Sports',
  kids: 'Kids',
  contacts: 'Contacts'
};

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
let products = [];
let deleteTargetId = null;
let currentImageData = null; // holds base64 or path for the modal form

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Check session
  if (sessionStorage.getItem('monika_admin_auth') === 'true') {
    showDashboard();
  }

  // Login
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('admin-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('monika_admin_auth');
    location.reload();
  });

  // Add product
  document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());

  // Modal close/cancel
  document.getElementById('modal-close').addEventListener('click', closeProductModal);
  document.getElementById('modal-cancel').addEventListener('click', closeProductModal);
  document.getElementById('product-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProductModal();
  });

  // Form submit
  document.getElementById('product-form').addEventListener('submit', handleFormSubmit);

  // Delete modal
  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Reset modal
  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('reset-modal-overlay').classList.add('active');
  });
  document.getElementById('reset-modal-close').addEventListener('click', closeResetModal);
  document.getElementById('reset-cancel').addEventListener('click', closeResetModal);
  document.getElementById('reset-confirm').addEventListener('click', confirmReset);
  document.getElementById('reset-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeResetModal();
  });

  // Search & filter
  document.getElementById('admin-search').addEventListener('input', renderTable);
  document.getElementById('admin-cat-filter').addEventListener('change', renderTable);

  // Export
  document.getElementById('export-btn').addEventListener('click', exportData);

  // Import
  document.getElementById('import-file').addEventListener('change', importData);

  // Image upload
  setupImageUpload();
});

/* ══════════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════════ */
function handleLogin() {
  const pwd = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('login-error');

  if (pwd === ADMIN_PASSWORD) {
    sessionStorage.setItem('monika_admin_auth', 'true');
    showDashboard();
  } else {
    errorEl.textContent = 'Incorrect password. Try again.';
    document.getElementById('admin-password').classList.add('shake');
    setTimeout(() => {
      document.getElementById('admin-password').classList.remove('shake');
    }, 500);
  }
}

function showDashboard() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  loadProducts();
  renderStats();
  renderTable();
}

/* ══════════════════════════════════════════════════════════
   STORAGE
   ══════════════════════════════════════════════════════════ */
function loadProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      products = JSON.parse(stored);
    } catch (e) {
      products = [...DEFAULT_PRODUCTS];
    }
  } else {
    products = [...DEFAULT_PRODUCTS];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/* ══════════════════════════════════════════════════════════
   STATS
   ══════════════════════════════════════════════════════════ */
function renderStats() {
  const statsEl = document.getElementById('admin-stats');
  const cats = Object.keys(CATEGORY_LABELS);
  const total = products.length;

  let html = `
    <div class="admin-stat-card admin-stat-card--accent">
      <div class="admin-stat-card__number">${total}</div>
      <div class="admin-stat-card__label">Total Products</div>
    </div>
  `;

  cats.forEach(cat => {
    const count = products.filter(p => p.category === cat).length;
    html += `
      <div class="admin-stat-card">
        <div class="admin-stat-card__number">${count}</div>
        <div class="admin-stat-card__label">${CATEGORY_LABELS[cat]}</div>
      </div>
    `;
  });

  statsEl.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════
   TABLE
   ══════════════════════════════════════════════════════════ */
function renderTable() {
  const search = document.getElementById('admin-search').value.toLowerCase().trim();
  const catFilter = document.getElementById('admin-cat-filter').value;
  const tbody = document.getElementById('admin-tbody');
  const emptyEl = document.getElementById('admin-empty');

  let filtered = [...products];

  if (catFilter !== 'all') {
    filtered = filtered.filter(p => p.category === catFilter);
  }

  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.price.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  tbody.innerHTML = filtered.map(product => {
    const featuresHtml = product.features.map(f => `<span class="admin-tag">${f}</span>`).join('');
    const badgeHtml = product.badge
      ? `<span class="admin-badge">${product.badge}</span>`
      : '<span class="admin-text-muted">—</span>';

    return `
      <tr data-id="${product.id}">
        <td>
          <div class="admin-table-img">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23EDE9E3%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2240%22>👓</text></svg>'" />
          </div>
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${product.brand}</td>
        <td><span class="admin-cat-pill">${CATEGORY_LABELS[product.category] || product.category}</span></td>
        <td><strong>${product.price}</strong></td>
        <td>${badgeHtml}</td>
        <td><div class="admin-tags-cell">${featuresHtml}</div></td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn admin-action-btn--edit" onclick="editProduct('${product.id}')" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="admin-action-btn admin-action-btn--delete" onclick="deleteProduct('${product.id}')" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   PRODUCT MODAL
   ══════════════════════════════════════════════════════════ */
function openProductModal(product = null) {
  const overlay = document.getElementById('product-modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const submitEl = document.getElementById('modal-submit');

  if (product) {
    titleEl.textContent = 'Edit Product';
    submitEl.textContent = 'Update Product';
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-brand').value = product.brand;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-badge').value = product.badge || '';
    document.getElementById('prod-features').value = product.features.join(', ');

    // Show existing image
    currentImageData = product.image;
    showImagePreview(product.image);
  } else {
    titleEl.textContent = 'Add Product';
    submitEl.textContent = 'Save Product';
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-id').value = '';
    currentImageData = null;
    hideImagePreview();
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    document.getElementById('prod-name').focus();
  }, 200);
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('product-form').reset();
  currentImageData = null;
  hideImagePreview();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('edit-product-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const brand = document.getElementById('prod-brand').value.trim();
  const price = document.getElementById('prod-price').value.trim();
  const category = document.getElementById('prod-category').value;
  const badge = document.getElementById('prod-badge').value.trim();
  const features = document.getElementById('prod-features').value.split(',').map(f => f.trim()).filter(f => f);

  if (!name || !brand || !price || !category || features.length === 0) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (!currentImageData) {
    showToast('Please upload a product image.', 'error');
    return;
  }

  if (editId) {
    // Update existing
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        brand,
        price,
        category,
        badge: badge || undefined,
        features,
        image: currentImageData
      };
      // Clean undefined badge
      if (!products[idx].badge) delete products[idx].badge;
    }
    showToast(`"${name}" updated successfully!`, 'success');
  } else {
    // Create new
    const newId = category.slice(0, 4) + '-' + Date.now().toString(36);
    products.push({
      id: newId,
      name,
      brand,
      price,
      category,
      image: currentImageData,
      features,
      ...(badge ? { badge } : {})
    });
    showToast(`"${name}" added successfully!`, 'success');
  }

  saveProducts();
  renderStats();
  renderTable();
  closeProductModal();
}

/* ══════════════════════════════════════════════════════════
   EDIT & DELETE
   ══════════════════════════════════════════════════════════ */
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) openProductModal(product);
}

function deleteProduct(id) {
  deleteTargetId = id;
  const product = products.find(p => p.id === id);
  document.getElementById('delete-product-name').textContent = product ? product.name : 'this product';
  document.getElementById('delete-modal-overlay').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('delete-modal-overlay').classList.remove('active');
  deleteTargetId = null;
}

function confirmDelete() {
  if (deleteTargetId) {
    const product = products.find(p => p.id === deleteTargetId);
    products = products.filter(p => p.id !== deleteTargetId);
    saveProducts();
    renderStats();
    renderTable();
    showToast(`"${product?.name || 'Product'}" deleted.`, 'success');
  }
  closeDeleteModal();
}

/* ══════════════════════════════════════════════════════════
   RESET
   ══════════════════════════════════════════════════════════ */
function closeResetModal() {
  document.getElementById('reset-modal-overlay').classList.remove('active');
}

function confirmReset() {
  products = [...DEFAULT_PRODUCTS];
  saveProducts();
  renderStats();
  renderTable();
  showToast('Catalog restored to defaults.', 'success');
  closeResetModal();
}

/* ══════════════════════════════════════════════════════════
   EXPORT / IMPORT
   ══════════════════════════════════════════════════════════ */
function exportData() {
  const json = JSON.stringify(products, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `monika-opticals-catalog-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Catalog exported successfully!', 'success');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');

      // Validate structure
      const valid = data.every(p =>
        p.id && p.name && p.brand && p.price && p.category && p.image && Array.isArray(p.features)
      );

      if (!valid) throw new Error('Invalid product structure');

      products = data;
      saveProducts();
      renderStats();
      renderTable();
      showToast(`Imported ${data.length} products successfully!`, 'success');
    } catch (err) {
      showToast('Invalid file format. Please use a valid JSON export.', 'error');
    }
  };
  reader.readAsText(file);

  // Reset file input so same file can be re-imported
  e.target.value = '';
}

/* ══════════════════════════════════════════════════════════
   IMAGE UPLOAD
   ══════════════════════════════════════════════════════════ */
function setupImageUpload() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('prod-image');
  const removeBtn = document.getElementById('remove-image');

  // Click to browse
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('.admin-dropzone__remove')) return;
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) processImage(fileInput.files[0]);
  });

  // Drag events
  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  });

  // Remove image
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageData = null;
    hideImagePreview();
    fileInput.value = '';
  });
}

function processImage(file) {
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image is too large. Max 2MB allowed.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    showImagePreview(currentImageData);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  document.getElementById('dropzone-content').style.display = 'none';
  document.getElementById('dropzone-preview').style.display = 'flex';
  document.getElementById('preview-img').src = src;
}

function hideImagePreview() {
  document.getElementById('dropzone-content').style.display = 'flex';
  document.getElementById('dropzone-preview').style.display = 'none';
  document.getElementById('preview-img').src = '';
}

/* ══════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.className = 'admin-toast admin-toast--' + type + ' admin-toast--visible';

  setTimeout(() => {
    toast.classList.remove('admin-toast--visible');
  }, 3000);
}
