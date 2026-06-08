/* ═══════════════════════════════════════════════════════════════
   Monika Opticals — Glassmorphic Clone
   Enhanced scroll animations, parallax, counters, nav, marquees
   ═══════════════════════════════════════════════════════════════ */


document.addEventListener('DOMContentLoaded', async () => {

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Active nav link highlighting ── */
  const navLinks = document.querySelectorAll('.navbar__links a');
  const sections = document.querySelectorAll('section[id]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ── Mobile Nav Toggle ── */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-nav-close');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeMobileNav = () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    };

    mobileClose.addEventListener('click', closeMobileNav);

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══════════════════════════════════════════════════════
     ENHANCED SCROLL REVEAL SYSTEM
     Supports: fade-up, fade-down, slide-left, slide-right,
               scale-up, blur-in, rotate-in
     ══════════════════════════════════════════════════════ */
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-rotate'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ══════════════════════════════════════════════════════
     STAGGERED CHILDREN ANIMATION
     Add .stagger-parent to a container and .stagger-child
     to each child for cascading reveal
     ══════════════════════════════════════════════════════ */
  const staggerParents = document.querySelectorAll('.stagger-parent');

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.stagger-child');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.12}s`;
          child.classList.add('visible');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  staggerParents.forEach(el => staggerObserver.observe(el));

  /* ══════════════════════════════════════════════════════
     PARALLAX SCROLL — images float at different rates
     ══════════════════════════════════════════════════════ */
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  let ticking = false;
  const updateParallax = () => {
    const scrollY = window.scrollY;
    const viewH = window.innerHeight;

    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.1;

      if (rect.top < viewH && rect.bottom > 0) {
        const travel = (rect.top - viewH / 2) * speed;
        el.style.transform = `translateY(${travel}px)`;
      }
    });

    // Decorative circles parallax
    const circles = document.querySelectorAll('.hero__circle');
    circles.forEach((circle, i) => {
      const speed = (i + 1) * 0.1;
      circle.style.transform = `translateY(${scrollY * speed}px)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════
     SMOOTH HERO GALLERY — infinite CSS-driven scroll
     Uses duplicated content + CSS animation for silky movement
     Dynamically loads banners from persistent API backend
     ══════════════════════════════════════════════════════ */
  const heroGallery = document.querySelector('.hero__gallery');

  if (heroGallery) {
    // Load banner images from persistent backend API
    try {
      const res = await fetch(API_CONFIG.api('/api/banners?t=' + Date.now()));
      if (res.ok) {
        const banners = await res.json();
        const visibleBanners = banners.filter(b => b.visible !== false);
        if (visibleBanners.length > 0) {
          heroGallery.innerHTML = visibleBanners.map(b =>
            `<div class="hero__gallery-card"><img src="${API_CONFIG.imageUrl(b.src)}" alt="${b.alt || 'Eyewear'}" /></div>`
          ).join('');
        }
      }
    } catch (e) { /* server offline — use original HTML content */ }

    // Duplicate gallery items for seamless loop
    const items = heroGallery.innerHTML;
    heroGallery.innerHTML = items + items;

    // Pause animation on hover
    heroGallery.addEventListener('mouseenter', () => {
      heroGallery.style.animationPlayState = 'paused';
    });
    heroGallery.addEventListener('mouseleave', () => {
      heroGallery.style.animationPlayState = 'running';
    });
  }

  /* ══════════════════════════════════════════════════════
     SCROLL PROGRESS BAR — thin accent bar at the top
     ══════════════════════════════════════════════════════ */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ══════════════════════════════════════════════════════
     COUNT-UP ANIMATION
     ══════════════════════════════════════════════════════ */
  const countElements = document.querySelectorAll('.count-up');
  let countAnimated = false;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const trustSection = document.getElementById('trust');
  if (trustSection) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countAnimated) {
          countAnimated = true;
          countElements.forEach(el => animateCount(el));
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    countObserver.observe(trustSection);
  }

  /* ══════════════════════════════════════════════════════
     IMAGE TILT EFFECT — subtle 3D tilt on hover
     Add .tilt-hover class to any image container
     ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.tilt-hover').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    });
  });

  /* ══════════════════════════════════════════════════════
     LATEST ARRIVALS (HOMEPAGE)
     ══════════════════════════════════════════════════════ */
  const latestGrid = document.getElementById('latest-products-grid');
  if (latestGrid) {
    try {
      const res = await fetch(API_CONFIG.api('/api/products?t=' + Date.now()));
      if (res.ok) {
        let products = await res.json();
        products = products.filter(p => p.visible !== false).slice(0, 4);
        
        if (products.length > 0) {
          latestGrid.innerHTML = products.map((product) => {
            let primaryImg = '';
            if (Array.isArray(product.images) && product.images.length > 0) {
              primaryImg = API_CONFIG.imageUrl(product.images[0]);
            } else if (product.image) {
              primaryImg = API_CONFIG.imageUrl(product.image);
            }
            
            const badgeHTML = product.badge ? `<span class="product-card__badge">${product.badge}</span>` : '';
            const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} (${product.brand}) - ${product.price}. Can I get more details?`);

            return `
              <div class="product-card stagger-child">
                <div class="product-card__image-wrap" onclick="scrollNextImage(this)">
                  ${badgeHTML}
                  <div class="product-card__scroll-track">
                    ${(Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []))
                      .map(imgSrc => `<img src="${API_CONFIG.imageUrl(imgSrc)}" alt="${product.name}" class="product-card__image" loading="lazy" />`)
                      .join('') || `<img src="" alt="No image" class="product-card__image" />`}
                  </div>
                </div>
                <div class="product-card__body">
                  <span class="product-card__brand">${product.brand || 'Premium'}</span>
                  <h3 class="product-card__name">${product.name}</h3>
                  <div class="product-card__footer" style="margin-top: 15px;">
                    <a href="https://wa.me/918109204075?text=${whatsappMsg}" target="_blank" rel="noopener" class="product-card__enquire">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Enquire Now
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (e) {
      console.log('Could not load latest products', e);
    }
  }

});

/* ── Global helper ── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
