// The copper trace (spec §7.3), ported from docs/superpowers/mocks/styled/site.js.
import { buildTracePath } from '../lib/trace-path';

const NS = 'http://www.w3.org/2000/svg';
const PULSE = 44;

export function initTrace(host: HTMLElement): void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // On home the current comes from the live board: the pulse runs only while it reports online.
  let powered = host.dataset.trace !== 'board';
  document.addEventListener('board:status', (e) => { powered = (e as CustomEvent<{ online: boolean }>).detail.online; });

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'trace');
  svg.setAttribute('aria-hidden', 'true');
  const path = (cls: string) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', cls);
    svg.appendChild(p);
    return p;
  };
  const ghost = path('t-ghost'), drawn = path('t-drawn'), pulse = path('t-pulse');
  const parts = document.createElementNS(NS, 'g');
  svg.appendChild(parts);
  host.prepend(svg);
  document.documentElement.classList.add('has-trace');
  if (!reduce) document.documentElement.classList.add('rv');

  let total = 0, shown = 0, target = 0, hostTop = 0;
  // the bends are sampled; below railTop the path is one straight run, so its length is computed, not sampled
  let samples: [number, number][] = [];
  let railTop = 0, railLen = 0;
  let padLens: number[] = [];
  let secs: (HTMLElement | null)[] = [];
  let secTops: number[] = [];
  let padEls: { el: Element; i: number }[] = [];

  const lenAtY = (y: number) => {
    if (!total) return 0;
    if (y >= railTop) return Math.min(total, railLen + y - railTop);
    for (const [l, sy] of samples) if (sy >= y) return l;
    return railLen;
  };
  // one layout read per scroll event; frames only use the cached numbers
  const measure = () => {
    hostTop = host.getBoundingClientRect().top;
    target = lenAtY(innerHeight * 0.78 - hostTop);
    drawnAt = -1; // re-check the 70% fallback even when the copper target hasn't moved
  };

  function build() {
    const hb = host.getBoundingClientRect();
    const railX = parseFloat(getComputedStyle(host).getPropertyValue('--trace-x')) || 14;
    const rel = (r: DOMRect) => ({ x: r.left - hb.left, y: r.top - hb.top, w: r.width, h: r.height });
    const heads = [...host.querySelectorAll<HTMLElement>('[data-pad]')].filter((e) => e.offsetParent);
    if (!heads.length) return;
    secs = heads.map((e) => e.closest('section'));
    secTops = secs.map((sec) => (sec ? sec.getBoundingClientRect().top - hb.top : Infinity));
    const pads = heads.map((e) => { const r = rel(e.getBoundingClientRect()); return r.y + Math.min(r.h / 2, 24); });
    const s = host.querySelector<HTMLElement>('[data-trace-start]');
    let start = null, turnY = 0;
    if (s?.offsetParent) {
      const r = rel(s.getBoundingClientRect());
      start = { x: r.x + r.w / 2, y: r.y + r.h };
      turnY = start.y + 26;
    }
    const t = buildTracePath({ railX, start, turnY, pads });
    for (const p of [ghost, drawn, pulse]) p.setAttribute('d', t.d);
    const h = host.offsetHeight;
    svg.setAttribute('width', String(hb.width));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', `0 0 ${hb.width} ${h}`);
    total = drawn.getTotalLength();
    railTop = t.railTop;
    railLen = Math.max(0, total - (t.padYs[t.padYs.length - 1] - railTop));
    samples = [];
    for (let l = 0; l <= railLen; l += 6) samples.push([l, drawn.getPointAtLength(l).y]);
    padLens = t.padYs.map((y) => lenAtY(y - 1));
    const startPad = start ? `<circle class="t-pad on" cx="${start.x}" cy="${start.y}" r="6"/>` : '';
    parts.innerHTML =
      t.vias.map((v, i) => `<path class="t-stub" data-p="${i >> 1}" d="M${railX} ${v.y} H${railX + 10}"/><circle class="t-via" data-p="${i >> 1}" cx="${v.x}" cy="${v.y}" r="3.2"/>`).join('') +
      t.padYs.map((y, i) => `<circle class="t-pad" data-i="${i}" cx="${railX}" cy="${y}" r="8.5"/>`).join('') +
      startPad;
    padEls = [...parts.querySelectorAll<SVGElement>('[data-i], [data-p]')].map((el) => ({ el, i: Number(el.dataset.i ?? el.dataset.p) }));
    drawnAt = -1;
    drawn.style.strokeDasharray = `${total} ${total}`;
    pulse.style.strokeDasharray = `${PULSE} ${total + PULSE}`;
    measure();
    if (reduce) shown = total;
  }

  let pos = 0, last = performance.now(), drawnAt = -1, pulseOn = false;
  function frame(now: number) {
    const dt = Math.min(now - last, 50);
    last = now;
    shown = reduce ? total : Math.abs(target - shown) < 0.25 ? target : shown + (target - shown) * 0.12;
    // write only what changed: an idle trace costs no style or layout work
    if (shown !== drawnAt) {
      drawnAt = shown;
      drawn.style.strokeDashoffset = String(total - shown);
      for (const { el, i } of padEls) el.classList.toggle('on', padLens[i] <= shown + 2);
      // a section switches on when the copper reaches its pad, or once its top is 70% up the screen
      secs.forEach((sec, i) => {
        if (sec && !sec.classList.contains('lit') && (padLens[i] <= shown + 2 || hostTop + secTops[i] < innerHeight * 0.7)) sec.classList.add('lit');
      });
    }
    const run = !reduce && powered && shown > 60;
    if (run) {
      pos += dt * 0.52;
      if (pos > shown + PULSE) pos = 0;
      pulse.style.strokeDashoffset = String(PULSE - pos);
    }
    if (run !== pulseOn) { pulseOn = run; pulse.style.opacity = run ? '1' : '0'; }
    requestAnimationFrame(frame);
  }

  addEventListener('scroll', measure, { passive: true });
  // rebuild only on a real size change, at most once per frame (never on scroll or the address bar)
  let queued = false, lastW = 0, lastH = 0;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (host.offsetWidth === lastW && host.offsetHeight === lastH) return;
      lastW = host.offsetWidth;
      lastH = host.offsetHeight;
      build();
    });
  };
  new ResizeObserver(schedule).observe(host);
  addEventListener('load', () => { lastW = 0; schedule(); });
  schedule();
  requestAnimationFrame(frame);
}

const host = document.querySelector<HTMLElement>('[data-trace]');
if (host) initTrace(host);
