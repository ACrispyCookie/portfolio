// Skills explorer (spec §7.4): tap a chip to see where the tool was used; the first 14 show until "Show all".
import type { SkillEntry, SkillUse } from '../lib/skills';

const FIRST = 14;
const FEW = 3; // projects named before "N more"
const HINT = 'Tap a tool to see where I used it.';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** "A, B and C". */
const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const link = (u: SkillUse) => `<a href="${esc(u.href)}">${esc(u.title)}</a>${u.courseCode ? ` <span class="crs">(${esc(u.courseCode)})</span>` : ''}`;

/** "A (ECE415), B and C"; past FEW, "A, B, C and <button>16 more</button>" until opened. */
function list(uses: SkillUse[], open: boolean): string {
  if (open || uses.length <= FEW + 1) return and(uses.map(link));
  return `${uses.slice(0, FEW).map(link).join(', ')} and <button class="morelinks" type="button">${uses.length - FEW} more</button>`;
}

// One wording everywhere: projects first, then "In coursework: …" for work that isn't a project card.
function sentence(e: SkillEntry, self: string, open: boolean): string {
  const courses = e.alsoIn.length ? `In coursework: ${and(e.alsoIn.map(esc))}.` : '';
  const others = e.usedIn.filter((u) => u.href !== self);
  let used = '';
  if (self && e.usedIn.length && !others.length) used = 'Only this project uses it so far.';
  else if (others.length) used = `${self ? 'Also used in' : 'Used in'} ${list(others, open)}.`;
  return [used, courses].filter(Boolean).join(' ') || 'Not in a project on this site yet.';
}

export function initSkills(root: HTMLElement): void {
  const data: SkillEntry[] = JSON.parse(root.querySelector('script[type="application/json"]')!.textContent!);
  const byTool = new Map(data.map((e) => [e.tool, e]));
  const self = root.dataset.self ?? '';
  const line = root.querySelector<HTMLElement>('.usedline')!;
  const more = root.querySelector<HTMLButtonElement>('.more')!;
  const chips = [...root.querySelectorAll<HTMLButtonElement>('.chip')];
  line.innerHTML = `<span class="hint">${HINT}</span>`;

  const show = (chip: HTMLButtonElement, open = false) => {
    for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
    const e = byTool.get(chip.dataset.tool!)!;
    line.innerHTML = `<b>${esc(e.tool)}</b> ${sentence(e, self, open)}`;
    line.querySelector<HTMLButtonElement>('.morelinks')?.addEventListener('click', () => {
      show(chip, true);
      line.querySelector('a')?.focus(); // keep keyboard focus in the line after the button goes away
    });
  };
  for (const c of chips) c.addEventListener('click', () => show(c));

  if (chips.length > FIRST) {
    let open = false;
    const fold = () => {
      chips.slice(FIRST).forEach((c) => (c.hidden = !open && c.getAttribute('aria-pressed') !== 'true'));
      more.textContent = open ? 'Show fewer' : `Show all ${chips.length}`;
    };
    more.hidden = false;
    more.addEventListener('click', () => { open = !open; fold(); });
    fold();
  }

  const want = new URLSearchParams(location.search).get('tool');
  const start = chips.find((c) => c.dataset.tool === want);
  if (start) { start.hidden = false; show(start); }
}

document.querySelectorAll<HTMLElement>('.skx').forEach(initSkills);
