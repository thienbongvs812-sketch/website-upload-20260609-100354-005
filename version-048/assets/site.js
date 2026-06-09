(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('.filter-form'));

  filterForms.forEach(function (form) {
    var input = form.querySelector('.filter-input');
    var year = form.querySelector('.filter-select');
    var type = form.querySelector('.filter-type');
    var section = form.closest('.search-band');
    var grid = section ? section.nextElementSibling : document;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .rank-row'));

    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    }

    function applyFilter() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        card.classList.toggle('is-filtered-out', !(matchedTerm && matchedYear && matchedType));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();

function initMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);

  if (!video) {
    return;
  }

  var stage = video.closest('.player-stage');
  var cover = stage ? stage.querySelector('.player-cover') : null;
  var prepared = false;
  var hlsPlayer = null;

  function preparePlayer() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function playVideo() {
    preparePlayer();
    video.setAttribute('controls', 'controls');

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}
