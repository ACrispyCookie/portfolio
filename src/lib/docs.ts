// A project's report and presentation (spec §5.4, Jason 2026-10-24): shown only when Jason has put the cleaned PDF in
// public/reports/<course or "projects">/<id>-report.pdf or -presentation.pdf. Nothing is ever copied from reports/.
export interface Doc { kind: 'report' | 'presentation'; label: string; href: string }

const KINDS = [{ kind: 'report', label: 'Report' }, { kind: 'presentation', label: 'Presentation' }] as const;

/** `has` says whether a path relative to the project root exists (fs.existsSync at build). */
export function docsFor(p: { id: string; course?: string }, has: (path: string) => boolean): Doc[] {
  const dir = p.course ?? 'projects';
  return KINDS.map(({ kind, label }) => ({ kind, label, href: `/reports/${dir}/${p.id}-${kind}.pdf` })).filter((d) => has(`public${d.href}`));
}
