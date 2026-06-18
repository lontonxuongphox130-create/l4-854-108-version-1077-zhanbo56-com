import { H as Hls } from './hls.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attach() {
        if (!video || !stream) {
            return;
        }

        if (!attached) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            attached = true;
        }

        player.classList.add('is-playing');
        if (overlay) {
            overlay.setAttribute('aria-hidden', 'true');
        }
        video.play().catch(function () {});
    }

    if (overlay) {
        overlay.addEventListener('click', attach);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!attached) {
                attach();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
});
