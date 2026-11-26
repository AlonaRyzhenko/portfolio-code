// Site behaviour, shared by every page. Ported from the approved single-file draft.
(() => {
  const root = document.documentElement, bar = document.getElementById('bar');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Mark touch use, so hover colours do not stick after a tap (see html.touch in the styles).
  addEventListener('touchstart', () => document.documentElement.classList.add('touch'), { once: true, passive: true });
  addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') document.documentElement.classList.remove('touch'); }, { passive: true });
  // Loading screen. Counts to 100 over at least 1.1s, waits for fonts and the page, then slides away. Never longer than 3s.
  (() => {
    const el = document.getElementById('loader'); if (!el) return;
    // Once per visit: later pages in the same tab open straight away.
    if (document.documentElement.classList.contains('no-loader')) { el.remove(); document.documentElement.classList.remove('loading'); return; }
    const num = document.getElementById('loader-count'), bar = document.getElementById('loader-bar'), root = document.documentElement;
    root.classList.add('loading'); el.style.animation = 'none';
    // The sequence (name and counter) starts only once the page has loaded and is being drawn,
    // so it plays on screen even where the page loads behind a spinner (Claude app, slow phones).
    const MIN = reduced ? 300 : 1100, MAX = 3000;
    let t0 = 0;
    let ready = false, shown = 0, closed = false;
    Promise.all([document.fonts.ready, new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))]).then(() => { ready = true; });
    const ease = t => 1 - Math.pow(1 - t, 3);
    const close = () => {
      if (closed) return; closed = true;
      el.classList.add('done'); root.classList.remove('loading');
      try { sessionStorage.setItem('ar-seen', '1'); } catch (e) {}
      setTimeout(() => el.classList.add('gone'), reduced ? 320 : 850);
    };
    const tick = now => {
      const time = now - t0, goal = ready || time > MAX ? 100 : 90;
      const target = Math.min(goal, Math.round(ease(Math.min(time / MIN, 1)) * goal));
      if (target > shown) shown = target;
      num.textContent = shown; bar.style.transform = `scaleX(${shown / 100})`;
      if (shown >= 100 && time >= MIN) { setTimeout(close, 150); return; }
      requestAnimationFrame(tick);
    };
    const begin = () => {
      if (t0) return;
      t0 = -1;
      requestAnimationFrame(() => requestAnimationFrame(now => { t0 = now; el.classList.add('go'); requestAnimationFrame(tick); }));
    };
    if (document.readyState === 'complete') begin(); else addEventListener('load', begin, { once: true });
    setTimeout(begin, 4000);
  })();

  // Scroll bar: slides in once the hero has scrolled past, and slides back out above it.
  const heroEl = document.querySelector('.hero');
  const headEl = heroEl || document.querySelector('.case-head');
  const onScroll = () => { if (headEl) bar.classList.toggle('on', headEl.getBoundingClientRect().bottom <= 64); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  root.lang = 'en';

  // Theme: light by default.
  const syncTheme = () => {
    const dark = root.getAttribute('data-ar-theme') === 'dark';
    document.querySelectorAll('.theme').forEach(b => {
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.querySelector('use').setAttribute('href', dark ? '#sun-light' : '#half-moon');
    });
    document.querySelectorAll('.m-theme-text').forEach(t => { t.textContent = dark ? 'Light theme' : 'Dark theme'; });
  };
  document.querySelectorAll('.theme').forEach(b => b.addEventListener('click', () => {
    const next = root.getAttribute('data-ar-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-ar-theme', next); try { localStorage.setItem('ar-theme', next); } catch (e) {}
    syncTheme(); colors(); draw();
  }));
  syncTheme();

  // Phone menu: one panel shared by the top nav and the scroll bar. The icon turns into a close mark and the page stops scrolling.
  const mMenu = document.getElementById('m-menu'), menuBtns = [...document.querySelectorAll('.menu-btn')];
  const setMenu = open => {
    mMenu.classList.toggle('open', open); mMenu.inert = !open; mMenu.setAttribute('aria-hidden', String(!open));
    menuBtns.forEach(b => {
      b.setAttribute('aria-expanded', String(open)); b.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      b.querySelector('use').setAttribute('href', open ? '#xmark' : '#menu');
    });
    document.documentElement.classList.toggle('menu-open', open);
  };
  const closeMenus = () => { if (mMenu.classList.contains('open')) setMenu(false); };
  menuBtns.forEach(b => b.addEventListener('click', () => setMenu(!mMenu.classList.contains('open'))));
  mMenu.querySelectorAll('a, .m-actions button').forEach(a => a.addEventListener('click', closeMenus));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });
  addEventListener('resize', () => { if (innerWidth > 860) closeMenus(); });

  // Needles.
  const SPEED = 90, CURVE = 1.5, PASS = .24, canvas = document.getElementById('c'), ctx = canvas && canvas.getContext('2d');
  let sub = null, W = 0, H = 0, fx = 0, fy = 0, up = 0, down = 0, rgb = '10,132,255', list = [], paused = reduced, visible = true, last = 0, raf = 0;
  const R = (a, b) => a + Math.random() * (b - a), clamp = v => Math.min(1, Math.max(0, v));
  const pathY = (u, x) => x >= fx ? fy : fy + u * (u < 0 ? up : down) * Math.pow((fx - x) / fx, CURVE);
  const entry = u => { const reach = Math.abs(u) * (u < 0 ? up : down), room = (u < 0 ? fy : H - fy) + 24; return reach <= room ? -24 : fx * (1 - Math.pow(room / reach, 1 / CURVE)); };
  const make = (n, any) => { n.u = R(-1, 1); n.len = R(10, 17); n.w = R(.9, 1.5); n.pass = Math.random() < PASS; n.end = n.pass ? W + 30 : fx + R(-30, 110); n.start = entry(n.u); n.x = any ? R(n.start, n.end) : n.start; return n; };
  function colors() { if (!canvas) return; const h = getComputedStyle(root).getPropertyValue('--decoration').trim(); rgb = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); }
  function size() {
    if (!canvas || !canvas.offsetWidth) return;
    const b = canvas.parentElement.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = b.width; H = b.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const hd = document.querySelector('.hero h1').getBoundingClientRect(), sb = document.querySelector('.hero .subtitle').getBoundingClientRect();
    fx = W * .4; fy = (hd.bottom + sb.top) / 2 - b.top; up = H * 1.3; down = H * 1.15;
    // On phones and tablets the dashes fade out before they reach the subtitle, so they never cross the text.
    sub = innerWidth <= 860 ? { l: sb.left - b.left - 10, r: sb.right - b.left + 10, t: sb.top - b.top - 8, b: sb.bottom - b.top + 8 } : null;
    list = Array.from({ length: Math.round(Math.min(160, Math.max(36, W * H / 13000))) }, () => make({}, true));
  }
  function draw() {
    if (!canvas) return;
    ctx.clearRect(0, 0, W, H);
    for (const n of list) {
      const y = pathY(n.u, n.x), a = Math.atan2(pathY(n.u, n.x + 1) - y, 1);
      let al = clamp((n.x - n.start) / 40) * clamp((n.end - n.x) / 60);
      if (sub) { const dx = Math.max(sub.l - n.x, 0, n.x - sub.r), dy = Math.max(sub.t - y, 0, y - sub.b); al *= clamp(Math.hypot(dx, dy) / 18); }
      if (al <= .01) continue;
      const tx = n.x - Math.cos(a) * n.len, ty = y - Math.sin(a) * n.len, nx = -Math.sin(a) * n.w / 2, ny = Math.cos(a) * n.w / 2;
      const g = ctx.createLinearGradient(tx, ty, n.x, y); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${al})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(n.x + nx, y + ny); ctx.lineTo(n.x - nx, y - ny); ctx.closePath(); ctx.fill();
    }
  }
  function frame(now) {
    raf = 0;
    if (!canvas || paused || !visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    for (const n of list) { const s = pathY(n.u, n.x + 1) - pathY(n.u, n.x); n.x += SPEED * dt / Math.sqrt(1 + s * s); if (n.x >= n.end) make(n, false); }
    draw(); raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', kick);
  if (canvas) {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; kick(); }).observe(canvas);
    new ResizeObserver(() => { size(); draw(); }).observe(canvas.parentElement);
  }

  // Soft diagonal bands of light with film grain. The AI-native card plays it; the footer shows a still frame.
  // pal: base, then the two peak colours of the light. Defaults to the site blue.
  function startFlow(c, still, scale, frame = 4, pal = [[.114, .263, .412], [.153, .392, .561], [.173, .463, .659]]) {
    const gl = c && c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { if (c) c.hidden = true; return; }
    const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, `#ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      uniform vec2 r; uniform float t, s; uniform vec3 k0, k1, k2;
      // Hash kept to small numbers, so low precision GPUs do not turn it into streaks.
      float noise(vec2 p){p=mod(p,256.);vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
      void main(){
        vec2 uv=gl_FragCoord.xy/r; uv.x*=r.x/r.y; uv*=s;
        float x=dot(uv,vec2(.62,.78));
        x+=.10*sin(uv.y*2.6+t*.55)+.05*sin(uv.x*4.3-t*.8);
        float a=pow(.5+.5*sin(x*6.5-t*1.05),3.);
        float b=pow(.5+.5*sin(x*11.-t*.7+1.7),6.);
        float v=clamp(a*.95+b*.45,0.,1.);
        vec3 peak=mix(k1,k2,smoothstep(.56,.8,gl_FragCoord.y/r.y));
        vec3 col=mix(k0,peak,v);
        col+=(noise(gl_FragCoord.xy+fract(t)*37.)-.5)*.055;
        gl_FragColor=vec4(col,1.);
      }`));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't');
    gl.uniform1f(gl.getUniformLocation(prog, 's'), scale);
    ['k0', 'k1', 'k2'].forEach((k, i) => gl.uniform3fv(gl.getUniformLocation(prog, k), pal[i]));
    const frozen = still || reduced;
    let shown = false, raf = 0;
    const paint = time => { gl.uniform1f(uT, time); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const resize = () => {
      const q = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, still ? 2 : 1.5);
      if (!q.width) return;
      c.width = q.width * d; c.height = q.height * d; gl.viewport(0, 0, c.width, c.height); gl.uniform2f(uR, c.width, c.height);
      if (frozen || !shown) paint(frame);
    };
    const loop = now => { raf = 0; if (!shown) return; paint(now / 1000); raf = requestAnimationFrame(loop); };
    new ResizeObserver(resize).observe(c);
    resize();
    if (!frozen) new IntersectionObserver(e => { shown = e[0].isIntersecting; if (shown && !raf) raf = requestAnimationFrame(loop); }).observe(c);
  }
  startFlow(document.getElementById('flow'), false, 1);
  startFlow(document.getElementById('flow-foot'), true, .55, 4.6);

  // Arriving at a section from another page (for example /#work): settle it below the fixed bar.
  if (location.hash.length > 1) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) { const go = () => scrollTo({ top: Math.max(0, scrollY + t.getBoundingClientRect().top - 88), behavior: 'instant' }); requestAnimationFrame(go); addEventListener('load', go, { once: true }); }
  }
  // View case pill trails the cursor over each frame, with a soft lag, and stays inside it.
  if (!reduced && matchMedia('(hover: hover)').matches) document.querySelectorAll('.stage').forEach(stage => {
    const tip = stage.querySelector('.view-tip'); if (!tip) return; let x = 0, y = 0, tx = 0, ty = 0, raf = 0, leave = 0;
    const set = e => {
      const r = stage.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, pad = 8;
      tx = Math.max(pad, Math.min(r.width - w - pad, e.clientX - r.left - w / 2));
      ty = Math.max(pad, Math.min(r.height - h - pad, e.clientY - r.top - h / 2));
    };
    const tick = () => {
      x += (tx - x) * .18; y += (ty - y) * .18;
      tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .2 ? requestAnimationFrame(tick) : 0;
    };
    stage.addEventListener('pointerenter', e => {
      clearTimeout(leave); tip.classList.add('follow'); set(e); x = tx; y = ty;
      tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    stage.addEventListener('pointermove', e => { set(e); if (!raf) raf = requestAnimationFrame(tick); });
    stage.addEventListener('pointerleave', () => {
      leave = setTimeout(() => { cancelAnimationFrame(raf); raf = 0; tip.classList.remove('follow'); tip.style.transform = ''; }, 180);
    });
  });
  // View more and View less: the grid eases to its new height while the card fades, and on closing the button holds its place.
  const EASE = 'cubic-bezier(.4, 0, .2, 1)', OPEN_MS = 420;
  let moreAnims = [], stopGlide = () => {};
  // Glides the page to a position, and lets go as soon as the viewer scrolls.
  function glide(top, ms, soft) {
    stopGlide();
    const start = scrollY, t0 = performance.now(); let raf = 0;
    // soft: a gentler sine curve for long trips, such as back to the top.
    const ease = soft ? t => -(Math.cos(Math.PI * t) - 1) / 2 : t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const stop = stopGlide = () => { cancelAnimationFrame(raf); removeEventListener('wheel', stop); removeEventListener('touchstart', stop); stopGlide = () => {}; };
    addEventListener('wheel', stop, { passive: true }); addEventListener('touchstart', stop, { passive: true });
    const step = now => {
      const t = Math.min((now - t0) / ms, 1);
      scrollTo({ top: start + (top - start) * ease(t), behavior: 'instant' });
      if (t < 1) raf = requestAnimationFrame(step); else stop();
    };
    raf = requestAnimationFrame(step);
  }
  // Copy email: the icon crossfades to a check mark and "Copied" fades in, then both ease back after 2 seconds.
  document.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const note = btn.parentElement.querySelector('.copy-note');
    let ok = false;
    try { await navigator.clipboard.writeText(btn.dataset.copy); ok = true; } catch {
      try { const t = document.createElement('textarea'); t.value = btn.dataset.copy; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch {}
    }
    note.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
    btn.classList.toggle('copied', ok); note.classList.add('on');
    clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove('copied'); note.classList.remove('on'); }, 2000);
  }));
  // Nav links glide to their section. The longer the trip, the longer the glide, up to 1.1s.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !a.closest('#bar, #top, .hero, .m-menu') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = a.getAttribute('href').slice(1), el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const max = document.documentElement.scrollHeight - innerHeight;
    const top = id === 'top' ? 0 : Math.max(0, Math.min(max, scrollY + el.getBoundingClientRect().top - 88));
    if (reduced) { stopGlide(); scrollTo({ top, behavior: 'instant' }); }
    else if (id === 'top') glide(top, Math.min(1500, 700 + scrollY * .1), true);
    else glide(top, Math.min(1100, 600 + Math.abs(top - scrollY) * .12));
    try { history.pushState(null, '', '#' + id); } catch {}
    if (id !== 'top') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  });

  // Section 02 problem panels: each fixed-size stage scales to its panel, and the loops only run while on screen.
  document.querySelectorAll('.p02').forEach(box => {
    const fit = () => box.querySelectorAll('.p').forEach(p => { p.querySelector('.stg').style.transform = `scale(${p.clientWidth / 542})`; });
    new ResizeObserver(fit).observe(box); fit();
    if ('IntersectionObserver' in window) new IntersectionObserver(e => box.classList.toggle('on', e[0].isIntersecting)).observe(box); else box.classList.add('on');
  });

  document.querySelectorAll('.v06f').forEach(fr => { if ('IntersectionObserver' in window) new IntersectionObserver(e => { try { fr.contentWindow.postMessage({ v06: e[0].isIntersecting }, '*'); } catch (x) {} }).observe(fr); });
  // Section 05 error motion runs only while on screen.
  document.querySelectorAll('.p05f').forEach(fr => { if ('IntersectionObserver' in window) new IntersectionObserver(e => { try { fr.contentWindow.postMessage({ p05: e[0].isIntersecting, p06: e[0].isIntersecting, p07: e[0].isIntersecting }, '*'); } catch (x) {} }).observe(fr); });
  // Section 08 notes: smooth open and close for the show/hide toggles.
  document.querySelectorAll('.s08d').forEach(d => {
    const sm = d.querySelector('summary'), body = d.querySelector('.s08n'); let anim = null;
    sm.addEventListener('click', e => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      if (anim) anim.cancel();
      const opening = !d.open;
      if (opening) d.open = true;
      const h = body.scrollHeight;
      anim = body.animate(opening
        ? [{ height: '0px', opacity: 0, marginTop: '0px', transform: 'translateY(-4px)' }, { height: h + 'px', opacity: 1, marginTop: '14px', transform: 'none' }]
        : [{ height: h + 'px', opacity: 1, marginTop: '14px', transform: 'none' }, { height: '0px', opacity: 0, marginTop: '0px', transform: 'translateY(-4px)' }],
        { duration: opening ? 320 : 240, easing: 'cubic-bezier(.2, .7, .2, 1)' });
      body.style.overflow = 'hidden';
      anim.onfinish = () => { if (!opening) d.open = false; body.style.overflow = ''; anim = null; };
    });
  });
  // Phone only: tap a case visual (screenshot, motion or panel) to open it larger. It zooms out of its place and back.
  (() => {
    const phone = matchMedia('(max-width: 860px)'), still = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => [
      ...document.querySelectorAll('#secure-messenger .cs-panel img.cs-shot, #secure-messenger .cs-panel iframe, #identity-app .cs-panel img.cs-art, #defentry .cs-panel img.cs-art, #defentry .cs-panel img.cs-shot, #hr-platform .cs-panel img.cs-shot, #hr-platform .cs-panel img.cs-art, #hr-platform .cs-panel .crm-m, #defentry .cs-panel .r5w, #defentry .cs-panel .r7w, #identity-app iframe.v06f')
    ].filter(el => getComputedStyle(el).display !== 'none');
    const natural = el => (el.classList.contains('r5w') || el.classList.contains('r7w')) ? 1100 : el.tagName === 'IFRAME' ? (el.classList.contains('v06f') ? 1378 : 1440) : el.classList.contains('p') ? 542 : Math.min(el.naturalWidth / 2 || 900, 1100);
    let open = null;
    const close = () => {
      if (!open) return;
      const { zm, inner, src, onKey, ph } = open; open = null;
      document.removeEventListener('keydown', onKey);
      const r = (ph || src).getBoundingClientRect(), q = inner.getBoundingClientRect(), k = r.width / q.width;
      zm.classList.remove('on');
      const done = () => { if (ph) { src.style.width = ''; ph.replaceWith(src); } zm.remove(); document.documentElement.style.overflow = ''; src.focus && src.focus({ preventScroll: true }); };
      if (still.matches) return done();
      inner.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${r.left - q.left}px, ${r.top - q.top}px) scale(${k})`, opacity: .6 }], { duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).onfinish = done;
    };
    const show = src => {
      if (!phone.matches || open) return;
      const zm = document.createElement('div'); zm.className = 'zm'; zm.setAttribute('role', 'dialog'); zm.setAttribute('aria-modal', 'true'); zm.setAttribute('aria-label', 'Enlarged visual');
      zm.innerHTML = '<div class="zm-sc"><div class="zm-in"></div></div><button class="zm-x" type="button" aria-label="Close"><svg width="18" height="18" viewBox="0 0 640 640" fill="none" stroke="currentColor" stroke-width="48" stroke-linecap="round"><path d="M184 184L456 456M456 184L184 456"/></svg></button><div class="zm-hint">Swipe to look around · tap outside to close</div>';
      const inner = zm.querySelector('.zm-in'), sc = zm.querySelector('.zm-sc');
      const vw = innerWidth - 32, ar = src.getBoundingClientRect().width / src.getBoundingClientRect().height, w = Math.max(vw, Math.min(natural(src), vw * 2, (innerHeight - 140) * ar));
      inner.style.width = w + 'px';
      let node, ph = null;
      if (src.tagName === 'IFRAME') { node = document.createElement('iframe'); node.src = src.src; node.title = src.title; node.style.aspectRatio = getComputedStyle(src).aspectRatio; node.style.width = w + 'px'; node.style.height = (w / (src.clientWidth / src.clientHeight)) + 'px'; }
      else if (src.classList.contains('r5w') || src.classList.contains('r7w')) { ph = document.createElement('div'); ph.style.cssText = 'width:100%;aspect-ratio:' + src.clientWidth + ' / ' + src.clientHeight; src.replaceWith(ph); node = src; node.style.width = w + 'px'; }
      else if (src.tagName === 'IMG') { node = src.cloneNode(); node.removeAttribute('loading'); }
      else { node = src.cloneNode(true); node.style.width = w + 'px'; node.style.aspectRatio = '542 / 460'; const st = node.querySelector('.stg'); if (st) st.style.transform = `scale(${w / 542})`; }
      inner.appendChild(node);
      if (src.classList.contains('p')) { const wrap = document.createElement('div'); wrap.className = 'p02 on'; wrap.style.display = 'block'; node.replaceWith(wrap); wrap.appendChild(node); }
      document.documentElement.style.overflow = 'hidden';
      document.body.appendChild(zm);
      if (node.tagName === 'IFRAME') node.addEventListener('load', () => { try { node.contentWindow.postMessage({ p05: true, p06: true, p07: true, v06: true }, '*'); } catch (e) {} });
      const onKey = e => { if (e.key === 'Escape') close(); };
      open = { zm, inner, src, onKey, ph };
      document.addEventListener('keydown', onKey);
      zm.querySelector('.zm-x').addEventListener('click', close);
      sc.addEventListener('click', e => { if (e.target === sc) close(); });
      requestAnimationFrame(() => {
        zm.classList.add('on');
        sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
        if (still.matches) return;
        const r = (ph || src).getBoundingClientRect(), q = inner.getBoundingClientRect(), k = r.width / q.width;
        inner.animate([{ transform: `translate(${r.left - q.left}px, ${r.top - q.top}px) scale(${k})`, opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2, .7, .2, 1)' });
        zm.querySelector('.zm-x').focus({ preventScroll: true });
      });
    };
    pick().forEach(el => {
      const hit = el.tagName === 'IFRAME' ? el.parentElement : el;
      hit.classList.add('zm-host');
      if (el.tagName === 'IFRAME') {
        const cover = document.createElement('button'); cover.type = 'button'; cover.className = 'zm-cover'; cover.setAttribute('aria-label', 'Open larger: ' + (el.title || 'visual'));
        hit.style.position = 'relative'; hit.appendChild(cover);
        cover.addEventListener('click', () => show(el));
      } else {
        el.addEventListener('click', () => show(el));
      }
    });
  })();
  // Scroll reveal: each block plays once as it enters. Blocks have no hidden resting state, so they stay visible without script.
  if (!reduced && 'IntersectionObserver' in window) {
    const seen = new WeakSet();
    const reveal = new IntersectionObserver(entries => entries.forEach(en => {
      const el = en.target, first = !seen.has(el); seen.add(el);
      if (first && en.isIntersecting) { reveal.unobserve(el); return; }
      if (!en.isIntersecting) return;
      reveal.unobserve(el);
      const delay = el.matches('.case') && [...el.parentElement.children].filter(c => !c.hidden).indexOf(el) % 2 ? 90 : 0;
      el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
    }));
    document.querySelectorAll('.section > :not(.cases):not(:has(.decisions)), .cases > .case, .block:has(.decisions) > h3, .decision, .contact-row > *').forEach(el => reveal.observe(el));
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { size(); draw(); });
  colors(); size(); draw(); kick();
})();
