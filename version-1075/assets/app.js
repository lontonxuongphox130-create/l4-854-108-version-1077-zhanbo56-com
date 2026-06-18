(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prev = slider.querySelector('.hero-prev');
    const next = slider.querySelector('.hero-next');
    let current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(current);
    start();
  });

  document.querySelectorAll('[data-filter-target]').forEach(function (grid) {
    const section = grid.closest('section') || document;
    const input = section.querySelector('.catalog-search');
    const buttons = Array.from(section.querySelectorAll('[data-filter]'));
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const empty = section.querySelector('.empty-state');
    let activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        const matchesQuery = !query || text.includes(query);
        const matchesType = activeFilter === 'all' || text.includes(normalize(activeFilter));
        const shouldShow = matchesQuery && matchesType;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = button.dataset.filter || 'all';
        filterCards();
      });
    });

    filterCards();
  });

  const searchResults = document.getElementById('searchResults');
  const searchEmpty = document.getElementById('searchEmpty');
  const searchInput = document.getElementById('searchInput');

  if (searchResults && searchInput && Array.isArray(window.siteMovies)) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    searchInput.value = query;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function movieCard(movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<span class="poster-wrap">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="type-badge">' + escapeHtml(movie.type || '影片') + '</span>' +
        '</span>' +
        '<span class="card-body">' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<em>' + escapeHtml(movie.oneLine) + '</em>' +
          '<small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</small>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
    }

    function render(value) {
      const keyword = String(value || '').toLowerCase().trim();
      if (!keyword) {
        searchResults.innerHTML = '';
        if (searchEmpty) {
          searchEmpty.hidden = false;
          searchEmpty.textContent = '输入关键词后开始浏览影片';
        }
        return;
      }

      const matched = window.siteMovies.filter(function (movie) {
        const text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return text.includes(keyword);
      }).slice(0, 120);

      searchResults.innerHTML = matched.map(movieCard).join('');
      if (searchEmpty) {
        searchEmpty.hidden = matched.length !== 0;
        searchEmpty.textContent = matched.length ? '' : '没有找到相关影片';
      }
    }

    searchInput.addEventListener('input', function () {
      render(searchInput.value);
    });

    render(query);
  }
})();
