(function(){
  var toggle=document.querySelector('[data-menu-toggle]');
  var mobile=document.querySelector('[data-mobile-nav]');
  if(toggle&&mobile){toggle.addEventListener('click',function(){mobile.classList.toggle('open')})}
  document.querySelectorAll('[data-global-search]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var input=form.querySelector('input[name="q"]');
      var q=input?input.value.trim():'';
      var prefix=form.getAttribute('data-search-prefix')||'';
      location.href=prefix+'search.html'+(q?'?q='+encodeURIComponent(q):'');
    });
  });
  document.querySelectorAll('.hero').forEach(function(hero){
    var slides=[].slice.call(hero.querySelectorAll('.hero-slide'));
    var dots=[].slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev=hero.querySelector('[data-hero-prev]');
    var next=hero.querySelector('[data-hero-next]');
    if(!slides.length)return;
    var index=0;
    var timer=null;
    function show(n){
      index=(n+slides.length)%slides.length;
      slides.forEach(function(s,i){s.classList.toggle('active',i===index)});
      dots.forEach(function(d,i){d.classList.toggle('active',i===index)});
    }
    function move(step){show(index+step)}
    if(prev)prev.addEventListener('click',function(){move(-1);restart()});
    if(next)next.addEventListener('click',function(){move(1);restart()});
    dots.forEach(function(dot,i){dot.addEventListener('click',function(){show(i);restart()})});
    function restart(){if(timer)clearInterval(timer);timer=setInterval(function(){move(1)},5000)}
    show(0);restart();
  });
  document.querySelectorAll('.js-filter-form').forEach(function(form){
    var scope=form.closest('main')||document;
    var cards=[].slice.call(scope.querySelectorAll('.movie-card'));
    var page=new URLSearchParams(location.search);
    var qInput=form.querySelector('[name="q"]');
    if(qInput&&page.get('q'))qInput.value=page.get('q');
    function apply(){
      var q=(form.querySelector('[name="q"]')||{}).value||'';
      var region=(form.querySelector('[name="region"]')||{}).value||'';
      var year=(form.querySelector('[name="year"]')||{}).value||'';
      var genre=(form.querySelector('[name="genre"]')||{}).value||'';
      q=q.trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var text=((card.dataset.title||'')+' '+(card.dataset.tags||'')+' '+card.textContent).toLowerCase();
        var ok=(!q||text.indexOf(q)>-1)&&(!region||card.dataset.region===region)&&(!year||card.dataset.year===year)&&(!genre||(card.dataset.genre||'').indexOf(genre)>-1||(card.dataset.tags||'').indexOf(genre)>-1);
        card.style.display=ok?'':'none';
        if(ok)shown++;
      });
      scope.classList.toggle('is-empty',shown===0);
    }
    form.addEventListener('input',apply);
    form.addEventListener('change',apply);
    apply();
  });
})();