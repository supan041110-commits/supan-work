/* 苏攀 Pan Su · 作品集公共脚本（无依赖，失败不影响静态内容） */
(function(){
  "use strict";
  try{
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* 导航滚动状态 */
    var nav = document.getElementById('nav');
    function onScrollNav(){ if(nav) nav.classList.toggle('scrolled',(window.scrollY||window.pageYOffset)>30); }
    onScrollNav();

    /* Hero 视差 */
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
    var ticking = false;
    function renderParallax(){
      var y = window.scrollY || window.pageYOffset;
      var scale = isMobile ? 0.45 : 1;
      for(var i=0;i<layers.length;i++){
        var speed = parseFloat(layers[i].getAttribute('data-speed')) * scale;
        layers[i].style.transform = 'translate3d(0,' + (y*speed).toFixed(2) + 'px,0)';
      }
      ticking = false;
    }
    function requestTick(){ if(!ticking){ window.requestAnimationFrame(renderParallax); ticking = true; } }

    /* 进入视口动效 */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if('IntersectionObserver' in window && !reduceMotion){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            en.target.style.transitionDelay = (Math.min((en.target.dataset.d||0),6)*0.07)+'s';
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
      reveals.forEach(function(el,idx){ el.dataset.d = (idx % 4); io.observe(el); });
    }else{
      reveals.forEach(function(el){ el.classList.add('in'); });
    }

    if(!reduceMotion && layers.length){
      window.addEventListener('scroll',function(){ onScrollNav(); requestTick(); },{passive:true});
      renderParallax();
    }else{
      window.addEventListener('scroll',onScrollNav,{passive:true});
    }

    /* 平滑锚点（固定导航偏移） */
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(a){
      a.addEventListener('click',function(e){
        var id = a.getAttribute('href');
        if(id.length < 2) return;
        var target = document.querySelector(id);
        if(!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + (window.scrollY||window.pageYOffset) - 76;
        window.scrollTo({top:top,behavior:reduceMotion?'auto':'smooth'});
      });
    });

    /* 邮箱点击复制 */
    var copyBtn = document.querySelector('[data-copy]');
    var tip = document.getElementById('copyTip');
    if(copyBtn && tip){
      copyBtn.addEventListener('click',function(){
        var email = copyBtn.getAttribute('data-copy');
        function done(){ tip.textContent = '✓ 邮箱已复制：'+email; }
        function fallback(){
          try{
            var ta=document.createElement('textarea');
            ta.value=email; ta.style.position='fixed'; ta.style.opacity='0';
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta); done();
          }catch(err){ tip.textContent='邮箱：'+email; }
        }
        try{
          if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(email).then(done).catch(fallback); }
          else{ fallback(); }
        }catch(e){ fallback(); }
      });
    }

    /* 图片灯箱 */
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label','查看大图，点击关闭');
    var boxImg = document.createElement('img');
    box.appendChild(boxImg);
    document.body.appendChild(box);
    function closeBox(){ box.classList.remove('open'); boxImg.removeAttribute('src'); }
    box.addEventListener('click',closeBox);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeBox(); });
    Array.prototype.forEach.call(document.querySelectorAll('.zoomable'),function(img){
      img.setAttribute('tabindex','0');
      img.setAttribute('alt', img.getAttribute('alt') || '点击放大查看');
      function open(){ boxImg.src = img.currentSrc || img.src; boxImg.alt = img.alt; box.classList.add('open'); }
      img.addEventListener('click',open);
      img.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
    });

    /* 详情页目录高亮 */
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.case-toc a'));
    var secs = tocLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    if(tocLinks.length && 'IntersectionObserver' in window){
      var spy = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            tocLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+en.target.id); });
          }
        });
      },{rootMargin:'-30% 0px -60% 0px'});
      secs.forEach(function(s){ spy.observe(s); });
    }

    /* 外链安全属性 */
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="http"]'),function(a){
      a.setAttribute('target','_blank');
      a.setAttribute('rel','noopener noreferrer');
    });
  }catch(err){
    /* 静默降级，保证内容可读 */
  }
})();
