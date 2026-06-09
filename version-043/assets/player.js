(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.querySelector("[data-player-overlay]");
      var playButton = document.querySelector("[data-play-button]");
      var hlsInstance = null;
      var attached = false;

      if (!video || !streamUrl) {
        return;
      }

      function attachStream() {
        if (attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = streamUrl;
      }

      function startPlay() {
        attachStream();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var request = video.play();

        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlay);
      }

      if (playButton) {
        playButton.addEventListener("click", function (event) {
          event.stopPropagation();
          startPlay();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlay();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };
})();
