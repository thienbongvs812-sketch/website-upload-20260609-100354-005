(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var header = document.getElementById("siteHeader");
    var menuButton = document.getElementById("menuButton");
    var mobileNav = document.getElementById("mobileNav");

    function setHeaderState() {
      if (!header) return;
      if (window.scrollY > 18) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (menuButton && mobileNav && header) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        header.classList.toggle("menu-open", mobileNav.classList.contains("open"));
      });
    }

    var slider = document.getElementById("heroSlider");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
          restart();
        });
      });

      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          restart();
        });
      }
      restart();
    }

    var searchInput = document.getElementById("searchInput");
    var regionFilter = document.getElementById("regionFilter");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var searchGrid = document.getElementById("searchGrid");

    if (searchInput && searchGrid) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) searchInput.value = query;
      var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function filterCards() {
        var text = valueOf(searchInput);
        var region = valueOf(regionFilter);
        var type = valueOf(typeFilter);
        var year = valueOf(yearFilter);
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || "",
            card.dataset.region || "",
            card.dataset.type || "",
            card.dataset.year || "",
            card.dataset.genre || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchRegion = !region || (card.dataset.region || "").toLowerCase() === region;
          var matchType = !type || (card.dataset.type || "").toLowerCase() === type;
          var matchYear = !year || (card.dataset.year || "").toLowerCase() === year;
          card.classList.toggle("is-hidden", !(matchText && matchRegion && matchType && matchYear));
        });
      }

      [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
        if (control) control.addEventListener("input", filterCards);
        if (control) control.addEventListener("change", filterCards);
      });
      filterCards();
    }
  });

  window.startMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var playToggle = document.getElementById("playToggle");
    var soundToggle = document.getElementById("soundToggle");
    var fullScreenToggle = document.getElementById("fullScreenToggle");
    var loaded = false;
    var hls = null;

    if (!video || !sourceUrl) return;

    function attachSource() {
      if (loaded) return;
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function setPlayingState(isPlaying) {
      if (playToggle) playToggle.textContent = isPlaying ? "❚❚" : "▶";
      if (overlay) overlay.classList.toggle("is-hidden", isPlaying);
    }

    function playMovie() {
      attachSource();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function togglePlay(event) {
      if (event) event.stopPropagation();
      if (video.paused) {
        playMovie();
      } else {
        video.pause();
      }
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      setPlayingState(true);
    });
    video.addEventListener("pause", function () {
      setPlayingState(false);
    });

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) playMovie();
      });
    }
    if (playToggle) playToggle.addEventListener("click", togglePlay);
    if (soundToggle) {
      soundToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        video.muted = !video.muted;
        soundToggle.textContent = video.muted ? "🔇" : "🔊";
      });
    }
    if (fullScreenToggle) {
      fullScreenToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  };
})();
