// The any-shape detector (Jason, 2026-10-25: split screens and resized windows broke the layout; fix it fluidly, not
// per device). `inspect` runs inside the page at one window size and lists what a person would see as broken:
// overlapping words, clipped or too-small text, pills and buttons broken across lines, headings one word per line,
// pictures cropped hard or shrunk to a thumbnail, and sideways scroll. Each finding names the element, so a sweep over
// many sizes can group them.

export interface Finding { kind: string; what: string; detail: string }

/** Runs in the browser: everything visibly broken at the current window size. */
export function inspect(): Finding[] {
  const out: Finding[] = [];
  const vw = innerWidth;
  const name = (e: Element): string => {
    const id = e.closest('[id]')?.id;
    const card = e.closest('[data-id]')?.getAttribute('data-id') ?? e.closest('.course')?.querySelector('.cn b, h3')?.textContent?.trim();
    if (card) return `${id ? '#' + id + ' ' : ''}[${card}] ${e.tagName.toLowerCase()}`;
    const cls = [...e.classList].slice(0, 2).join('.');
    const text = (e.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 28);
    return `${id ? '#' + id + ' ' : ''}${e.tagName.toLowerCase()}${cls ? '.' + cls : ''}${text ? ` "${text}"` : ''}`;
  };
  const shown = (e: Element) => {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (let p: Element | null = e; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      if (p.matches('dialog:not([open]), details:not([open]) > :not(summary)')) return false;
    }
    return true;
  };
  // lines of text: boxes whose tops differ by more than half a line (a bold code or an icon beside a word sits a little
  // higher or lower on the same line)
  const lines = (e: Element) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    const half = parseFloat(getComputedStyle(e).fontSize) * 0.6;
    const tops = [...g.getClientRects()].filter((r) => r.width > 1 && r.height > 4).map((r) => r.top).sort((a, b) => a - b);
    return tops.reduce((n, t, i) => (i && t - tops[i - 1] > half ? n + 1 : n), tops.length ? 1 : 0);
  };

  // sideways scroll
  if (document.documentElement.scrollWidth > vw + 1) out.push({ kind: 'sideways scroll', what: 'page', detail: `${document.documentElement.scrollWidth}px in ${vw}px` });

  // the pieces of text that must stand alone: pills, tags, buttons, labels, headings and short lines
  const atoms = [...document.querySelectorAll('main, header.topbar, footer')].flatMap((root) => [...root.querySelectorAll<HTMLElement>(
    '.tag, .pill, .btn, .labpill, h1, h2, h3, .knums b, .knums span, .crumb, .lead, .count, .name, figcaption, .onfpga, .cap, nav a, .tools .tag, .where a')]).filter(shown);

  // overlapping words: two atoms (neither inside the other) whose boxes cross
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i], ra = a.getBoundingClientRect();
    for (let j = i + 1; j < atoms.length; j++) {
      const b = atoms[j];
      if (a.contains(b) || b.contains(a)) continue;
      const rb = b.getBoundingClientRect();
      const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (x > 2 && y > 2) out.push({ kind: 'overlap', what: `${name(a)} × ${name(b)}`, detail: `${Math.round(x)}×${Math.round(y)}px` });
    }
  }

  // pills, tags and buttons broken across lines; headings one word per line
  for (const e of atoms) {
    // a pill or button on two lines is broken only if its row had room for it on one: wrapping in a row narrower than
    // its words is the intended fallback
    if (e.matches('.tag, .pill, .btn, .labpill, nav a') && !e.matches('.prev, .next, .toc a') && lines(e) > 1) {
      const c = e.cloneNode(true) as HTMLElement;
      c.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;width:auto;min-width:0;max-width:none';
      document.body.append(c);
      const need = c.getBoundingClientRect().width;
      c.remove();
      const p = e.parentElement!, ps = getComputedStyle(p);
      const room = p.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
      if (need <= room - 2) out.push({ kind: 'pill wraps', what: name(e), detail: `needs ${Math.round(need)}px, row ${Math.round(room)}px` }); // 2px of slack for sub-pixel rounding
    }
    if (e.matches('h1, h2, h3')) {
      const words = (e.textContent ?? '').trim().split(/\s+/).length, n = lines(e);
      // in a column under 140px one word a line can't be helped; anywhere wider it's a heading set badly
      if (words >= 3 && n >= words && e.getBoundingClientRect().width > 140) out.push({ kind: 'one word per line', what: name(e), detail: `${words} words, ${n} lines` });
    }
  }

  // clipped text: a box whose text runs past its edge
  for (const e of document.querySelectorAll<HTMLElement>('main *, header.topbar *')) {
    if (!e.firstChild || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
    if (!shown(e) || e.closest('.vh, .sr-only')) continue; // text for screen readers only, hidden on purpose
    const cs = getComputedStyle(e);
    if (cs.overflowX !== 'visible' && e.scrollWidth > e.clientWidth + 1 && !e.closest('.tscroll, pre, .stage')) out.push({ kind: 'clipped text', what: name(e), detail: `${e.scrollWidth}px in ${e.clientWidth}px` });
    // too small: words under 13px on screen (a drawing's words measure by their box)
    if (e.closest('svg')) continue; // a drawing's words are checked below, with a thumbnail's allowance
    const px = parseFloat(cs.fontSize);
    if (px < 12.5 && !e.closest('[aria-hidden="true"]')) out.push({ kind: 'small text', what: name(e), detail: `${px.toFixed(1)}px` });
  }
  // a drawing's words
  for (const t of document.querySelectorAll<SVGTextElement>('main svg text')) {
    if (!shown(t) || t.closest('[aria-hidden="true"]')) continue;
    const h = t.getBoundingClientRect().height;
    // a drawing in a thumbnail is a picture whose words always show, however small (Jason, 2026-10-25); only a
    // drawing on its own in a page or a project's top picture must read at 13px
    if (t.closest('.card .media, .thumb, .w .t, .origin, .hero-media')) continue;
    if (h < 12.5) out.push({ kind: 'small text', what: `${name(t.closest('svg')!)} text "${t.textContent}"`, detail: `${h.toFixed(1)}px` });
  }

  // text set in a column too narrow to read: over 12 characters on 2+ lines in a column under six times its font
  // size (Jason, 2026-10-25: "proj / ects / on / this / site" at 200px, which nothing above caught)
  for (const e of document.querySelectorAll<HTMLElement>('main *, header.topbar *, footer *')) {
    if (e.closest('svg, .vh, .sr-only') || !shown(e)) continue;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join(' ').trim();
    if (own.length <= 12) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize), w = e.getBoundingClientRect().width;
    if (w < fs * 6 && lines(e) > 2) out.push({ kind: 'narrow text', what: name(e), detail: `${Math.round(w)}px for ${Math.round(fs)}px text` });
  }

  // content outside its card: a part of a panel (a box with its own background and rounded corners) that pokes out
  for (const box of document.querySelectorAll<HTMLElement>('main *, footer *')) {
    if (!shown(box) || box.closest('svg') || box.matches('.tag, .pill, .btn, .chip, .labpill, img, video, a.tag')) continue;
    const cs = getComputedStyle(box);
    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopLeftRadius) < 6 || cs.overflowX !== 'visible') continue;
    const b = box.getBoundingClientRect();
    for (const k of box.querySelectorAll<HTMLElement>('*')) {
      if (k.closest('svg') && k.tagName !== 'svg') continue;
      if (k.closest('.pfig.drawn, .tscroll') && !box.matches('.pfig.drawn, .tscroll') || !shown(k)) continue;
      const r = k.getBoundingClientRect();
      if (r.right > b.right + 1 || r.left < b.left - 1) { out.push({ kind: 'outside its card', what: `${name(k)} in ${name(box)}`, detail: `${Math.round(Math.max(r.right - b.right, b.left - r.left))}px out` }); break; }
    }
  }

  // pictures squashed flat: laid out (not hidden on purpose) but with no width or height left (Jason, 2026-10-26: the
  // home photo vanished at 582×592, where two layout rules disagreed)
  for (const img of document.querySelectorAll<HTMLImageElement>('main img, main video')) {
    const r = img.getBoundingClientRect();
    if ((r.width >= 1) === (r.height >= 1) || img.closest('.av, .avatar, .person .head, .stack, .face, .avs')) continue;
    let hidden = false;
    for (let p: Element | null = img; p && !hidden; p = p.parentElement) {
      const cs = getComputedStyle(p);
      hidden = cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || p.matches('dialog:not([open]), details:not([open]) > :not(summary)');
    }
    if (!hidden) out.push({ kind: 'picture collapsed', what: name(img.parentElement!.closest('figure, .card, .cover, .media, .thumb, .t') ?? img), detail: `${Math.round(r.width)}×${Math.round(r.height)}` });
  }

  // pictures: cut hard (less than 60% of the picture shown) or shrunk far below their space
  for (const img of document.querySelectorAll<HTMLImageElement>('main img')) {
    if (!shown(img) || !img.naturalWidth || img.closest('.av, .avatar, .person .head, .stack, .face, .avs')) continue; // faces are small on purpose
    const r = img.getBoundingClientRect(), cs = getComputedStyle(img);
    if (cs.objectFit === 'cover') {
      const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      const seen = (r.width * r.height) / (img.naturalWidth * s * img.naturalHeight * s);
      // the home photo above the name shows at least 80% of its height (the summit is near the top, Jason at the bottom:
      // never a strip; Jason, 2026-10-25); beside the name it fills the text's height, and like any picture may show 60%
      const who = document.querySelector('#top .who')?.getBoundingClientRect();
      const stacked = !!img.closest('.cover') && !!who && r.bottom <= who.top + 1;
      const trimsHeight = r.width / r.height > img.naturalWidth / img.naturalHeight;
      if (seen < (stacked && trimsHeight ? 0.8 : 0.6)) out.push({ kind: 'picture cropped', what: name(img.parentElement!.closest('figure, .card, .cover, .media, .thumb, .t') ?? img), detail: `${Math.round(seen * 100)}% shown` });
    }
    const room = img.closest('figure, .card, .cover, .media, .thumb')?.parentElement?.getBoundingClientRect().width ?? vw;
    if (r.width < Math.min(160, room * 0.3)) out.push({ kind: 'picture tiny', what: name(img.closest('figure, .card, .cover, .media, .thumb, .t') ?? img), detail: `${Math.round(r.width)}px wide` });
  }
  return out;
}
