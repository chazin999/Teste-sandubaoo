/* ============================================================
   SANDUBÃO DELIVERY — PREMIUM UX LAYER (JS)
   Script 100% aditivo. Não redefine, não sobrescreve e não
   remove nenhuma função do sistema de pedidos original.
   Apenas observa o DOM e acrescenta classes/efeitos visuais.
   Carregar com <script defer src="sandubao-premium.js"></script>
   DEPOIS do script principal da página.
   ============================================================ */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- 0. LOADER ---------- */
  function hideLoader(){
    var loader = document.getElementById('premiumLoader');
    if(!loader) return;
    loader.classList.add('loader-hide');
    setTimeout(function(){ loader.remove(); }, 700);
  }
  window.addEventListener('load', function(){
    setTimeout(hideLoader, 550);
  });
  // segurança: nunca deixa o loader preso na tela
  setTimeout(hideLoader, 4000);

  /* ---------- 1. HERO: título letra por letra ---------- */
  function splitHeroTitle(){
    var h1 = document.querySelector('.hero h1');
    if(!h1 || h1.dataset.split) return;
    h1.dataset.split = '1';

    var lines = [];
    h1.childNodes.forEach(function(node){
      if(node.nodeType === 3 && node.textContent.trim()){
        lines.push({ text: node.textContent, tag:null });
      } else if(node.nodeType === 1){
        lines.push({ text: node.textContent, tag: node.tagName.toLowerCase() });
      }
    });

    h1.innerHTML = '';
    var globalIndex = 0;
    lines.forEach(function(line){
      var wrapper = document.createElement(line.tag === 'span' ? 'span' : 'span');
      wrapper.className = 'hline';
      if(line.tag === 'span'){ wrapper.style.color = 'var(--gold-bright)'; }
      line.text.split('').forEach(function(ch){
        var s = document.createElement('span');
        s.className = 'char-anim';
        s.style.animationDelay = (globalIndex * 0.032) + 's';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        wrapper.appendChild(s);
        globalIndex++;
      });
      h1.appendChild(wrapper);
      if(line.tag !== 'span'){ h1.appendChild(document.createElement('br')); }
    });
  }
  if(!reduceMotion) splitHeroTitle();

  /* ---------- 2. BOTÕES: ripple + magnetismo sutil ---------- */
  function addRipple(e){
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = ((e.clientX || rect.left + rect.width/2) - rect.left - size/2) + 'px';
    ripple.style.top = ((e.clientY || rect.top + rect.height/2) - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function(){ ripple.remove(); }, 650);
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.btn, .mi-select-btn, .modal-cart-btn, .cart-fab');
    if(btn){ addRipple.call(null, Object.assign(e, {currentTarget: btn})); }
  }, true);

  if(!isTouch){
    document.querySelectorAll('.btn-primary').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width/2) * 0.06;
        var my = (e.clientY - r.top - r.height/2) * 0.18;
        btn.style.transform = 'translate(' + mx + 'px,' + (my - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }

  /* ---------- 3. CTA pulsante nos botões de compra ---------- */
  ['#openOrderModalBtn', '#finalizeBtn'].forEach(function(sel){
    var el = document.querySelector(sel);
    if(el) el.classList.add('btn-cta-pulse');
  });
  document.addEventListener('DOMNodeInserted', function(e){
    if(e.target && e.target.id === 'finalizeBtn'){ e.target.classList.add('btn-cta-pulse'); }
  });

  /* ---------- 4. SCROLL REVEAL PREMIUM (variação por seção) ---------- */
  var variants = ['reveal-fade-up','reveal-fade-left','reveal-fade-right','reveal-zoom','reveal-scale','reveal-blur'];
  document.querySelectorAll('.reveal').forEach(function(el, i){
    el.classList.add(variants[i % variants.length]);
  });

  /* ---------- 5. CARDÁPIO: brilho seguindo o mouse ---------- */
  if(!isTouch){
    document.querySelectorAll('.menu-item-card, .combocard').forEach(bindGlow);
    var menuListObserver = new MutationObserver(function(){
      document.querySelectorAll('.menu-item-card:not([data-glow]), .combocard:not([data-glow])').forEach(bindGlow);
    });
    var menuListEl = document.getElementById('menuList');
    if(menuListEl) menuListObserver.observe(menuListEl, { childList:true, subtree:true });
  }
  function bindGlow(card){
    card.setAttribute('data-glow','1');
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- 6. HERO: parallax + rotação leve na foto ---------- */
  var heroVisual = document.querySelector('.hero-visual');
  var heroImg = document.querySelector('.hero-visual img');
  if(heroVisual && heroImg && !isTouch && !reduceMotion){
    var reflect = document.createElement('div');
    reflect.className = 'img-reflect';
    heroVisual.appendChild(reflect);

    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', function(e){
      var r = heroVisual.getBoundingClientRect();
      var cx = r.left + r.width/2, cy = r.top + r.height/2;
      targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth/2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight/2)));
    });
    (function raf(){
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      heroImg.style.setProperty('--px', (curX * 14) + 'px');
      heroImg.style.setProperty('--py', (curY * 10) + 'px');
      heroImg.style.marginLeft = (curX * 12) + 'px';
      heroImg.style.marginTop = (curY * 8) + 'px';
      requestAnimationFrame(raf);
    })();
  }

  /* ---------- 7. PARTÍCULAS DOURADAS FLUTUANDO (hero) ---------- */
  function spawnGoldParticles(){
    if(isTouch || reduceMotion) return;
    var hero = document.querySelector('.hero');
    if(!hero) return;
    var count = 14;
    for(var i=0;i<count;i++){
      var p = document.createElement('span');
      p.className = 'gold-particle';
      var size = 2 + Math.random()*3;
      p.style.width = p.style.height = size + 'px';
      p.style.left = (Math.random()*100) + '%';
      p.style.top = (40 + Math.random()*55) + '%';
      p.style.setProperty('--drift', (Math.random()*40-20) + 'px');
      p.style.animationDuration = (6 + Math.random()*6) + 's';
      p.style.animationDelay = (Math.random()*6) + 's';
      hero.appendChild(p);
    }
  }
  spawnGoldParticles();

  /* ---------- 8. PARTÍCULAS AMBIENTE DE FUNDO (canvas leve) ---------- */
  function setupAmbientParticles(){
    if(reduceMotion) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'premiumParticles';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W, H, dots = [];
    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = document.documentElement.scrollHeight;
    }
    function init(){
      dots = [];
      var count = Math.min(70, Math.floor(W / 26));
      for(var i=0;i<count;i++){
        dots.push({
          x: Math.random()*W, y: Math.random()*H,
          r: Math.random()*1.3 + 0.4,
          vy: -(Math.random()*0.12 + 0.03),
          o: Math.random()*0.3 + 0.08
        });
      }
    }
    var last = 0;
    function tick(ts){
      if(!last || ts - last > 33){
        last = ts;
        ctx.clearRect(0,0,W,H);
        for(var i=0;i<dots.length;i++){
          var d = dots[i];
          d.y += d.vy;
          if(d.y < -10){ d.y = H + 10; d.x = Math.random()*W; }
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(217,164,74,' + d.o + ')';
          ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    }
    resize(); init();
    requestAnimationFrame(tick);
    window.addEventListener('resize', function(){ resize(); init(); });
  }
  setupAmbientParticles();

  /* ---------- 9. COUNT UP nos preços ---------- */
  var CURRENCY_RE = /R\$\s?(\d{1,3}(?:\.\d{3})*),(\d{2})/g;

  function animateCountUp(el){
    if(el.dataset.counted) return;
    el.dataset.counted = '1';
    var original = el.textContent;
    var matches = [];
    var m;
    CURRENCY_RE.lastIndex = 0;
    while((m = CURRENCY_RE.exec(original)) !== null){
      matches.push({ full:m[0], value: parseFloat(m[1].replace(/\./g,'') + '.' + m[2]), index:m.index });
    }
    if(matches.length === 0) return;

    if(reduceMotion){ return; } // mantém o texto original, sem contagem

    // envolve cada valor monetário em um span animável, preservando o resto do texto
    var html = '';
    var cursor = 0;
    matches.forEach(function(mt, i){
      html += original.slice(cursor, mt.index);
      html += '<span class="price-counting" data-target="' + mt.value + '">R$ 0,00</span>';
      cursor = mt.index + mt.full.length;
    });
    html += original.slice(cursor);
    el.innerHTML = html;

    var spans = el.querySelectorAll('.price-counting');
    spans.forEach(function(span, i){
      var target = parseFloat(span.getAttribute('data-target'));
      var duration = 900;
      var startTime = null;
      function fmt(v){
        return 'R$ ' + v.toFixed(2).replace('.', ',');
      }
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        span.textContent = fmt(target * eased);
        if(progress < 1){ requestAnimationFrame(step); }
        else { span.textContent = fmt(target); span.classList.remove('price-counting'); }
      }
      setTimeout(function(){ requestAnimationFrame(step); }, i * 60);
    });
  }

  var priceSelectors = '.mprice, .cprice, .fp, .order-price, .feature-price, .order-total-val, .nb-price, .ap';
  var priceObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        animateCountUp(entry.target);
        priceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  function observePrices(root){
    (root || document).querySelectorAll(priceSelectors).forEach(function(el){
      if(!el.dataset.counted) priceObserver.observe(el);
    });
  }
  observePrices();

  // observa preços renderizados dinamicamente dentro do modal (detalhe, carrinho, checkout)
  var modalBox = document.getElementById('modalBox');
  if(modalBox){
    var modalObserver = new MutationObserver(function(){ observePrices(modalBox); });
    modalObserver.observe(modalBox, { childList:true, subtree:true });
  }

  /* ---------- 10. CARRINHO: bounce + partículas ao adicionar/alterar ---------- */
  function burstParticles(target){
    if(isTouch || reduceMotion) return;
    var r = target.getBoundingClientRect();
    for(var i=0;i<8;i++){
      var p = document.createElement('span');
      p.className = 'cart-particle';
      var angle = Math.random() * Math.PI * 2;
      var dist = 30 + Math.random()*30;
      p.style.left = (r.left + r.width/2) + 'px';
      p.style.top = (r.top + r.height/2) + 'px';
      p.style.setProperty('--px', Math.cos(angle)*dist + 'px');
      p.style.setProperty('--py', Math.sin(angle)*dist - 20 + 'px');
      document.body.appendChild(p);
      (function(el){ setTimeout(function(){ el.remove(); }, 720); })(p);
    }
  }

  function bump(el){
    if(!el || reduceMotion) return;
    el.classList.remove('bump');
    // força reflow para permitir reanimar
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function watchBadge(id){
    var el = document.getElementById(id);
    if(!el) return;
    var lastVal = el.textContent;
    var obs = new MutationObserver(function(){
      var newVal = el.textContent;
      if(newVal !== lastVal){
        var increased = parseInt(newVal || '0', 10) > parseInt(lastVal || '0', 10);
        bump(el);
        if(id === 'cartFabBadge'){
          var fab = document.getElementById('cartFab');
          bump(fab && fab.classList ? fab : null);
          if(fab) fab.classList.add('bump');
          if(increased && fab) burstParticles(fab);
        }
        lastVal = newVal;
      }
    });
    obs.observe(el, { childList:true, characterData:true, subtree:true });
  }
  watchBadge('cartFabBadge');
  watchBadge('modalCartBadge');

  // anima o valor de quantidade no detalhe do produto (#detailQtyVal)
  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'detailQtyPlus' || e.target && e.target.id === 'detailQtyMinus'){
      setTimeout(function(){
        var qtyVal = document.getElementById('detailQtyVal');
        if(qtyVal) bump(qtyVal.classList ? Object.assign(qtyVal, {classList: qtyVal.classList}) : qtyVal);
        if(qtyVal){ qtyVal.classList.add('qty-val'); bump(qtyVal); }
      }, 10);
    }
  });

})();
