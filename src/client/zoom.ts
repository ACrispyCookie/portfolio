// A section picture opens full screen at its full size (Jason, 2026-10-24: the GPGPU pictures were hard to see on
// every device). It first fits the screen; a tap on it shows it at its real size, to scroll around; Escape, Close or a
// tap outside it closes, and focus goes back to the picture's link. Without JavaScript the link opens the file itself.
const viewer = document.querySelector<HTMLDialogElement>('dialog.viewer');
if (viewer) {
  // the picture is made here, with its file, so the page never ships an image without one
  // the picture scrolls inside its own stage: a swipe on the dialog itself didn't always scroll (Jason, 2026-10-24)
  const stage = viewer.querySelector<HTMLElement>('.stage')!;
  const img = document.createElement('img');
  stage.append(img);
  const hint = viewer.querySelector<HTMLElement>('.hint')!;
  const verb = matchMedia('(pointer: fine)').matches ? 'Click' : 'Tap';
  const fitText = `${verb} the picture to see it at full size`;
  // a picture no bigger than the screen is already at its full size: no zoom, no hint
  const zoomable = () => img.naturalWidth > stage.clientWidth || img.naturalHeight > stage.clientHeight;
  img.addEventListener('load', () => { hint.hidden = !zoomable(); });
  let from: HTMLAnchorElement | null = null;
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a.zoom')) {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // a new tab still gets the file
      e.preventDefault();
      from = a;
      img.src = a.href;
      img.alt = a.querySelector('img')?.alt ?? '';
      viewer.classList.remove('actual');
      hint.textContent = fitText;
      hint.hidden = true; // until the picture has loaded and shows whether it can zoom
      viewer.showModal();
    });
  }
  // zoom in on the spot that was tapped, so the detail you wanted is what you see
  img.addEventListener('click', (e) => {
    if (!zoomable()) return;
    const r = img.getBoundingClientRect();
    // where the tap fell on the picture itself (object-fit: contain leaves bands beside it)
    const s = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const left = r.left + (r.width - img.naturalWidth * s) / 2, top = r.top + (r.height - img.naturalHeight * s) / 2;
    const fx = Math.min(1, Math.max(0, (e.clientX - left) / (img.naturalWidth * s)));
    const fy = Math.min(1, Math.max(0, (e.clientY - top) / (img.naturalHeight * s)));
    const actual = viewer.classList.toggle('actual');
    hint.textContent = actual ? `${verb} the picture to fit it to the screen` : fitText;
    if (actual) stage.scrollTo({ left: fx * img.naturalWidth - stage.clientWidth / 2, top: fy * img.naturalHeight - stage.clientHeight / 2 });
  });
  viewer.querySelector('.close')!.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target === stage) viewer.close(); });
  viewer.addEventListener('close', () => { img.removeAttribute('src'); from?.focus(); });
}
