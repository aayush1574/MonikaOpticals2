/* ═══════════════════════════════════════════════════════════════
   Monika Opticals — Glassmorphic Clone
   All interactivity: scroll effects, counters, nav, marquees
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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

  /* ── Intersection Observer — Scroll Reveal ── */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ── Count-Up Animation ── */
  const countElements = document.querySelectorAll('.count-up');
  let countAnimated = false;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const isFixed = el.dataset.fixed === 'true';
    const duration = 2000;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
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

  /* ── Hero Gallery Auto-Scroll (subtle parallax) ── */
  const heroGallery = document.querySelector('.hero__gallery');

  if (heroGallery) {
    let scrollAmount = 0;
    let autoScrollRAF = null;

    const autoScroll = () => {
      scrollAmount += 0.5;
      if (scrollAmount >= heroGallery.scrollWidth - heroGallery.clientWidth) {
        scrollAmount = 0;
      }
      heroGallery.scrollLeft = scrollAmount;
      autoScrollRAF = requestAnimationFrame(autoScroll);
    };

    autoScrollRAF = requestAnimationFrame(autoScroll);

    // Pause on hover
    heroGallery.addEventListener('mouseenter', () => {
      if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
    });

    heroGallery.addEventListener('mouseleave', () => {
      autoScrollRAF = requestAnimationFrame(autoScroll);
    });
  }

  /* ── Parallax scroll effect for decorative circles ── */
  const circles = document.querySelectorAll('.hero__circle');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    circles.forEach((circle, i) => {
      const speed = (i + 1) * 0.15;
      circle.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });

});

/* ── Global helper: Scroll to section ── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
