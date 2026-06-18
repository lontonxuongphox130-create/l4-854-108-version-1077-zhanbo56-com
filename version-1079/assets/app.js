(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.hidden = !nav.hidden;
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    start();
  }

  function readActiveFilters(root) {
    var filters = {};
    qsa('[data-filter-group]', root).forEach(function (group) {
      var active = qs('.filter-pill.active', group);
      if (active) {
        filters[active.dataset.filterKey] = active.dataset.filterValue || '';
      }
    });
    return filters;
  }

  function initCatalog() {
    var lists = qsa('[data-movie-list]');
    if (!lists.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    qsa('[data-search-input]').forEach(function (input) {
      if (query) {
        input.value = query;
      }
    });
    function apply(root) {
      var input = qs('[data-search-input]', root) || qs('[data-search-input]');
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = readActiveFilters(root.parentElement || document);
      var visible = 0;
      qsa('.movie-card', root).forEach(function (card) {
        var searchText = (card.dataset.search || '').toLowerCase();
        var matchesText = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesFilters = true;
        Object.keys(filters).forEach(function (key) {
          var value = filters[key];
          if (value && (card.dataset[key] || '') !== value) {
            matchesFilters = false;
          }
        });
        var shown = matchesText && matchesFilters;
        card.classList.toggle('is-hidden', !shown);
        if (shown) {
          visible += 1;
        }
      });
      var empty = qs('[data-empty-message]', root.parentElement || document);
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    lists.forEach(function (root) {
      apply(root);
      var container = root.parentElement || document;
      qsa('[data-search-input]', container).forEach(function (input) {
        input.addEventListener('input', function () {
          apply(root);
        });
      });
      qsa('.filter-pill', container).forEach(function (button) {
        button.addEventListener('click', function () {
          var group = button.closest('[data-filter-group]');
          if (group) {
            qsa('.filter-pill', group).forEach(function (item) {
              item.classList.remove('active');
            });
          }
          button.classList.add('active');
          apply(root);
        });
      });
    });
  }

  function loadStream(video, stream, status) {
    if (!stream || video.dataset.ready === '1') {
      return;
    }
    if (status) {
      status.hidden = false;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (status) {
          status.hidden = true;
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && status) {
          status.textContent = '视频暂时无法播放，请稍后重试';
          status.hidden = false;
        }
      });
    } else {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        if (status) {
          status.hidden = true;
        }
      }, { once: true });
    }
    video.dataset.ready = '1';
  }

  function initPlayers() {
    qsa('.js-player').forEach(function (wrap) {
      var video = qs('video', wrap);
      var overlay = qs('.player-overlay', wrap);
      var status = qs('.player-status', wrap);
      var stream = wrap.dataset.stream;
      if (!video || !overlay) {
        return;
      }
      function play() {
        loadStream(video, stream, status);
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        overlay.classList.remove('is-hidden');
      });
      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCatalog();
    initPlayers();
  });
})();
