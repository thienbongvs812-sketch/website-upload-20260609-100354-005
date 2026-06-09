(function () {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 18);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      header.classList.toggle('menu-open', open);
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
    const prev = hero.querySelector('.hero-prev');
    const next = hero.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
    if (next) next.addEventListener('click', function () { show(current + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    show(0);
    start();
  }

  const filterBlocks = Array.from(document.querySelectorAll('[data-filter-block]'));
  filterBlocks.forEach(function (block) {
    const input = block.querySelector('[data-search-input]');
    const type = block.querySelector('[data-type-filter]');
    const year = block.querySelector('[data-year-filter]');
    const cards = Array.from(block.querySelectorAll('.movie-card'));
    const empty = block.querySelector('.empty-state');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      const q = normalize(input && input.value);
      const t = normalize(type && type.value);
      const y = normalize(year && year.value);
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.tags
        ].join(' '));
        const matchesQuery = !q || haystack.indexOf(q) !== -1;
        const matchesType = !t || normalize(card.dataset.type).indexOf(t) !== -1;
        const matchesYear = !y || normalize(card.dataset.year) === y;
        const ok = matchesQuery && matchesType && matchesYear;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }

    if (input) input.addEventListener('input', apply);
    if (type) type.addEventListener('change', apply);
    if (year) year.addEventListener('change', apply);
    apply();
  });
})();
