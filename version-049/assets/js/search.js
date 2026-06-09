(function () {
  var page = document.querySelector('[data-search-page]');

  if (!page || !Array.isArray(movieSearchIndex)) {
    return;
  }

  var input = page.querySelector('[data-search-input]');
  var button = page.querySelector('[data-search-button]');
  var results = page.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[item];
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var matched = movieSearchIndex.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      return keyword ? haystack.indexOf(keyword) !== -1 : true;
    }).slice(0, 60);

    results.innerHTML = matched.map(cardTemplate).join('');
  }

  if (initial) {
    input.value = initial;
  }

  button.addEventListener('click', render);
  input.addEventListener('input', render);
  render();
})();
