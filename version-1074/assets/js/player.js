import { H as Hls } from "./hls.js";

export function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var trigger = document.getElementById(options.triggerId);
    var loaded = false;
    var hls = null;

    if (!video || !trigger || !options.source) {
        return;
    }

    function attachSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(options.source);
            hls.attachMedia(video);
            return;
        }

        video.src = options.source;
    }

    function startPlayback() {
        attachSource();
        trigger.classList.add("is-hidden");
        video.classList.add("is-active");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    trigger.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!loaded) {
            startPlayback();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
