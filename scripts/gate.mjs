#!/usr/bin/env node
// The acceptance gate (spec §11): every test and every installed website tester must pass.
//   npm run gate                    all built pages
//   npm run gate -- --pages /,/x    only these pages
// Exit 0 only when every step passes. Writes .gate/report.md.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { inspectAllow } from './gate-allow.mjs';

const HOME = process.env.HOME;
const CHROME = process.env.CHROME_PATH ?? `${HOME}/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome`;
const IMPECCABLE = process.env.IMPECCABLE_BIN ?? `${HOME}/.claude/plugins/cache/impeccable/impeccable/4.7.0/skills/impeccable/scripts/impeccable`;
const TASTE = '.claude/skills/design-taste-frontend/scripts';
const PORT = 4321;
const ORIGIN = `http://localhost:${PORT}`;
const env = { ...process.env, CHROME_PATH: CHROME };

mkdirSync('.gate', { recursive: true });
const report = [];
const results = [];

// each step's time goes in the report, to see where a gate run spends it (2026-10-27)
function run(name, cmd, args, extra = {}) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { env: { ...env, ...extra }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  writeFileSync(`.gate/${name.replace(/[^\w.-]+/g, '_')}.log`, out);
  return { ok: r.status === 0, out, status: r.status, secs: (Date.now() - t0) / 1000 };
}

// the same, without blocking, so several pages' testers can run at once
function runAsync(name, cmd, args) {
  const t0 = Date.now();
  return new Promise((done) => {
    const c = spawn(cmd, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (out += d));
    c.on('close', (status) => {
      writeFileSync(`.gate/${name.replace(/[^\w.-]+/g, '_')}.log`, out);
      done({ ok: status === 0, out, status, secs: (Date.now() - t0) / 1000 });
    });
  });
}

function record(name, ok, detail = '', secs = 0) {
  results.push({ name, ok, secs });
  report.push(`## ${ok ? 'PASS' : 'FAIL'} — ${name} (${fmt(secs)})\n\n${detail.trim() ? '```\n' + detail.trim().slice(-6000) + '\n```\n' : ''}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${fmt(secs)}`);
}
const fmt = (secs) => (secs >= 60 ? `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s` : `${Math.round(secs)}s`);
const started = Date.now();

function pagesFromDist() {
  const out = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f === 'index.html') out.push('/' + relative('dist', d).split('\\').join('/'));
    }
  };
  walk('dist');
  return out.map((p) => (p === '/' ? '/' : p.replace(/\/?$/, '/'))).filter((p) => !p.startsWith('/pill-test'));
}

const argPages = process.argv.indexOf('--pages');

// 1–4: build, types, unit, e2e; the e2e tests serve the build this step made instead of building again
let built = false;
for (const [name, args] of [
  ['build', ['run', 'build']],
  ['astro check', ['run', 'check']],
  ['unit tests', ['run', 'test:unit', '--', '--passWithNoTests']],
  ['e2e tests (Playwright, contrast)', ['run', 'test:e2e']],
]) {
  const r = run(name, 'npm', args, built ? { GATE_BUILT: '1' } : {});
  if (name === 'build') built = r.ok;
  record(name, r.ok, r.ok ? '' : r.out, r.secs);
}

const pages = argPages > -1 ? process.argv[argPages + 1].split(',') : existsSync('dist') ? pagesFromDist() : ['/'];

// 5: the taste linter over the source
{
  const r = run('taste lint', 'node', [`${TASTE}/lint.mjs`, 'src']);
  record('design-taste-frontend lint.mjs src', r.ok, r.out, r.secs);
}

// start the preview server for the browser-based testers
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { env, stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid, 'SIGTERM'); } catch {} };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });
for (let i = 0; i < 60; i++) {
  try { const res = await fetch(ORIGIN); if (res.ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const slugOf = (page) => (page === '/' ? 'home' : page.replace(/\W+/g, '-').replace(/^-|-$/g, ''));

// 6–7: the taste inspector and Impeccable, three pages at a time (Jason, 2026-10-27: the Pi sat half idle); their
// findings don't depend on speed. Lighthouse (8) stays one page at a time: its performance score drops on a shared CPU
async function testers(page) {
  const url = ORIGIN + page, slug = slugOf(page);
  const [insp, imp] = await Promise.all([
    runAsync(`inspect ${slug}`, 'node', [`${TASTE}/inspect.mjs`, url, '--out', `.gate/inspect-${slug}`, '--widths', '1440,1024,768,390', ...(inspectAllow(page).length ? ['--allow', inspectAllow(page).join(',')] : [])]), // phone, both tablet orientations, desktop; §11's exceptions
    runAsync(`impeccable ${slug}`, IMPECCABLE, ['detect', '--json', url]),
  ]);
  return { page, insp, imp };
}

try {
  const found = new Map();
  const queue = [...pages];
  await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
    for (let page; (page = queue.shift()); ) found.set(page, await testers(page));
  }));

  for (const page of pages) {
    const url = ORIGIN + page, slug = slugOf(page);
    const { insp: r, imp } = found.get(page);

    // 6: taste inspector (real browser, 1440/1024/768/390)
    {
      const warns = r.out.split('\n').filter((l) => /^\s+\[/.test(l) && r.out.indexOf(l) > r.out.indexOf('WARN —')).join('\n');
      record(`taste inspect.mjs ${page}`, r.ok, r.ok ? (warns ? 'WARNs to fix or defend:\n' + warns : '') : r.out, r.secs);
    }

    // 7: Impeccable detect: no findings at all, advisory included
    {
      let findings = [];
      try { const j = JSON.parse(imp.out.slice(imp.out.indexOf('['))); findings = Array.isArray(j) ? j : j.findings ?? []; } catch { findings = null; }
      const advisory = /advisory/i.test(imp.out) && !/0 advisory/i.test(imp.out);
      const ok = findings !== null && findings.length === 0 && !advisory;
      record(`Impeccable detect ${page}`, ok, ok ? '' : imp.out, imp.secs);
    }

    // 8: Lighthouse ≥ 0.90 in every category, alone on the machine
    {
      const json = `.gate/lighthouse-${slug}.json`;
      const r = run(`lighthouse ${slug}`, 'npx', ['lighthouse', url, `--chrome-path=${CHROME}`, '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${json}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox']);
      let scores = {};
      try { const j = JSON.parse(readFileSync(json, 'utf8')); for (const [k, v] of Object.entries(j.categories)) scores[k] = v.score; } catch {}
      const vals = Object.values(scores);
      const ok = r.ok && vals.length === 4 && vals.every((s) => s >= 0.9);
      record(`Lighthouse ${page}`, ok, Object.entries(scores).map(([k, v]) => `${k}: ${Math.round(v * 100)}`).join('\n') || r.out, r.secs);
    }
  }
} finally {
  stop();
}

const failed = results.filter((r) => !r.ok);
const total = fmt((Date.now() - started) / 1000);
writeFileSync('.gate/report.md', `# Gate report\n\n${failed.length ? `**${failed.length} of ${results.length} steps failed.**` : `**All ${results.length} steps passed.**`} Took ${total}.\n\n${report.join('\n')}`);
console.log(`took ${total}`);
console.log(failed.length ? `\nGATE FAILED: ${failed.length}/${results.length} — see .gate/report.md` : `\nGATE PASSED: ${results.length}/${results.length}`);
process.exit(failed.length ? 1 : 0);
