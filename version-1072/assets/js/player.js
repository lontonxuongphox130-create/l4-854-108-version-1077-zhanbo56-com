(function () {
    function prepare(frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector(".play-overlay");
        var stream = video ? video.getAttribute("data-stream") : "";
        var hls = null;
        var ready = false;

        if (!video || !button || !stream) {
            return;
        }

        function bind() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function play() {
            bind();
            button.classList.add("is-hidden");
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll("[data-player]").forEach(prepare);
})();
