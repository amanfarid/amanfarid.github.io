document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // ===== HERO TITLE 3D SPLIT =====
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

  // ===== OPTIMIZED THREE.JS SCENE =====
  let scene, camera, renderer, particles, centralCore, ring, ring2, octahedron;
  let particleGeo, originalPositions;
  let mouse3D = { x: 0, y: 0 };
  let threeRunning = true;

  let threeInitialized = false;

  function initThree() {
    if (threeInitialized || typeof THREE === 'undefined') return;
    threeInitialized = true;
    const container = document.getElementById('three-container');
    if (!container) return;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const count = 600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    originalPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      originalPositions[i * 3] = x; originalPositions[i * 3 + 1] = y; originalPositions[i * 3 + 2] = z;
      const c = new THREE.Color().setHSL(0.58 + Math.random() * 0.1, 0.7, 0.4 + Math.random() * 0.3);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    particles = new THREE.Points(particleGeo, mat);
    scene.add(particles);

    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.2 });
    centralCore = new THREE.Mesh(coreGeo, coreMat);
    scene.add(centralCore);

    const octGeo = new THREE.OctahedronGeometry(0.25, 0);
    const octMat = new THREE.MeshBasicMaterial({ color: 0x7c5cfc, wireframe: true, transparent: true, opacity: 0.15 });
    octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(1.5, 0.8, 0);
    scene.add(octahedron);

    const ringGeo = new THREE.TorusGeometry(1.8, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f8ef7, transparent: true, opacity: 0.08 });
    ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.01, 12, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.04 });
    ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2.5;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    animateThree();
  }

  function animateThree() {
    requestAnimationFrame(animateThree);
    if (!threeRunning || !renderer) return;

    const time = Date.now() * 0.001;
    if (particles) {
      particles.rotation.y += 0.0006;
      const posAttr = particleGeo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];
        const wave = Math.sin(time * 1.5 + ox * 2 + oy) * 0.03;
        const mx = mouse3D.x * 0.15;
        const my = mouse3D.y * 0.15;
        arr[i] = ox + mx + wave;
        arr[i + 1] = oy + my + Math.cos(time + oz) * 0.02;
        arr[i + 2] = oz;
      }
      posAttr.needsUpdate = true;
    }
    if (centralCore) { centralCore.rotation.x += 0.004; centralCore.rotation.y += 0.006; }
    if (octahedron) { octahedron.rotation.x += 0.008; octahedron.rotation.z += 0.005; }
    if (ring) { ring.rotation.z += 0.001; ring.rotation.y += 0.002; }
    if (ring2) { ring2.rotation.z -= 0.0008; ring2.rotation.x += 0.001; }
    camera.position.x += (mouse3D.x * 0.35 - camera.position.x) * 0.025;
    camera.position.y += (-mouse3D.y * 0.35 - camera.position.y) * 0.025;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }

  if (typeof THREE !== 'undefined') initThree();
  else window.addEventListener('load', initThree);

  document.addEventListener('mousemove', e => {
    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });

  // Pause Three.js when hero not visible
  const heroSection = document.getElementById('hero');
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { threeRunning = e.isIntersecting; });
  }, { threshold: 0 });
  if (heroSection) heroObserver.observe(heroSection);

  // ===== CUSTOM CURSOR =====
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    if (!cursorDot || !cursorRing) return;
    cursorX = e.clientX; cursorY = e.clientY;
    cursorDot.style.left = cursorX + 'px';
    cursorDot.style.top = cursorY + 'px';
  });

  function animateCursor() {
    ringX += (cursorX - ringX) * 0.14;
    ringY += (cursorY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  if (window.innerWidth > 768) animateCursor();

  document.querySelectorAll('a, button, .skill-card, .project-card, .cert-card, .beyond-card, .social-link, .hamburger').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width = '12px'; cursorDot.style.height = '12px'; cursorDot.style.background = '#00d4ff';
      cursorRing.style.width = '50px'; cursorRing.style.height = '50px'; cursorRing.style.borderColor = 'rgba(0,212,255,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width = '8px'; cursorDot.style.height = '8px'; cursorDot.style.background = '#4f8ef7';
      cursorRing.style.width = '40px'; cursorRing.style.height = '40px'; cursorRing.style.borderColor = 'rgba(79,142,247,0.5)';
    });
  });

  // ===== SCROLL PROGRESS =====
  const progressBar = document.querySelector('.scroll-progress');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = ((scrollTop / scrollHeight) * 100) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== TYPEWRITER =====
  const titles = ['BSAI Student', 'Python Developer', 'AI Enthusiast', 'Vibe Coder'];
  let titleIndex = 0, charIndex = 0, isDeleting = false;
  const typewriterEl = document.getElementById('typewriter');

  function typeWriter() {
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

  // ===== FADE-IN SCROLL (IntersectionObserver) =====
  const fadeEls = document.querySelectorAll('section, footer, .about-content, .contact-container, .section-header, .timeline-item');
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => { el.classList.add('fade-in'); fadeObs.observe(el); });

  // ===== TIMELINE =====
  const timelineObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline-item').forEach(item => timelineObs.observe(item));

  // ===== COUNTERS =====
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
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  if (document.querySelector('.about')) counterObs.observe(document.querySelector('.about'));

  // ===== SMOOTH 3D TILT (unified lerp) =====
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
      el.addEventListener('mouseleave', () => {
        state.hover = false;
        state.tx = 0;
        state.ty = 0;
      });
      tiltCards.push(state);
    });
  }
  if (window.innerWidth > 768) {
    initSmoothTilt('.project-card', 32, 6);
    initSmoothTilt('.skill-card, .cert-card, .beyond-card', 36, 4);
    function animateTilts() {
      tiltCards.forEach(s => {
        s.cx += (s.tx - s.cx) * 0.1;
        s.cy += (s.ty - s.cy) * 0.1;
        const active = s.hover || Math.abs(s.cx) > 0.02 || Math.abs(s.cy) > 0.02;
        if (active) {
          const lift = s.hover ? s.lift : s.lift * (Math.abs(s.cx) + Math.abs(s.cy));
          s.el.style.transform = `perspective(1200px) rotateX(${s.cy}deg) rotateY(${s.cx}deg) translateY(${-lift}px)`;
        } else {
          s.el.style.transform = '';
        }
      });
      requestAnimationFrame(animateTilts);
    }
    animateTilts();
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

  // ===== NAVBAR SCROLL =====
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });

  // ===== BACK TO TOP =====
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => { backToTop.classList.toggle('visible', window.scrollY > 500); }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ===== SMOOTH HERO PARALLAX =====
  const heroContent = document.querySelector('.hero-content');
  let heroTY = 0, heroOp = 1, targetHeroTY = 0, targetHeroOp = 1;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (sy < window.innerHeight) {
      targetHeroTY = sy * 0.12;
      targetHeroOp = Math.max(0.15, 1 - sy / (window.innerHeight * 0.9));
    }
  }, { passive: true });
  function animateHeroParallax() {
    if (heroContent) {
      heroTY += (targetHeroTY - heroTY) * 0.08;
      heroOp += (targetHeroOp - heroOp) * 0.08;
      heroContent.style.transform = `translateY(${heroTY}px)`;
      heroContent.style.opacity = heroOp;
    }
    requestAnimationFrame(animateHeroParallax);
  }
  animateHeroParallax();

  // ===== SMOOTH FLOATING SHAPE PARALLAX =====
  const shapeStates = [];
  document.querySelectorAll('.section-3d').forEach(section => {
    section.querySelectorAll('.floating-shape').forEach(shape => {
      shapeStates.push({ shape, tx: 0, ty: 0, cx: 0, cy: 0 });
    });
    section.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      section.querySelectorAll('.floating-shape').forEach((shape, i) => {
        const idx = shapeStates.findIndex(s => s.shape === shape);
        if (idx >= 0) {
          shapeStates[idx].tx = x * -12;
          shapeStates[idx].ty = y * -12;
        }
      });
    });
    section.addEventListener('mouseleave', () => {
      section.querySelectorAll('.floating-shape').forEach(shape => {
        const idx = shapeStates.findIndex(s => s.shape === shape);
        if (idx >= 0) { shapeStates[idx].tx = 0; shapeStates[idx].ty = 0; }
      });
    });
  });
  function animateShapes() {
    shapeStates.forEach(s => {
      s.cx += (s.tx - s.cx) * 0.06;
      s.cy += (s.ty - s.cy) * 0.06;
      s.shape.style.setProperty('--px', s.cx + 'px');
      s.shape.style.setProperty('--py', s.cy + 'px');
    });
    requestAnimationFrame(animateShapes);
  }
  animateShapes();

  // ===== CONTACT FORM (FormSubmit.co AJAX) =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('.submit-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = 'Sending...'; btn.disabled = true;
      fetch('https://formsubmit.co/ajax/amanfaridsamoo@gmail.com', {
        method: 'POST',
        body: new FormData(this)
      })
      .then(res => { if (!res.ok) throw new Error('Server error'); return res.json(); })
      .then(() => {
        btn.classList.add('success');
        btn.innerHTML = 'Message Sent!';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('success'); }, 3000);
        this.reset();
      })
      .catch(() => {
        btn.classList.add('error');
        btn.innerHTML = 'Failed - Try Again';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('error'); }, 3000);
      });
    });
  }

  // ===== BUTTON RIPPLE =====
  document.querySelectorAll('.submit-btn, .cta-button:not(.cta-ghost), .back-to-top').forEach(btn => {
    btn.classList.add('ripple-btn');
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // ===== CURSOR GLOW TRAIL =====
  if (window.innerWidth > 768) {
    const trails = [];
    for (let i = 0; i < 3; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.opacity = 0.3 - i * 0.08;
      trail.style.width = (6 - i * 1.2) + 'px';
      trail.style.height = (6 - i * 1.2) + 'px';
      document.body.appendChild(trail);
      trails.push({ el: trail, x: 0, y: 0 });
    }
    let trailMouseX = 0, trailMouseY = 0;
    document.addEventListener('mousemove', e => { trailMouseX = e.clientX; trailMouseY = e.clientY; });
    function animateTrails() {
      let px = trailMouseX, py = trailMouseY;
      trails.forEach((t, i) => {
        t.x += (px - t.x) * 0.12;
        t.y += (py - t.y) * 0.12;
        t.el.style.left = t.x + 'px';
        t.el.style.top = t.y + 'px';
        px = t.x; py = t.y;
      });
      requestAnimationFrame(animateTrails);
    }
    animateTrails();
  }

  // ===== STAGGER ENTRANCE FOR GRID ITEMS =====
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stagger-enter').forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 100);
        });
        staggerObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .beyond-grid').forEach(grid => {
    const items = grid.querySelectorAll(':scope > *');
    items.forEach((item, i) => {
      item.classList.add('stagger-enter');
      item.style.transitionDelay = (i * 0.08) + 's';
    });
    staggerObs.observe(grid);
  });

  // ===== ENHANCED PARALLAX SHAPES ON SCROLL =====
  document.querySelectorAll('.floating-shape').forEach(shape => {
    shape.classList.add('glowing');
  });

  // ===== NAV ACTIVE SECTION SPY =====
  const sections = document.querySelectorAll('section[id]');
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
  sections.forEach(s => sectionObs.observe(s));

  // ===== TIMELINE LINE ANIMATION =====
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.2 });
    tlObs.observe(timeline);
  }

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
    setTimeout(() => {
      lightbox.setAttribute('hidden', '');
      lightboxImg.src = '';
    }, 300);
  }

  document.querySelectorAll('.cert-card[data-cert]').forEach(card => {
    const open = () => openLightbox(card.dataset.cert, card.querySelector('h3')?.textContent);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  // ===== MAGNETIC BUTTONS (smooth lerp) =====
  const magneticWraps = [];
  if (window.innerWidth > 768 && !reducedMotion) {
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
      requestAnimationFrame(animateMagnetic);
    }
    animateMagnetic();
  }

  // ===== SKILL RING ANIMATE ON SCROLL =====
  const ringObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.ring-fill').forEach(ring => {
          const pct = ring.style.getPropertyValue('--pct') || getComputedStyle(ring).getPropertyValue('--pct');
          ring.style.strokeDashoffset = '314.16';
          requestAnimationFrame(() => {
            ring.style.strokeDashoffset = `calc(314.16 - (314.16 * ${pct}) / 100)`;
          });
        });
        ringObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-card').forEach(card => ringObs.observe(card));

  // ===== SCROLL-DRIVEN 3D SECTIONS (smooth lerp) =====
  if (!reducedMotion && window.innerWidth > 768) {
    const panelStates = [];
    document.querySelectorAll('.scene-panel:not(#hero)').forEach(panel => {
      panelStates.push({ el: panel, targetR: 0, currentR: 0, targetS: 1, currentS: 1 });
    });
    window.addEventListener('scroll', () => {
      panelStates.forEach(state => {
        const rect = state.el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = (center - window.innerHeight / 2) / window.innerHeight;
        state.targetR = Math.max(-2.5, Math.min(2.5, dist * 3.5));
        state.targetS = Math.max(0.985, 1 - Math.abs(dist) * 0.015);
      });
    }, { passive: true });
    function animatePanels() {
      panelStates.forEach(state => {
        state.currentR += (state.targetR - state.currentR) * 0.06;
        state.currentS += (state.targetS - state.currentS) * 0.06;
        state.el.style.transform = `perspective(1400px) rotateX(${state.currentR}deg) scale(${state.currentS})`;
      });
      requestAnimationFrame(animatePanels);
    }
    animatePanels();
  }

  // ===== AVATAR 3D TILT (smooth) =====
  const avatar = document.querySelector('.avatar-3d');
  if (avatar && window.innerWidth > 768 && !reducedMotion) {
    let aTX = 0, aTY = 0, aCX = 0, aCY = 0;
    document.addEventListener('mousemove', e => {
      const rect = avatar.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) { aTX = 0; aTY = 0; return; }
      aTX = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 12;
      aTY = (-(e.clientY - rect.top - rect.height / 2) / rect.height) * 12;
    });
    function animateAvatar() {
      aCX += (aTX - aCX) * 0.08;
      aCY += (aTY - aCY) * 0.08;
      if (Math.abs(aCX) > 0.05 || Math.abs(aCY) > 0.05) {
        avatar.style.transform = `perspective(600px) rotateY(${aCX}deg) rotateX(${aCY}deg)`;
      } else {
        avatar.style.transform = '';
      }
      requestAnimationFrame(animateAvatar);
    }
    animateAvatar();
  }

  // ===== GHOST CTA RIPPLE =====
  document.querySelectorAll('.cta-ghost').forEach(btn => {
    btn.classList.add('ripple-btn');
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // ===== SECTION-AWARE PARTICLE BACKGROUND =====
  const pCanvas = document.getElementById('bg-canvas');
  if (pCanvas && !reducedMotion) {
    const pCtx = pCanvas.getContext('2d');
    let pW, pH;

    function resizeP() {
      pW = pCanvas.width = window.innerWidth;
      pH = pCanvas.height = window.innerHeight;
    }
    resizeP();
    window.addEventListener('resize', resizeP);

    const pThemes = {
      hero: { colors: ['#4f8ef7', '#00d4ff', '#7c5cfc'], speed: 0.35, size: 2.5, count: 50, connect: true },
      about: { colors: ['#4f8ef7', '#7c5cfc', '#00d4ff'], speed: 0.2, size: 2, count: 55, connect: true },
      skills: { colors: ['#00d4ff', '#4f8ef7', '#00ff88'], speed: 0.25, size: 2, count: 60, connect: true },
      education: { colors: ['#ffd700', '#ffaa00', '#4f8ef7'], speed: 0.15, size: 2.5, count: 45, connect: false },
      projects: { colors: ['#ff6b6b', '#4f8ef7', '#00d4ff'], speed: 0.22, size: 2, count: 55, connect: true },
      certifications: { colors: ['#ffd700', '#4f8ef7', '#ffffff'], speed: 0.12, size: 2, count: 40, connect: false },
      beyond: { colors: ['#ff6b6b', '#00ff88', '#ffd700', '#4f8ef7'], speed: 0.3, size: 2, count: 55, connect: true },
      contact: { colors: ['#4f8ef7', '#00d4ff', '#ffffff'], speed: 0.15, size: 2, count: 40, connect: false }
    };

    let particles = [];
    let currentTheme = pThemes.hero;

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
      draw(ctx, theme) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
      }
    }

    function initParticles(theme) {
      particles = [];
      for (let i = 0; i < theme.count; i++) {
        particles.push(new PParticle(theme));
      }
    }
    initParticles(currentTheme);

    function animateParticles() {
      pCtx.clearRect(0, 0, pW, pH);
      particles.forEach(p => {
        p.update(currentTheme);
        p.draw(pCtx, currentTheme);
      });
      if (currentTheme.connect) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              pCtx.beginPath();
              pCtx.moveTo(particles[i].x, particles[i].y);
              pCtx.lineTo(particles[j].x, particles[j].y);
              pCtx.strokeStyle = currentTheme.colors[0];
              pCtx.globalAlpha = 0.04 * (1 - dist / 80);
              pCtx.lineWidth = 0.5;
              pCtx.stroke();
              pCtx.closePath();
            }
          }
        }
      }
      pCtx.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    }

    const pSections = [
      { id: 'hero', el: document.getElementById('hero') },
      { id: 'about', el: document.getElementById('about') },
      { id: 'skills', el: document.getElementById('skills') },
      { id: 'education', el: document.getElementById('education') },
      { id: 'projects', el: document.getElementById('projects') },
      { id: 'certifications', el: document.getElementById('certifications') },
      { id: 'beyond', el: document.getElementById('beyond') },
      { id: 'contact', el: document.getElementById('contact') }
    ];

    const pObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const section = pSections.find(s => s.el === e.target);
          if (section && pThemes[section.id]) {
            currentTheme = pThemes[section.id];
          }
        }
      });
    }, { threshold: 0.25 });

    pSections.forEach(s => { if (s.el) pObs.observe(s.el); });

    animateParticles();
  }

  // ===== SECTION INDICATOR ACTIVE TRACKING =====
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  if (indicatorDots.length) {
    const indicatorSections = [];
    indicatorDots.forEach(dot => {
      const id = dot.dataset.section;
      if (id) indicatorSections.push({ el: document.getElementById(id), dot: dot });
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

});
