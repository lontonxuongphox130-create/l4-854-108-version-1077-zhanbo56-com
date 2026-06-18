(function(){
  document.addEventListener('DOMContentLoaded',function(){
    var video=document.querySelector('video[data-stream]');
    if(!video)return;
    var box=video.closest('.player-box');
    var button=document.querySelector('.play-cover');
    var stream=video.getAttribute('data-stream');
    var hls=null;
    function prepare(){
      if(video.dataset.ready)return;
      if(window.Hls&&window.Hls.isSupported()){
        hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
        hls.loadSource(stream);
        hls.attachMedia(video);
      }else if(video.canPlayType('application/vnd.apple.mpegurl')){
        video.src=stream;
      }
      video.dataset.ready='1';
      if(box)box.classList.add('is-ready');
    }
    function play(){
      prepare();
      var promise=video.play();
      if(promise&&promise.catch)promise.catch(function(){});
    }
    if(button)button.addEventListener('click',play);
    video.addEventListener('play',function(){if(box)box.classList.add('is-playing')});
    video.addEventListener('pause',function(){if(box)box.classList.remove('is-playing')});
    video.addEventListener('ended',function(){if(box)box.classList.remove('is-playing')});
    video.addEventListener('click',function(){if(video.paused){play()}else{video.pause()}});
    window.addEventListener('beforeunload',function(){if(hls&&hls.destroy)hls.destroy()});
  });
})();