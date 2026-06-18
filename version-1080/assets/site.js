(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs("[data-menu-toggle]");
  var mobileNav = qs("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = qsa("[data-hero-slide]");
  var dots = qsa("[data-hero-dot]");
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHeroSlide(Number(dot.getAttribute("data-hero-dot") || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters(root) {
    var input = qs("[data-filter-input]", root);
    var category = qs("[data-filter-category]", root);
    var genre = qs("[data-filter-genre]", root);
    var region = qs("[data-filter-region]", root);
    var status = qs("[data-filter-status]", document);
    var items = qsa(".filter-item", root);

    if (!items.length) {
      return;
    }

    function applyFilters() {
      var query = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var genreValue = normalize(genre && genre.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute("data-search"));
        var itemCategory = normalize(item.getAttribute("data-category"));
        var itemGenre = normalize(item.getAttribute("data-genre"));
        var itemRegion = normalize(item.getAttribute("data-region"));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (categoryValue && itemCategory !== categoryValue) {
          ok = false;
        }

        if (genreValue && itemGenre.indexOf(genreValue) === -1) {
          ok = false;
        }

        if (regionValue && itemRegion.indexOf(regionValue) === -1) {
          ok = false;
        }

        item.classList.toggle("hidden-by-filter", !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = "显示 " + visible + " 部影片";
      }
    }

    [input, category, genre, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && input) {
      input.value = q;
    }

    applyFilters();
  }

  qsa("[data-filter-root]").forEach(function (root) {
    setupFilters(root);
  });

  var playerScroll = qs("[data-scroll-player]");

  if (playerScroll) {
    playerScroll.addEventListener("click", function (event) {
      event.preventDefault();
      var shell = qs(".player-shell");
      if (shell) {
        shell.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();

function initMoviePlayer(source, poster) {
  var video = document.querySelector("[data-movie-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (video.getAttribute("data-player-ready") === "1") {
      return;
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.setAttribute("data-player-ready", "1");
  }

  function startPlayback() {
    attachSource();
    overlay.hidden = true;
    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.hidden = false;
      });
    }
  }

  overlay.addEventListener("click", startPlayback);

  video.addEventListener("play", function () {
    overlay.hidden = true;
  });

  video.addEventListener("ended", function () {
    overlay.hidden = false;
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
