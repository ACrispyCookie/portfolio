// Skills explorer (spec §7.4): tap a chip to see where the tool was used; the first 14 show until "Show all".
import type { SkillEntry, SkillUse } from '../lib/skills';

const FIRST = 14;
const HINT = 'Tap a tool to see where I used it.';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** "A, B and C". */
const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** "A (ECE415), B and C" with each project as a link. */
function list(uses: SkillUse[]): string {
  return and(uses.map((u) => `<a href="${esc(u.href)}">${esc(u.title)}</a>${u.courseCode ? ` <span class="crs">(${esc(u.courseCode)})</span>` : ''}`));
}

function sentence(e: SkillEntry, self: string): string {
  const courses = e.alsoIn.map(esc);
  if (!e.usedIn.length) return courses.length ? `From coursework that isn't on this site: ${and(courses)}.` : 'Not in a project on this site yet.';
  const others = e.usedIn.filter((u) => u.href !== self);
  const used = self && !others.length ? 'Only this project uses it so far.' : `${self ? 'Also used in' : 'Used in'} ${list(others)}.`;
  return courses.length ? `${used} Also in coursework: ${and(courses)}.` : used;
}

export function initSkills(root: HTMLElement): void {
  const data: SkillEntry[] = JSON.parse(root.querySelector('script[type="application/json"]')!.textContent!);
  const byTool = new Map(data.map((e) => [e.tool, e]));
  const self = root.dataset.self ?? '';
  const line = root.querySelector<HTMLElement>('.usedline')!;
  const more = root.querySelector<HTMLButtonElement>('.more')!;
  const chips = [...root.querySelectorAll<HTMLButtonElement>('.chip')];
  line.innerHTML = `<span class="hint">${HINT}</span>`;

  const show = (chip: HTMLButtonElement) => {
    for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
    const e = byTool.get(chip.dataset.tool!)!;
    line.innerHTML = `<b>${esc(e.tool)}</b> ${sentence(e, self)}`;
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
