(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function applyFilter(value) {
      var keyword = String(value || "").trim().toLowerCase();

      cards.forEach(function (card) {
        var text = String(card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
      });
    }

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (initial) {
        filterInput.value = initial;
        applyFilter(initial);
      }

      filterInput.addEventListener("input", function () {
        applyFilter(filterInput.value);
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-chip") || "";

        if (filterInput) {
          filterInput.value = value;
        }

        applyFilter(value);
      });
    });
  });
})();
