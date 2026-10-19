// Стая: частицы-скворцы летят по полю течения, от прокрутки стягиваются в слово «АТЛАНТ».
(() => {
  const sec = document.querySelector('.flock'); if (!sec) return;
  const cv = sec.querySelector('.flock__cv'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  let W = 0, H = 0, dpr = 1, P = [], p = reduce ? 1 : 0, visible = true;
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const word = 'АТЛАНТ', font = '800 {s}px "Golos Text",Arial,sans-serif';
  function targets(n) {
    const o = document.createElement('canvas'), w = Math.round(Math.min(W, 900)), h = Math.round(w * 0.32);
    o.width = w; o.height = h;
    const c = o.getContext('2d');
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    let fs = h * 0.9; c.font = font.replace('{s}', fs);
    const m = c.measureText(word).width;
    if (m > w * 0.94) { fs *= w * 0.94 / m; c.font = font.replace('{s}', fs); }
    c.fillText(word, w / 2, h / 2);
    const d = c.getImageData(0, 0, w, h).data, pts = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
    const ox = (W - w) / 2, oy = H * (W < 640 ? 0.3 : 0.36) - h / 2, out = [];
    for (let i = 0; i < n; i++) { const q = pts[(rnd() * pts.length) | 0] || [w / 2, h / 2]; out.push([ox + q[0] + (rnd() - 0.5) * 2, oy + q[1] + (rnd() - 0.5) * 2]); }
    return out;
  }
  function build() {
    const n = W < 640 ? 1600 : 3600, tg = targets(n);
    P = [];
    for (let i = 0; i < n; i++) P.push({ x: rnd() * W, y: rnd() * H * 0.7, a: rnd() * 6.28, s: 0.6 + rnd() * 1.1, tx: tg[i][0], ty: tg[i][1], z: rnd() });
  }
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const b = cv.getBoundingClientRect(); W = b.width; H = b.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    build(); progress(); frame(performance.now());
  }
  function progress() {
    const b = sec.getBoundingClientRect(), span = b.height - innerHeight;
    visible = b.bottom > -50 && b.top < innerHeight + 50;
    p = reduce ? 1 : clamp(-b.top / Math.max(1, span));
  }
  function frame(now) {
    const t = now / 1000, k = ease(clamp((p - 0.12) / 0.6));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgba(12,22,38,' + (0.22 + 0.5 * k) + ')'; ctx.fillRect(0, 0, W, H);
    const cx = W / 2 + Math.sin(t * 0.4) * W * 0.12, cy = H * 0.33 + Math.cos(t * 0.3) * H * 0.06;
    for (const q of P) {
      const ang = Math.sin(q.x * 0.006 + t * 0.7) + Math.cos(q.y * 0.007 - t * 0.5) + Math.atan2(cy - q.y, cx - q.x) * 0.55 + 1.5;
      q.a += (ang - q.a) * 0.04;
      const sp = q.s * (W < 640 ? 1.2 : 1.8) * (1 - k * 0.6);
      let fx = q.x + Math.cos(q.a) * sp, fy = q.y + Math.sin(q.a) * sp;
      if (fx < -20) fx = W + 20; if (fx > W + 20) fx = -20; if (fy < -20) fy = H * 0.7; if (fy > H * 0.75) fy = -20;
      q.x = fx + (q.tx - fx) * k * 0.09; q.y = fy + (q.ty - fy) * k * 0.09;
      const r = 0.8 + q.z * 1.1 + k * 0.6;
      ctx.fillStyle = q.z > 0.82 ? 'rgba(233,184,114,' + (0.9 - k * 0.1) + ')' : 'rgba(' + ((190 + q.z * 40) | 0) + ',' + ((225 + q.z * 20) | 0) + ',245,' + (0.55 + q.z * 0.4) + ')';
      ctx.fillRect(q.x, q.y, r, r);
    }
  }
  function loop(now) { if (visible && !reduce) { progress(); frame(now); } if (!reduce) requestAnimationFrame(loop); }
  addEventListener('resize', size);
  addEventListener('scroll', () => { progress(); if (reduce) frame(performance.now()); }, { passive: true });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { size(); if (!reduce) requestAnimationFrame(loop); });
})();
