document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year (all pages) ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: shrink + solid bg on scroll ---------- */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));

    document.querySelectorAll('.nav-dropdown > .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 760) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });

    document.querySelectorAll('.main-nav a:not(.nav-dropdown > .nav-link)').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('open'));
    });
  }

  /* ---------- Hero Ken Burns slideshow (home page only) ---------- */
  const slideshow = document.getElementById('heroSlideshow');
  const dotsWrap = document.getElementById('heroDots');
  if (slideshow) {
    const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
    let current = slides.findIndex(s => s.classList.contains('active'));
    if (current === -1) current = 0;

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Show slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('active');
      if (dotsWrap) dotsWrap.children[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      if (dotsWrap) dotsWrap.children[current].classList.add('active');
    }

    setInterval(() => goTo((current + 1) % slides.length), 5000);
  }

  /* ---------- Portfolio: build cards from data (home + wedding pages) ---------- */
  const weddings = [
    { names: 'Aarav & Diya',      type: 'Classic Wedding',  tone: ['#1a1a1a', '#7a9d6e'], src: "img/portfolio/couple/2.jpg", },
    { names: 'Kabir & Meher',     type: 'Casual Wedding',   tone: ['#2e2e2e', '#9cb98f'], src: "img/portfolio/couple/4.jpg", },
    { names: 'Vihaan & Naina',    type: 'Nature Wedding',   tone: ['#5c7d52', '#0d0d0d'], src: "img/portfolio/couple/18.jpg", },
    { names: 'Rohan & Simran',    type: 'Casual Wedding',   tone: ['#111111', '#a9c39d'], src: "img/portfolio/couple/8.jpg", },
    { names: 'Aditya & Priya',    type: 'Classic Wedding',  tone: ['#3a3a3a', '#7a9d6e'], src: "img/portfolio/couple/26.jpg", },
    { names: 'Arjun & Kavya',     type: 'Destination Wed.', tone: ['#5c7d52', '#1a1a1a'], src: "img/portfolio/couple/32.jpg" },
  ];

  const grid = document.getElementById('portfolioGrid');
  if (grid) {
    const frag = document.createDocumentFragment();
    weddings.forEach(w => {
      const card = document.createElement('article');
      card.className = 'p-card reveal';
      card.innerHTML = `
        <div class="p-thumb">
          <div class="p-thumb-inner" style="position:absolute; inset:0; background:linear-gradient(150deg, ${w.tone[0]}, ${w.tone[1]});">
          <img src=${w.src}></div>
          <span class="p-corner tl"></span>
          <span class="p-corner br"></span>
          <span class="p-tag">${w.type}</span>
        </div>
        <a href="portfolio.html#pfStickyBar"><h3 class="p-names">${w.names}</h3>
        <p class="p-type">${w.type}</p> </a>
      `;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- Active nav link on scroll (home page anchors) ---------- */
  const sections = ['home', 'about', 'portfolio', 'faq']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (sections.length) {
    const navLinks = document.querySelectorAll('.main-nav > .nav-link');
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const match = document.querySelector(`.main-nav a[href="#${entry.target.id}"], .main-nav a[href="index.html#${entry.target.id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(sec => navObserver.observe(sec));
  }

  /* ---------- Scroll-reveal fade-up (all pages) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Animated stat counters (about page) ---------- */
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (statNums.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + '';
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.innerHTML = target + (suffix ? `<span class="stat-suffix">${suffix}</span>` : '');
        }
      };
      requestAnimationFrame(tick);
    };
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => statObserver.observe(el));
  }

});

/* -----------------------------------------------------------
   NOTE: "Add More Event" popup, budget slider, aur contact-form
   EmailJS submission — ye sab ab SIRF contact.js me hain (pehle
   yahan bhi ek copy thi jo contact.js ke saath clash kar rahi
   thi — usi wajah se do-do baar events add ho rahe the / errors
   aa rahe the). Contact page par script.js + contact.js dono load
   hote hain, isliye in features ke liye contact.js hi dekho.
   ----------------------------------------------------------- */
