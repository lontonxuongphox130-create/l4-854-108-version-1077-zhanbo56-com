(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var buttons = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-button]'));
        var backgrounds = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-bg]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            buttons.forEach(function (button, idx) {
                button.classList.toggle('is-active', idx === current);
            });
            backgrounds.forEach(function (bg, idx) {
                bg.classList.toggle('is-active', idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        buttons.forEach(function (button, idx) {
            button.addEventListener('click', function () {
                show(idx);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);

        if (slides.length > 1) {
            start();
        }
    });

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function buildResult(item) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = item.url;

        var image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        link.appendChild(image);

        var copy = document.createElement('span');
        var title = document.createElement('strong');
        title.textContent = item.title;
        var meta = document.createElement('em');
        meta.textContent = item.region + ' · ' + item.year + ' · ' + item.genre;
        var line = document.createElement('small');
        line.textContent = item.line;
        copy.appendChild(title);
        copy.appendChild(meta);
        copy.appendChild(line);
        link.appendChild(copy);

        return link;
    }

    document.querySelectorAll('[data-global-search]').forEach(function (input) {
        var shell = input.closest('.search-shell');
        var panel = shell ? shell.querySelector('[data-search-results]') : null;
        var index = window.AHD_INDEX || [];

        if (!panel) {
            return;
        }

        input.addEventListener('input', function () {
            var query = normalize(input.value);
            panel.innerHTML = '';

            if (query.length < 1) {
                panel.classList.remove('is-open');
                return;
            }

            var results = index.filter(function (item) {
                var tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
                var haystack = normalize([item.title, item.region, item.year, item.genre, item.category, item.line, tags].join(' '));
                return haystack.indexOf(query) !== -1;
            }).slice(0, 12);

            if (!results.length) {
                var empty = document.createElement('div');
                empty.className = 'search-empty';
                empty.textContent = '没有匹配内容';
                panel.appendChild(empty);
            } else {
                results.forEach(function (item) {
                    panel.appendChild(buildResult(item));
                });
            }

            panel.classList.add('is-open');
        });

        input.addEventListener('focus', function () {
            if (input.value.trim()) {
                panel.classList.add('is-open');
            }
        });

        document.addEventListener('click', function (event) {
            if (!shell.contains(event.target)) {
                panel.classList.remove('is-open');
            }
        });
    });

    document.querySelectorAll('[data-local-filter]').forEach(function (filter) {
        var input = filter.querySelector('[data-filter-text]');
        var region = filter.querySelector('[data-filter-region]');
        var year = filter.querySelector('[data-filter-year]');
        var grid = document.querySelector('[data-filter-grid]');

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.children);

        function apply() {
            var query = normalize(input ? input.value : '');
            var selectedRegion = region ? region.value : '';
            var selectedYear = year ? year.value : '';

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchText = !query || haystack.indexOf(query) !== -1;
                var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                card.classList.toggle('is-hidden', !(matchText && matchRegion && matchYear));
            });
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();
