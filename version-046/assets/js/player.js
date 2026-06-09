(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initPlayer(container) {
    var video = container.querySelector("video");
    var overlay = container.querySelector("[data-play-button]");
    var status = container.querySelector("[data-player-status]");
    var source = container.getAttribute("data-src");
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function attachSource() {
      if (initialized || !video || !source) {
        return;
      }
      initialized = true;
      setStatus("正在加载播放源…");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
          video.play().catch(function () {
            setStatus("点击播放器继续播放");
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络连接异常，正在重试…");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("媒体加载异常，正在恢复…");
            hls.recoverMediaError();
          } else {
            setStatus("播放失败，请刷新后重试");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("");
          video.play().catch(function () {
            setStatus("点击播放器继续播放");
          });
        }, { once: true });
      } else {
        setStatus("当前浏览器不支持 HLS 播放");
      }
    }

    function start() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video) {
        video.play().catch(function () {
          setStatus("点击播放器继续播放");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(initPlayer);
  });
}());
