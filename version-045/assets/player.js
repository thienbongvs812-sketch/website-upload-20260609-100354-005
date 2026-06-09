function initVideoPlayer(videoId, layerId, source) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  var ready = false;
  var hls = null;

  function bind() {
    if (ready || !video || !source) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    ready = true;
  }

  function play() {
    bind();
    if (layer) layer.classList.add('is-hidden');
    if (video) {
      var action = video.play();
      if (action && typeof action.catch === 'function') action.catch(function () {});
    }
  }

  if (layer) layer.addEventListener('click', play);
  if (video) {
    video.addEventListener('click', bind);
    video.addEventListener('play', function () {
      if (layer) layer.classList.add('is-hidden');
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') hls.destroy();
  });
}
