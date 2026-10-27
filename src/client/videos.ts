// Card videos (spec §7.5): muted loops that play only while on screen, and never under reduced motion.
const videos = document.querySelectorAll<HTMLVideoElement>('main video');
if (videos.length && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const io = new IntersectionObserver((entries) => {
    // entries are applied in order, so for a batch holding one video twice the last one wins
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }
  });
  for (const v of videos) io.observe(v);
}
