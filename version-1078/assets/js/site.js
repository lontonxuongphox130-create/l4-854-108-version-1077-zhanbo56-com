(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var shell = document.querySelector("[data-hero-carousel]");
        if (!shell) {
            return;
        }
        var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var year = document.querySelector("[data-filter-year]");
        var type = document.querySelector("[data-filter-type]");
        var genre = document.querySelector("[data-filter-genre]");
        var category = document.querySelector("[data-filter-category]");
        var empty = document.querySelector("[data-empty-state]");
        function value(el) {
            return el ? String(el.value || "").trim().toLowerCase() : "";
        }
        function apply() {
            var q = value(input);
            var y = value(year);
            var t = value(type);
            var g = value(genre);
            var c = value(category);
            var shown = 0;
            cards.forEach(function (card) {
                var text = String(card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = String(card.getAttribute("data-year") || "").toLowerCase();
                var cardType = String(card.getAttribute("data-type") || "").toLowerCase();
                var cardGenre = String(card.getAttribute("data-genre") || "").toLowerCase();
                var cardCategory = String(card.getAttribute("data-category") || "").toLowerCase();
                var visible = true;
                if (q && text.indexOf(q) === -1) {
                    visible = false;
                }
                if (y && cardYear !== y) {
                    visible = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    visible = false;
                }
                if (g && cardGenre.indexOf(g) === -1 && text.indexOf(g) === -1) {
                    visible = false;
                }
                if (c && cardCategory !== c) {
                    visible = false;
                }
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        [input, year, type, genre, category].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener("input", apply);
            el.addEventListener("change", apply);
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !overlay || !source) {
            return;
        }
        var started = false;
        var hls = null;
        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
