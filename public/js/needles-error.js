
// Error pages: the same needles as the homepage hero, converging between "404" and the title, or between the title and the text.
document.querySelectorAll('.err-c').forEach(canvas => {
  const ctx = canvas.getContext('2d'), root = document.documentElement, head = canvas.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 90, CURVE = 1.5, PASS = .24;
  let W = 0, H = 0, fx = 0, fy = 0, up = 0, down = 0, list = [], last = 0, raf = 0, visible = false;
  const R = (a, b) => a + Math.random() * (b - a), clamp = v => Math.min(1, Math.max(0, v));
  const rgb = () => { const h = getComputedStyle(root).getPropertyValue('--decoration').trim() || '#0a84ff'; return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','); };
  const pathY = (u, x) => x >= fx ? fy : fy + u * (u < 0 ? up : down) * Math.pow((fx - x) / fx, CURVE);
  const entry = u => { const reach = Math.abs(u) * (u < 0 ? up : down), room = (u < 0 ? fy : H - fy) + 24; return reach <= room ? -24 : fx * (1 - Math.pow(room / reach, 1 / CURVE)); };
  const make = (n, any) => { n.u = R(-1, 1); n.len = R(10, 17); n.w = R(.9, 1.5); n.pass = Math.random() < PASS; n.end = n.pass ? W + 30 : fx + R(-30, 110); n.start = entry(n.u); n.x = any ? R(n.start, n.end) : n.start; return n; };
  function size() {
    if (!canvas.offsetWidth) return;
    const b = head.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = b.width; H = b.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const num = head.querySelector('.err-num'), t = head.querySelector('h1').getBoundingClientRect(), sub = head.querySelector('.subtitle').getBoundingClientRect();
    fx = W * .4; fy = (num ? (num.getBoundingClientRect().bottom + t.top) / 2 : (t.bottom + sub.top) / 2) - b.top; up = H * 1.3; down = H * 1.15;
    list = Array.from({ length: Math.round(Math.min(160, Math.max(36, W * H / 13000))) }, () => make({}, true));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H); const c = rgb();
    for (const n of list) {
      const y = pathY(n.u, n.x), a = Math.atan2(pathY(n.u, n.x + 1) - y, 1), al = clamp((n.x - n.start) / 40) * clamp((n.end - n.x) / 60);
      if (al <= 0) continue;
      const tx = n.x - Math.cos(a) * n.len, ty = y - Math.sin(a) * n.len, nx = -Math.sin(a) * n.w / 2, ny = Math.cos(a) * n.w / 2;
      const g = ctx.createLinearGradient(tx, ty, n.x, y); g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},${al})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(n.x + nx, y + ny); ctx.lineTo(n.x - nx, y - ny); ctx.closePath(); ctx.fill();
    }
  }
  function frame(now) {
    raf = 0;
    if (reduced || !visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    for (const n of list) { const s = pathY(n.u, n.x + 1) - pathY(n.u, n.x); n.x += SPEED * dt / Math.sqrt(1 + s * s); if (n.x >= n.end) make(n, false); }
    draw(); raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', kick);
  new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) { size(); draw(); } kick(); }).observe(canvas);
  new ResizeObserver(() => { size(); draw(); }).observe(head);
  new MutationObserver(() => draw()).observe(root, { attributes: true, attributeFilter: ['data-ar-theme'] });
});
