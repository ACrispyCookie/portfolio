import type { Page } from '@playwright/test';

export interface ContrastFail {
  selector: string;
  text: string;
  ratio: number;
  need: number;
  fg: string;
  bg: string;
}

/** Rendered WCAG AA audit: every visible element with its own text, against its nearest opaque background. */
export function auditContrast(page: Page): Promise<ContrastFail[]> {
  return page.evaluate(() => {
    const rgba = (s: string) => {
      const m = s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
      return [m[0], m[1], m[2], m[3] ?? 1];
    };
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const out: ContrastFail[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || el.getClientRects().length === 0) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own) continue;
      let fg = rgba(cs.color);
      let a: HTMLElement | null = el;
      let bg: number[] | null = null;
      while (a) {
        const acs = getComputedStyle(a);
        if (acs.backgroundImage !== 'none' && a !== document.body) break; // text over a picture: judged by eye
        const c = rgba(acs.backgroundColor);
        if (c[3] > 0.9) { bg = c; break; }
        a = a.parentElement;
      }
      if (!bg) continue;
      if (fg[3] < 1) fg = fg.map((v, i) => (i < 3 ? v * fg[3] + bg![i] * (1 - fg[3]) : 1));
      const [l1, l2] = [lum(fg), lum(bg)];
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      if (ratio < need) {
        out.push({
          selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')}`,
          text: el.textContent!.trim().slice(0, 40),
          ratio: Math.round(ratio * 100) / 100,
          need,
          fg: cs.color,
          bg: `rgb(${bg.slice(0, 3).join(', ')})`,
        });
      }
    }
    return out;
  });
}
