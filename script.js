(() => {
  'use strict';

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // --- Scroll-triggered fade-in ---
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));

  // --- Hero generative background art ---
  (() => {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, nodes, time = 0, raf;

    const GOLD = { r: 201, g: 168, b: 76 };
    const BLUE = { r: 60, g: 90, b: 160 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes || nodes.length === 0) initNodes();
    }

    function initNodes() {
      const count = Math.floor((w * h) / 12000);
      nodes = [];
      for (let i = 0; i < count; i++) {
        const side = Math.random() < 0.5 ? 0 : 1;
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 1.5 + Math.random() * 2.5,
          side,
          phase: Math.random() * Math.PI * 2,
          drift: 0.2 + Math.random() * 0.4,
        });
      }
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function draw() {
      time += 0.003;
      ctx.clearRect(0, 0, w, h);

      // Flowing wave bands (data streams)
      for (let band = 0; band < 4; band++) {
        ctx.beginPath();
        const baseY = h * (0.2 + band * 0.2);
        const amp = 30 + band * 15;
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= w; x += 4) {
          const y = baseY + Math.sin(x * 0.003 + time * 2 + band * 1.2) * amp
                          + Math.sin(x * 0.007 - time * 1.5 + band) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        const alpha = 0.025 + band * 0.005;
        const col = band % 2 === 0 ? GOLD : BLUE;
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Geometric fairness motif: two overlapping circles (Venn-like, representing intersectionality)
      const cx1 = w * 0.15, cx2 = w * 0.85;
      const cy1 = h * 0.35, cy2 = h * 0.65;
      const rad1 = Math.min(w, h) * 0.22;
      const rad2 = Math.min(w, h) * 0.18;

      ctx.beginPath();
      ctx.arc(cx1, cy1, rad1 + Math.sin(time * 1.5) * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.04)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx1 + rad1 * 0.5, cy1 + rad1 * 0.15, rad1 * 0.75 + Math.sin(time * 1.2 + 1) * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${BLUE.r},${BLUE.g},${BLUE.b},0.04)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx2, cy2, rad2 + Math.cos(time * 1.3) * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.035)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx2 - rad2 * 0.4, cy2 - rad2 * 0.2, rad2 * 0.8 + Math.cos(time + 2) * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${BLUE.r},${BLUE.g},${BLUE.b},0.035)`;
      ctx.stroke();

      // Scattered polygons (algorithmic structures)
      const polyPositions = [
        { x: w * 0.75, y: h * 0.2, sides: 6, size: 40 },
        { x: w * 0.2,  y: h * 0.75, sides: 5, size: 35 },
        { x: w * 0.88, y: h * 0.5, sides: 8, size: 28 },
        { x: w * 0.1,  y: h * 0.15, sides: 4, size: 22 },
        { x: w * 0.55, y: h * 0.85, sides: 7, size: 30 },
      ];
      polyPositions.forEach((p, i) => {
        const rot = time * 0.3 + i;
        const s = p.size + Math.sin(time + i * 0.7) * 4;
        ctx.beginPath();
        for (let j = 0; j <= p.sides; j++) {
          const a = (j / p.sides) * Math.PI * 2 + rot;
          const px = p.x + Math.cos(a) * s;
          const py = p.y + Math.sin(a) * s;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const col = i % 2 === 0 ? GOLD : BLUE;
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},0.045)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update and draw nodes + connections (neural network motif)
      const connDist = 120;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx + Math.sin(time + n.phase) * n.drift * 0.3;
        n.y += n.vy + Math.cos(time * 0.8 + n.phase) * n.drift * 0.3;

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.12;
            const col = n.side === m.side ? GOLD : BLUE;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Node dot
        const col = n.side === 0 ? GOLD : BLUE;
        const pulse = 0.3 + Math.sin(time * 2 + n.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${pulse})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); });
    resize();
    draw();

    // Pause when hero is not visible
    const heroSection = document.getElementById('hero');
    const heroObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) draw();
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      },
      { threshold: 0 }
    );
    heroObs.observe(heroSection);
  })();

  // --- Smooth scroll for anchor links (fallback for older browsers) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
