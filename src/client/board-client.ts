// Draws the home widget from the lab's live status (lab-status.ts publishes it on every page).
import type { WidgetView } from '../lib/board';

function render(root: HTMLElement, v: WidgetView) {
  const f = (name: string) => root.querySelector<HTMLElement>(`[data-f="${name}"]`);
  root.dataset.state = v.status;
  f('label')!.textContent = v.label;
  f('headline')!.textContent = v.headline;
  f('sub')!.textContent = v.sub; // an empty sub collapses; .running's min-height keeps the widget one height
  f('queue')!.textContent = v.queue === null ? '' : String(v.queue);
  f('queue-tag')!.hidden = v.queue === null;
  f('temp')!.textContent = v.tempC === null ? '' : `${Math.round(v.tempC)} °C`;
  f('temp-tag')!.hidden = v.tempC === null;
}

export function drawBoard(root: HTMLElement): void {
  // Hold the live block's space from the start; it says plainly that nothing has been heard yet.
  root.dataset.state = 'connecting';
  root.querySelector<HTMLElement>('[data-f="headline"]')!.textContent = 'Checking the board…';
  document.addEventListener('lab:status', (e) => render(root, (e as CustomEvent<WidgetView>).detail));
  if (window.__lab) render(root, window.__lab); // a status that arrived before this script ran
}

const root = document.querySelector<HTMLElement>('.hero .board');
if (root) drawBoard(root);
