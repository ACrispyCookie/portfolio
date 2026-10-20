// Shared behaviour for the styled mock: the copper trace and the skills explorer.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- copper trace ---------- */
  const host = document.querySelector('[data-trace]');
  if (host) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'trace');
    svg.setAttribute('aria-hidden', 'true');
    const mk = (cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); svg.appendChild(p); return p; };
    const ghost = mk('t-ghost'), drawn = mk('t-drawn'), pulse = mk('t-pulse');
    const pads = document.createElementNS(NS, 'g'); svg.appendChild(pads);
    host.prepend(svg);
    document.documentElement.classList.add('has-trace');
    if (!reduce) document.documentElement.classList.add('rv');

    let total = 0, samples = [], padLens = [], secs = [], shown = 0, target = 0;

    function build() {
      const hb = host.getBoundingClientRect();
      const railX = parseFloat(getComputedStyle(host).getPropertyValue('--trace-x')) || 14;
      const rel = (r) => ({ x: r.left - hb.left, y: r.top - hb.top, w: r.width, h: r.height });
      const padEls = [...host.querySelectorAll('[data-pad]')].filter(e => e.offsetParent);
      if (!padEls.length) return;
      secs = padEls.map(e => e.closest('section'));
      const padPts = padEls.map(e => { const r = rel(e.getBoundingClientRect()); return { x: railX, y: r.y + Math.min(r.h / 2, 24) }; });
      let d, startY;
      const s = host.querySelector('[data-trace-start]');
      const R = 16;
      if (s && s.offsetParent) {
        const r = rel(s.getBoundingClientRect());
        const sx = r.x + r.w / 2;
        startY = r.y + r.h;
        if (r.x > railX + 30) {
          let turnY = startY + 26;
          host.querySelectorAll('[data-trace-beside]').forEach(el => {
            if (!el.offsetParent) return;
            const b = rel(el.getBoundingClientRect());
            if (b.y < startY && b.y + b.h > startY - 40) turnY = Math.max(turnY, b.y + b.h + 26);
          });
          d = `M${sx} ${startY} V${turnY - R} Q${sx} ${turnY} ${sx - R} ${turnY} H${railX + R} Q${railX} ${turnY} ${railX} ${turnY + R}`;
        } else {
          d = `M${railX} ${startY}`;
        }
      } else {
        startY = padPts[0].y - 40;
        d = `M${railX} ${startY}`;
      }
      d += ` V${padPts[padPts.length - 1].y}`;
      [ghost, drawn, pulse].forEach(p => p.setAttribute('d', d));
      svg.setAttribute("width", hb.width); svg.setAttribute("height", host.offsetHeight);
      svg.setAttribute("viewBox", `0 0 ${hb.width} ${host.offsetHeight}`);
      total = drawn.getTotalLength();
      samples = [];
      for (let l = 0; l <= total; l += 6) samples.push([l, drawn.getPointAtLength(l).y]);
      padLens = padPts.map(p => { const smp = samples.find(s => s[1] >= p.y - 1); return smp ? smp[0] : total; });
      pads.innerHTML = padPts.map((p, i) => `<circle class="t-pad" data-i="${i}" cx="${p.x}" cy="${p.y}" r="8.5"/>`).join('') +
        (s && s.offsetParent ? `<circle class="t-pad on" cx="${drawn.getPointAtLength(0).x}" cy="${startY}" r="6"/>` : '');
      drawn.style.strokeDasharray = `${total} ${total}`;
      pulse.style.strokeDasharray = `44 ${total + 44}`;
      measure();
      if (reduce) shown = total;
    }
    function lenAtY(y) { if (!samples.length) return 0; for (const [l, sy] of samples) if (sy >= y) return l; return total; }
    function measure() {
      const hb = host.getBoundingClientRect();
      target = lenAtY(innerHeight * 0.78 - hb.top);
    }
    let pos = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(now - last, 50); last = now;
      shown += (target - shown) * (reduce ? 1 : 0.12);
      drawn.style.strokeDashoffset = total - shown;
      pads.querySelectorAll('.t-pad[data-i]').forEach((c, i) => c.classList.toggle('on', padLens[i] <= shown + 2));
      // a section switches on when the trace reaches its pad (or, as a fallback, when it is well inside the screen)
      secs.forEach((sec, i) => { if (sec && !sec.classList.contains('lit') && (padLens[i] <= shown + 2 || sec.getBoundingClientRect().top < innerHeight * 0.7)) sec.classList.add('lit'); });
      if (!reduce && shown > 60) {
        pos += dt * 0.52;
        if (pos > shown + 44) pos = 0;
        pulse.style.strokeDashoffset = 44 - pos;
        pulse.style.opacity = 1;
      } else pulse.style.opacity = 0;
      requestAnimationFrame(frame);
    }
    addEventListener('scroll', measure, { passive: true });
    let queued = false, lastW = 0, lastH = 0;
    const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => {
      queued = false;
      if (host.offsetWidth === lastW && host.offsetHeight === lastH) return;
      lastW = host.offsetWidth; lastH = host.offsetHeight; build();
    }); };
    new ResizeObserver(schedule).observe(host);
    addEventListener('load', () => { lastW = 0; schedule(); });
    schedule();
    requestAnimationFrame(frame);
  }

  /* ---------- lab pill: hidden while the hero widget is on screen ---------- */
  const board = document.querySelector('.hero .board');
  if (board && 'IntersectionObserver' in window) {
    const root = document.documentElement;
    root.classList.add('pill-wait');
    new IntersectionObserver(([e]) => root.classList.toggle('pill-show', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(board);
  }

  /* ---------- skills explorer ---------- */
  const P = {
    nbody: ["N-body on GPUs", "ECE415", "nbody.jpg", "course.html#nbody"], conv: ["CUDA convolution", "ECE415", "conv-runtime.jpg", "course.html#conv"],
    clahe: ["CLAHE", "ECE415", "plot-planet_surface.jpg", "course.html#clahe"], kmeans: ["K-means", "ECE415", "", "course.html#kmeans"], sobel: ["Sobel filter", "ECE415", "", "course.html#sobel"],
    gpgpu: ["RISC-V GPGPU", "ECE338", "gpgpu-block.jpg", "project.html"], cv32: ["CV32E40P timing", "ECE494", "cv32.jpg", "#"],
    house: ["Explorable 3D house", "ECE433", "house.jpg", "#"], fuse: ["Deduplicating filesystem", "ECE318", "fuse.jpg", "#"],
    wifi: ["Wi-Fi jammer", "ECE436", "wifi.jpg", "#"], rambo: ["RAMBO air-gap", "ECE455", "rambo.jpg", "#"],
    lab: ["Live FPGA Lab", "Personal", "lab.jpg", "https://fpga.njason.dev"], dvd: ["DVD Logo FPGA", "Personal", "dvd.jpg", "#"],
    homelab: ["Homelab", "Personal", "", "#"], mc: ["Minecraft plugins", "acrispycookie.dev", "", "https://acrispycookie.dev"]
  };
  const M = {
    "CUDA": ['nbody', 'conv', 'clahe'], "OpenMP": ['nbody', 'kmeans'], "C": ['sobel', 'kmeans'], "RISC-V": ['gpgpu', 'cv32'], "OpenGL": ['house'], "C++": ['house'],
    "FUSE": ['fuse'], "ath9k": ['wifi'], "SDR (ADALM-PLUTO)": ['rambo'], "GNU Radio": ['rambo'], "Java": ['mc'], "Maven": ['mc'], "Gradle": ['mc'], "MySQL": ['mc'],
    "Vivado/Vitis": ['gpgpu', 'dvd'], "ARM/Zynq": ['gpgpu', 'lab'], "Python": ['gpgpu', 'lab'], "Verilog": ['dvd'], "Docker": ['homelab', 'lab'], "Traefik": ['homelab', 'lab'],
    "Proxmox": ['homelab'], "Nginx": ['homelab'], "WireGuard": ['homelab'], "Pi-hole": ['homelab'], "Ansible": ['homelab']
  };
  const COURSEWORK = ["MongoDB", "PostgreSQL", "MATLAB"];
  const FIRST = 14;
  const list = (ids) => ids.map(id => `<a href="${P[id][3]}">${P[id][0]}</a> <span class="crs">(${P[id][1]})</span>`).reduce((s, x, i, a) => s + (i === 0 ? '' : i === a.length - 1 ? ' and ' : ', ') + x, '');
  document.querySelectorAll('.skx2').forEach(k => {
    const line = k.querySelector('.usedline'), self = k.dataset.self, box = k.querySelector('.chips'), more = k.querySelector('.more');
    let chips = [...box.querySelectorAll('.chip')];
    chips.forEach(c => { const n = (M[c.textContent] || []).length; c.dataset.n = n; if (n) c.insertAdjacentHTML('beforeend', `<span class="ct" aria-label="${n} projects">${n}</span>`); });
    chips.sort((a, b) => b.dataset.n - a.dataset.n).forEach(c => box.appendChild(c));
    const name = c => c.firstChild.textContent;
    function show(c) {
      chips.forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', 'true');
      const t = name(c), ids = M[t] || [], others = ids.filter(id => id !== self);
      let txt;
      if (COURSEWORK.includes(t)) txt = 'From coursework that isn\'t on this site.';
      else if (!ids.length) txt = 'Where I used it comes from each project\'s tool list.';
      else if (self && !others.length) txt = 'Only this project uses it so far.';
      else txt = (self ? 'Also used in ' : 'Used in ') + list(others) + '.';
      line.innerHTML = `<b>${t}</b> ${txt}`;
    }
    chips.forEach(c => c.onclick = () => show(c));
    if (chips.length > FIRST + 4) {
      chips.slice(FIRST).forEach(c => c.hidden = true);
      more.hidden = false; more.textContent = `Show all ${chips.length}`;
      more.onclick = () => { const open = more.dataset.open === '1'; chips.slice(FIRST).forEach(c => c.hidden = open); more.dataset.open = open ? '0' : '1'; more.textContent = open ? `Show all ${chips.length}` : 'Show fewer'; };
    }
    const want = new URLSearchParams(location.search).get('tool');
    const start = chips.find(c => name(c) === want);
    if (start) { start.hidden = false; show(start); } else line.innerHTML = '<span class="hint">Tap a tool to see where I used it.</span>';
  });
})();
