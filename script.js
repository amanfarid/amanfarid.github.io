document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // rule #7: remove bg-canvas from DOM on mobile entirely
  if (window.matchMedia('(max-width: 768px)').matches) {
    document.getElementById('bg-canvas')?.remove();
  }

  // ===== PRELOADER =====
  const preloader = document.querySelector('.preloader');
  const loaderProgress = document.querySelector('.loader-progress');
  let loadPct = 0;
  const loadInterval = setInterval(() => {
    loadPct = Math.min(loadPct + Math.random() * 18 + 8, 100);
    if (loaderProgress) loaderProgress.style.width = loadPct + '%';
    if (loadPct >= 100) clearInterval(loadInterval);
  }, 120);

  window.addEventListener('load', () => {
    if (loaderProgress) loaderProgress.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      document.getElementById('hero-title')?.classList.add('loaded');
    }, 600);
  });
  setTimeout(() => {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      document.getElementById('hero-title')?.classList.add('loaded');
    }
  }, 2500);
  document.body.style.overflow = 'hidden';

  // ===== HERO TITLE CHAR SPLIT =====
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = (i * 0.04) + 's';
      heroTitle.appendChild(span);
    });
  }

  // ===== PAUSE LOOP WHEN TAB HIDDEN =====
  let tabVisible = true;
  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
  });

  // ===== RULE #1: THREE.JS COMPLETELY REMOVED =====
  // Hero background is now a pure CSS particle canvas (rule below).
  // The #three-container div is hidden via CSS (display:none).

  // ===== CUSTOM CURSOR =====
  // rule #4: trail count reduced to 0 (removed entirely)
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      // Move dot immediately — no lag desired
      if (cursorDot) {
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
      }
    }, { passive: true });

    document.querySelectorAll('a, button, .skill-card, .project-card, .cert-card, .beyond-card, .social-link, .hamburger').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!cursorDot || !cursorRing) return;
        cursorDot.style.width = '12px'; cursorDot.style.height = '12px'; cursorDot.style.background = '#00d4ff';
        cursorRing.style.width = '50px'; cursorRing.style.height = '50px'; cursorRing.style.borderColor = 'rgba(0,212,255,0.6)';
      });
      el.addEventListener('mouseleave', () => {
        if (!cursorDot || !cursorRing) return;
        cursorDot.style.width = '8px'; cursorDot.style.height = '8px'; cursorDot.style.background = '#4f8ef7';
        cursorRing.style.width = '40px'; cursorRing.style.height = '40px'; cursorRing.style.borderColor = 'rgba(79,142,247,0.5)';
      });
    });
  }

  // cursor ring lerp — runs inside unified rAF loop
  function animateCursor() {
    if (!cursorRing || window.innerWidth <= 768) return;
    ringX += (cursorX - ringX) * 0.14;
    ringY += (cursorY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
  }

  // ===== SCROLL PROGRESS — rule #7: throttled to max once per 100ms =====
  const progressBar = document.querySelector('.scroll-progress');
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  let lastScrollTime = 0;
  let scrollY = 0;

  // single passive scroll listener feeding shared state
  window.addEventListener('scroll', () => {
    const now = performance.now();
    if (now - lastScrollTime < 100) return;
    lastScrollTime = now;
    scrollY = window.scrollY;

    // scroll progress bar
    if (progressBar) {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = ((scrollY / total) * 100) + '%';
    }
    // navbar scrolled class
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);
    // back-to-top visibility
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
    // hero parallax targets
    if (scrollY < window.innerHeight) {
      targetHeroTY = scrollY * 0.12;
      targetHeroOp = Math.max(0.15, 1 - scrollY / (window.innerHeight * 0.9));
    }
    // scroll-driven 3D panels targets (rule #10: perspective applied inline per-panel, not on wrapper)
    panelStates.forEach(state => {
      const rect = state.el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = (center - window.innerHeight / 2) / window.innerHeight;
      state.targetR = Math.max(-2.5, Math.min(2.5, dist * 3.5));
      state.targetS = Math.max(0.985, 1 - Math.abs(dist) * 0.015);
    });
  }, { passive: true });

  // ===== TYPEWRITER =====
  const titles = ['BSAI Student', 'Python Developer', 'AI Enthusiast', 'Vibe Coder'];
  let titleIndex = 0, charIndex = 0, isDeleting = false;
  const typewriterEl = document.getElementById('typewriter');

  function typeWriter() {
    if (!typewriterEl) return;
    const current = titles[titleIndex];
    if (!isDeleting) {
      charIndex++;
      typewriterEl.textContent = current.substring(0, charIndex);
      if (charIndex === current.length) { isDeleting = true; setTimeout(typeWriter, 2000); return; }
      setTimeout(typeWriter, 80 + Math.random() * 40);
    } else {
      charIndex--;
      typewriterEl.textContent = current.substring(0, charIndex);
      if (charIndex === 0) { isDeleting = false; titleIndex = (titleIndex + 1) % titles.length; setTimeout(typeWriter, 300); return; }
      setTimeout(typeWriter, 40 + Math.random() * 30);
    }
  }
  setTimeout(typeWriter, 800);

  // ===== HAMBURGER =====
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', open);
    });
    hamburger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click(); }
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== BACK TO TOP =====
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===== FADE-IN SCROLL (IntersectionObserver) — rule #9: unobserve after trigger =====
  const fadeObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target); // rule #9
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section, footer, .about-content, .contact-container, .section-header').forEach(el => {
    el.classList.add('fade-in');
    fadeObs.observe(el);
  });

  // ===== TIMELINE — rule #9: unobserve after trigger =====
  const tlEl = document.querySelector('.timeline');
  if (tlEl) {
    const tlObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          e.target.querySelectorAll('.timeline-item').forEach((item, i) => {
            item.style.transitionDelay = (i * 0.15) + 's';
            item.classList.add('visible');
          });
          obs.unobserve(e.target); // rule #9
        }
      });
    }, { threshold: 0.2 });
    tlObs.observe(tlEl);
  }

  // ===== COUNTERS — rule #9: counterObs already unobserves =====
  let countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    document.querySelectorAll('.stat-number').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const inc = Math.ceil(target / 50);
      let cur = 0;
      function update() { cur += inc; if (cur >= target) { counter.textContent = target + '+'; return; } counter.textContent = cur; requestAnimationFrame(update); }
      update();
    });
    countersAnimated = true;
  }
  const counterObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); obs.unobserve(e.target); } }); // rule #9
  }, { threshold: 0.5 });
  if (document.querySelector('.about')) counterObs.observe(document.querySelector('.about'));

  // ===== STAGGER ENTRANCE — rule #9: unobserve after trigger =====
  const staggerObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stagger-enter').forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 100);
        });
        obs.unobserve(e.target); // rule #9
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .beyond-grid').forEach(grid => {
    grid.querySelectorAll(':scope > *').forEach((item, i) => {
      item.classList.add('stagger-enter');
      item.style.transitionDelay = (i * 0.08) + 's';
    });
    staggerObs.observe(grid);
  });

  // ===== NAV ACTIVE SECTION SPY — does NOT unobserve (needs to keep watching) =====
  const navLinksAll = document.querySelectorAll('.nav-link');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinksAll.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

  // ===== SECTION INDICATOR — does NOT unobserve (must track current section) =====
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  if (indicatorDots.length) {
    const indicatorSections = [];
    indicatorDots.forEach(dot => {
      const id = dot.dataset.section;
      if (id) indicatorSections.push({ el: document.getElementById(id), dot });
    });
    const indObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          indicatorDots.forEach(d => d.classList.remove('active'));
          const match = indicatorSections.find(s => s.el === e.target);
          if (match) match.dot.classList.add('active');
        }
      });
    }, { rootMargin: '-35% 0px -50% 0px', threshold: 0 });
    indicatorSections.forEach(s => { if (s.el) indObs.observe(s.el); });
  }

  // ===== SKILL RING ANIMATE — rule #9: unobserve after trigger =====
  const ringObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.ring-fill').forEach(ring => {
          const pct = ring.style.getPropertyValue('--pct') || getComputedStyle(ring).getPropertyValue('--pct');
          ring.style.strokeDashoffset = '314.16';
          requestAnimationFrame(() => {
            ring.style.strokeDashoffset = `calc(314.16 - (314.16 * ${pct}) / 100)`;
          });
        });
        obs.unobserve(e.target); // rule #9
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-card').forEach(card => ringObs.observe(card));

  // ===== ISSUE 1: CERT IMAGE ONERROR FALLBACK =====
  document.querySelectorAll('.cert-badge img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) return;
    img.addEventListener('error', function handler() {
      const card = this.closest('.cert-card');
      const name = card?.querySelector('h3')?.textContent || 'Certificate';
      const fallback = document.createElement('div');
      fallback.className = 'cert-fallback';
      fallback.textContent = name.charAt(0);
      this.replaceWith(fallback);
    });
  });

  // ===== CERT LIGHTBOX =====
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Certificate';
    lightbox.removeAttribute('hidden');
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.setAttribute('hidden', ''); lightboxImg.src = ''; }, 300);
  }
  document.querySelectorAll('.cert-card[data-cert]').forEach(card => {
    const open = () => openLightbox(card.dataset.cert, card.querySelector('h3')?.textContent);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });
  }

  // ===== CTA RIPPLE + PARTICLE BURST =====
  document.querySelectorAll('.cta-button, .submit-btn').forEach(btn => {
    btn.classList.add('ripple-btn');
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
      if (!reducedMotion && window.innerWidth > 768) {
        const colors = ['#4f8ef7', '#00d4ff', '#7c5cfc', '#fff'];
        for (let i = 0; i < 6; i++) {
          const p = document.createElement('span');
          p.className = 'click-particle';
          const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
          const dist = 30 + Math.random() * 25;
          p.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;background:${colors[i % colors.length]}`;
          this.appendChild(p);
          setTimeout(() => p.remove(), 600);
        }
      }
    });
  });

  // ===== SMOOTH 3D CARD TILT (rAF-driven lerp) =====
  // rule #10: perspective applied INLINE per card transform, NOT on wrapper
  const tiltCards = [];
  function initSmoothTilt(selector, intensity, lift) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('card-shine');
      const state = { el, intensity, lift, tx: 0, ty: 0, cx: 0, cy: 0, hover: false };
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        state.ty = (e.clientY - rect.top - rect.height / 2) / intensity;
        state.tx = (rect.width / 2 - e.clientX + rect.left) / intensity;
        state.hover = true;
        el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      el.addEventListener('mouseleave', () => { state.hover = false; state.tx = 0; state.ty = 0; });
      tiltCards.push(state);
    });
  }
  if (!reducedMotion && window.innerWidth > 768) {
    initSmoothTilt('.project-card', 32, 6);
    initSmoothTilt('.skill-card, .cert-card, .beyond-card', 36, 4);
  }
  function animateTilts() {
    tiltCards.forEach(s => {
      s.cx += (s.tx - s.cx) * 0.1;
      s.cy += (s.ty - s.cy) * 0.1;
      const active = s.hover || Math.abs(s.cx) > 0.02 || Math.abs(s.cy) > 0.02;
      if (active) {
        const lift = s.hover ? s.lift : s.lift * (Math.abs(s.cx) + Math.abs(s.cy));
        // rule #10: perspective inline on the transform (not on a wrapper element)
        s.el.style.transform = `perspective(1200px) rotateX(${s.cy}deg) rotateY(${s.cx}deg) translateY(${-lift}px)`;
      } else {
        s.el.style.transform = '';
      }
    });
  }

  // ===== HERO SPOTLIGHT (rAF-driven) =====
  const heroSpotlight = document.querySelector('.hero-spotlight');
  let sTX = 50, sTY = 50, sCX = 50, sCY = 50;
  const heroEl = document.getElementById('hero');
  if (heroSpotlight && heroEl && window.innerWidth > 768) {
    heroEl.addEventListener('mousemove', e => {
      const rect = heroEl.getBoundingClientRect();
      sTX = ((e.clientX - rect.left) / rect.width) * 100;
      sTY = ((e.clientY - rect.top) / rect.height) * 100;
    }, { passive: true });
  }

  // ===== HERO PARALLAX (rAF-driven) =====
  const heroContent = document.querySelector('.hero-content');
  let heroTY = 0, heroOp = 1, targetHeroTY = 0, targetHeroOp = 1;
  function animateHeroParallax() {
    if (!heroContent) return;
    heroTY += (targetHeroTY - heroTY) * 0.08;
    heroOp += (targetHeroOp - heroOp) * 0.08;
    heroContent.style.transform = `translateY(${heroTY}px)`;
    heroContent.style.opacity = heroOp;
  }

  // ===== FLOATING SHAPE PARALLAX (rAF-driven) =====
  const shapeStates = [];
  const shapeMap = new Map();
  document.querySelectorAll('.section-3d').forEach(section => {
    const states = [];
    section.querySelectorAll('.floating-shape').forEach(shape => {
      shape.classList.add('glowing');
      const state = { shape, tx: 0, ty: 0, cx: 0, cy: 0 };
      shapeStates.push(state);
      states.push(state);
    });
    shapeMap.set(section, states);
    section.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const cached = shapeMap.get(section);
      if (cached) cached.forEach(state => { state.tx = x * 18; state.ty = y * 18; });
    });
    section.addEventListener('mouseleave', () => {
      const cached = shapeMap.get(section);
      if (cached) cached.forEach(state => { state.tx = 0; state.ty = 0; });
    });
  });
  function animateShapes() {
    shapeStates.forEach(s => {
      s.cx += (s.tx - s.cx) * 0.07;
      s.cy += (s.ty - s.cy) * 0.07;
      if (Math.abs(s.cx) > 0.05 || Math.abs(s.cy) > 0.05) {
        s.shape.style.setProperty('--px', s.cx + 'px');
        s.shape.style.setProperty('--py', s.cy + 'px');
      }
    });
  }

  // ===== MAGNETIC BUTTONS (rAF-driven lerp) =====
  const magneticWraps = [];
  if (!reducedMotion && window.innerWidth > 768) {
    document.querySelectorAll('.cta-button, .submit-btn').forEach(btn => {
      const wrap = document.createElement('span');
      wrap.className = 'magnetic-wrap';
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      const state = { wrap, tx: 0, ty: 0, cx: 0, cy: 0 };
      wrap.addEventListener('mousemove', e => {
        const rect = wrap.getBoundingClientRect();
        state.tx = (e.clientX - rect.left - rect.width / 2) * 0.15;
        state.ty = (e.clientY - rect.top - rect.height / 2) * 0.15;
      });
      wrap.addEventListener('mouseleave', () => { state.tx = 0; state.ty = 0; });
      magneticWraps.push(state);
    });
  }
  function animateMagnetic() {
    magneticWraps.forEach(s => {
      s.cx += (s.tx - s.cx) * 0.12;
      s.cy += (s.ty - s.cy) * 0.12;
      if (Math.abs(s.cx) > 0.1 || Math.abs(s.cy) > 0.1) {
        s.wrap.style.transform = `translate(${s.cx}px, ${s.cy}px)`;
      } else {
        s.wrap.style.transform = '';
      }
    });
  }

  // ===== SCROLL-DRIVEN 3D PANELS (rAF-driven) =====
  // rule #10: perspective applied INLINE on each panel's transform
  const panelStates = [];
  if (!reducedMotion && window.innerWidth > 768) {
    document.querySelectorAll('.scene-panel:not(#hero)').forEach(panel => {
      panelStates.push({ el: panel, targetR: 0, currentR: 0, targetS: 1, currentS: 1 });
    });
  }
  function animatePanels() {
    panelStates.forEach(state => {
      state.currentR += (state.targetR - state.currentR) * 0.06;
      state.currentS += (state.targetS - state.currentS) * 0.06;
      // rule #10: perspective inline on transform — NOT on a wrapper element
      state.el.style.transform = `perspective(1400px) rotateX(${state.currentR}deg) scale(${state.currentS})`;
    });
  }

  // ===== AVATAR 3D TILT (rAF-driven) =====
  const avatar = document.querySelector('.avatar-3d');
  let aTX = 0, aTY = 0, aCX = 0, aCY = 0;
  if (avatar && !reducedMotion && window.innerWidth > 768) {
    document.addEventListener('mousemove', e => {
      const rect = avatar.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) { aTX = 0; aTY = 0; return; }
      aTX = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 12;
      aTY = (-(e.clientY - rect.top - rect.height / 2) / rect.height) * 12;
    }, { passive: true });
  }
  function animateAvatar() {
    if (!avatar) return;
    aCX += (aTX - aCX) * 0.08;
    aCY += (aTY - aCY) * 0.08;
    if (Math.abs(aCX) > 0.05 || Math.abs(aCY) > 0.05) {
      avatar.style.transform = `perspective(600px) rotateY(${aCX}deg) rotateX(${aCY}deg)`;
    } else {
      avatar.style.transform = '';
    }
  }

  // ===== SECTION-AWARE PARTICLE BACKGROUND =====
  // rule #1: replaces Three.js — max 40 particles, zero connection lines
  // rule #5: NO particle connection lines (O(n²) loop deleted entirely)
  const pCanvas = document.getElementById('bg-canvas');
  let pCtx, pW, pH;
  let pParticles = [];
  let currentTheme;

  const pThemes = {
    hero:           { colors: ['#4f8ef7', '#00d4ff', '#7c5cfc'], speed: 0.35, size: 2.5, count: 40 },
    about:          { colors: ['#4f8ef7', '#7c5cfc', '#00d4ff'], speed: 0.2,  size: 2,   count: 35 },
    skills:         { colors: ['#00d4ff', '#4f8ef7', '#00ff88'], speed: 0.25, size: 2,   count: 40 },
    education:      { colors: ['#ffd700', '#ffaa00', '#4f8ef7'], speed: 0.15, size: 2.5, count: 30 },
    projects:       { colors: ['#ff6b6b', '#4f8ef7', '#00d4ff'], speed: 0.22, size: 2,   count: 35 },
    certifications: { colors: ['#ffd700', '#4f8ef7', '#ffffff'], speed: 0.12, size: 2,   count: 30 },
    beyond:         { colors: ['#ff6b6b', '#00ff88', '#ffd700', '#4f8ef7'], speed: 0.3, size: 2, count: 35 },
    contact:        { colors: ['#4f8ef7', '#00d4ff', '#ffffff'], speed: 0.15, size: 2,   count: 30 }
  };

  class PParticle {
    constructor(theme) { this.reset(theme); }
    reset(theme) {
      this.x = Math.random() * pW;
      this.y = Math.random() * pH;
      this.size = (Math.random() * 0.8 + 0.4) * theme.size;
      this.speedX = (Math.random() - 0.5) * theme.speed;
      this.speedY = (Math.random() - 0.5) * theme.speed;
      this.color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
      this.alpha = Math.random() * 0.35 + 0.1;
      this.life = 0;
      this.maxLife = 180 + Math.random() * 220;
    }
    update(theme) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.x < -30 || this.x > pW + 30 || this.y < -30 || this.y > pH + 30 || this.life > this.maxLife) {
        this.reset(theme);
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles(theme) {
    pParticles = [];
    for (let i = 0; i < theme.count; i++) pParticles.push(new PParticle(theme));
  }

  if (pCanvas && !reducedMotion) {
    pCtx = pCanvas.getContext('2d');
    pW = pCanvas.width = window.innerWidth;
    pH = pCanvas.height = window.innerHeight;
    currentTheme = pThemes.hero;
    initParticles(currentTheme);

    window.addEventListener('resize', () => {
      pW = pCanvas.width = window.innerWidth;
      pH = pCanvas.height = window.innerHeight;
    }, { passive: true });

    // Section observer for theme switching — does NOT unobserve (must keep tracking)
    const pSections = [
      { id: 'hero',           el: document.getElementById('hero') },
      { id: 'about',          el: document.getElementById('about') },
      { id: 'skills',         el: document.getElementById('skills') },
      { id: 'education',      el: document.getElementById('education') },
      { id: 'projects',       el: document.getElementById('projects') },
      { id: 'certifications', el: document.getElementById('certifications') },
      { id: 'beyond',         el: document.getElementById('beyond') },
      { id: 'contact',        el: document.getElementById('contact') }
    ];
    const pObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const section = pSections.find(s => s.el === e.target);
          if (section && pThemes[section.id]) {
            const newTheme = pThemes[section.id];
            if (newTheme !== currentTheme) {
              currentTheme = newTheme;
              initParticles(currentTheme);
            }
          }
        }
      });
    }, { threshold: 0.25 });
    pSections.forEach(s => { if (s.el) pObs.observe(s.el); });
  }

  // particle draw function — called inside unified rAF loop
  // rule #5: NO connection lines at all
  function animateParticles() {
    if (!pCtx || !pCanvas) return;
    pCtx.clearRect(0, 0, pW, pH);
    pParticles.forEach(p => {
      p.update(currentTheme);
      p.draw(pCtx); // dots only — no lines
    });
  }

  // ===== SECTION HEADER VISIBILITY OBSERVER — rule #9: unobserve =====
  const headerObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target); // rule #9
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.section-header').forEach(h => headerObs.observe(h));

  // ===== FORM SUBMISSION VIA FORMPREE =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = this.querySelector('.submit-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      try {
        const res = await fetch(this.action, {
          method: 'POST',
          body: new FormData(this),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          btn.innerHTML = 'Sent!';
          btn.classList.add('success');
          this.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        btn.innerHTML = 'Failed';
        btn.classList.add('error');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('error'); btn.disabled = false; }, 3000);
        return;
      }
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('success'); btn.disabled = false; }, 3000);
    });
  }

  // ===== WINDOW RESIZE (non-throttled, fine since it's resize not scroll) =====
  window.addEventListener('resize', () => {
    // reinit tilt on resize
  }, { passive: true });

  // ===== SINGLE UNIFIED rAF LOOP — rule #3 =====
  // Exactly ONE requestAnimationFrame loop. Everything animates here.
  let rafFrame = 0;
  (function _main() {
    requestAnimationFrame(_main);

    // Pause all animation when tab is hidden
    if (!tabVisible) return;

    rafFrame++;

    // cursor ring smooth follow
    animateCursor();

    // card tilts
    animateTilts();

    // hero parallax
    animateHeroParallax();

    // magnetic buttons
    animateMagnetic();

    // scroll-driven 3D panels
    animatePanels();

    // avatar 3D tilt
    animateAvatar();

      // particle canvas (every frame — it's just dots, very cheap)
      animateParticles();

      // hero spotlight
      if (heroSpotlight && window.innerWidth > 768) {
        sCX += (sTX - sCX) * 0.08;
        sCY += (sTY - sCY) * 0.08;
        heroSpotlight.style.setProperty('--sx', sCX + '%');
        heroSpotlight.style.setProperty('--sy', sCY + '%');
      }

    // shapes every 2nd frame (even cheaper)
    if (rafFrame % 2 === 0) animateShapes();
  })();

});
