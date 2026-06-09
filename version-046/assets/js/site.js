(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var count = panel.querySelector("[data-filter-count]");
    var items = Array.prototype.slice.call(list.querySelectorAll(".filter-item"));

    function apply() {
      var query = normalize(input && input.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-year"),
          item.getAttribute("data-genre")
        ].join(" "));
        var itemType = normalize(item.getAttribute("data-type"));
        var itemYear = normalize(item.getAttribute("data-year"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !selectedType || itemType.indexOf(selectedType) !== -1;
        var matchesYear = !selectedYear || itemYear.indexOf(selectedYear) !== -1;
        var shouldShow = matchesQuery && matchesType && matchesYear;

        item.classList.toggle("is-hidden-by-filter", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " / " + items.length + " 部";
      }
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    apply();
  }

  function initCoverFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".cover-img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        image.removeAttribute("src");
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initCoverFallbacks();
  });
}());
