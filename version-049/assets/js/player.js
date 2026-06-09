(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('movie-play-button');
    var message = document.getElementById('player-message');
    var hls = null;
    var ready = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideButton() {
      button.classList.add('is-hidden');
    }

    function playVideo() {
      hideButton();
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    function prepareNative() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;
      video.src = streamUrl;
      video.load();
      playVideo();
    }

    function prepareHls() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;
      hls = new window.Hls({
        enableWorker: false,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('');
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放暂时不可用，请稍后再试。');
          button.classList.remove('is-hidden');
        }
      });
    }

    function start() {
      setMessage('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        prepareNative();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        prepareHls();
        return;
      }

      video.src = streamUrl;
      video.load();
      playVideo();
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', hideButton);
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
