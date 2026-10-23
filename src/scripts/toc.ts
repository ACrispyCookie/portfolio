// Marks the section in view in the contents list (spec §5.2); on a narrow screen the strip scrolls itself, never the
// page, to keep that link in sight.
for (const nav of document.querySelectorAll<HTMLElement>('nav.toc')) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
  const list = nav.querySelector<HTMLElement>('ol')!;
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter((e): e is HTMLElement => !!e);
  const mark = (id: string) => {
    for (const a of links) {
      const on = a.hash === `#${id}`;
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      // measured against the strip itself (offsetLeft counts from the page's frame, not the strip)
      if (on && list.scrollWidth > list.clientWidth) list.scrollTo({ left: a.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - 8, behavior: 'smooth' });
    }
  };
  const seen = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id);
      const first = targets.find((t) => seen.has(t.id));
      if (first) mark(first.id);
    },
    { rootMargin: '-84px 0px -55% 0px' },
  );
  targets.forEach((t) => io.observe(t));
}
