(function () {
  function qs(root, selector) {
    return root.querySelector(selector);
  }

  function qsa(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = qs(document, '[data-menu-toggle]');
    var nav = qs(document, '[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs(document, '[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa(slider, '[data-hero-slide]');
    var dots = qsa(slider, '[data-hero-dot]');
    var prev = qs(slider, '[data-hero-prev]');
    var next = qs(slider, '[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function readSearchParams(scope) {
    var params = new URLSearchParams(window.location.search);
    var textInput = qs(scope, '[data-filter-text]');
    var categoryInput = qs(scope, '[data-filter-category]');
    var q = params.get('q');
    var category = params.get('category');
    if (q && textInput) {
      textInput.value = q;
    }
    if (category && categoryInput) {
      categoryInput.value = category;
    }
  }

  function applyFilter(scope) {
    var text = normalize(qs(scope, '[data-filter-text]') && qs(scope, '[data-filter-text]').value);
    var category = normalize(qs(scope, '[data-filter-category]') && qs(scope, '[data-filter-category]').value);
    var region = normalize(qs(scope, '[data-filter-region]') && qs(scope, '[data-filter-region]').value);
    var year = normalize(qs(scope, '[data-filter-year]') && qs(scope, '[data-filter-year]').value);
    var cards = qsa(scope, '[data-filter-card]');
    var empty = qs(scope, '[data-filter-empty]');
    var shown = 0;

    cards.forEach(function (card) {
      var fullText = normalize(card.getAttribute('data-text') + ' ' + card.getAttribute('data-title'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var match = true;
      if (text && fullText.indexOf(text) === -1) {
        match = false;
      }
      if (category && cardCategory !== category) {
        match = false;
      }
      if (region && cardRegion.indexOf(region) === -1) {
        match = false;
      }
      if (year && cardYear.indexOf(year) === -1) {
        match = false;
      }
      card.hidden = !match;
      if (match) {
        shown += 1;
      }
    });

    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  function initFilters() {
    qsa(document, '[data-filter-scope]').forEach(function (scope) {
      readSearchParams(scope);
      qsa(scope, 'input, select').forEach(function (input) {
        input.addEventListener('input', function () {
          applyFilter(scope);
        });
        input.addEventListener('change', function () {
          applyFilter(scope);
        });
      });
      applyFilter(scope);
    });
  }

  function bindPlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function hideCover() {
      button.classList.add('is-hidden');
    }

    function startVideo() {
      var played = video.play();
      if (played && typeof played.catch === 'function') {
        played.catch(function () {});
      }
    }

    function loadVideo() {
      hideCover();
      if (loaded) {
        startVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        startVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = source;
            video.load();
          }
        });
        return;
      }
      video.src = source;
      video.load();
      startVideo();
    }

    button.addEventListener('click', loadVideo);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        loadVideo();
      }
    });
  }

  window.MovieSitePlayer = {
    bind: bindPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
