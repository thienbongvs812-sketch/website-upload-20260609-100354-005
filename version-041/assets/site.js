function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

ready(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var previous = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (index < 0) {
      index = 0;
    }

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
  });

  document.querySelectorAll(".filter-box").forEach(function (box) {
    var target = document.querySelector(box.getAttribute("data-filter-target"));
    if (!target) {
      return;
    }
    var input = box.querySelector("[data-filter-input]");
    var year = box.querySelector("[data-filter-year]");
    var type = box.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
    var empty = target.parentElement ? target.parentElement.querySelector(".no-results") : null;

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var yearValue = normalize(year ? year.value : "");
      var typeValue = normalize(type ? type.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-keywords"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var typeMatch = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        var keywordMatch = !keyword || haystack.indexOf(keyword) >= 0;
        var matched = yearMatch && typeMatch && keywordMatch;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
});

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("video-player");
  var button = document.getElementById("play-button");
  var overlay = document.querySelector(".player-overlay");
  if (!video || !streamUrl) {
    return;
  }

  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = streamUrl;
  }

  function play() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }
  if (overlay) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  video.addEventListener("pause", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  });
  attach();
}
