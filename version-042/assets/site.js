(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var index = 0;
    var timer;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var lists = qsa('[data-filter-list]');
    if (!lists.length) {
      return;
    }
    var input = qs('[data-search-input]');
    var year = qs('[data-filter-year]');
    var type = qs('[data-filter-type]');

    function norm(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = norm(input && input.value);
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      lists.forEach(function (list) {
        qsa('[data-search]', list).forEach(function (card) {
          var haystack = norm(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
          card.setAttribute('data-hidden', matchedKeyword && matchedYear && matchedType ? 'false' : 'true');
        });
      });
    }

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      var source = shell.getAttribute('data-src');
      var ready = false;
      var hls;

      function init() {
        if (!video || !source || ready) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        ready = true;
      }

      function play() {
        init();
        if (!video) {
          return;
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', init);
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupImages();
    setupPlayers();
  });
})();
