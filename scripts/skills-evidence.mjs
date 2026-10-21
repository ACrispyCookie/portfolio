// Skills evidence scan (dev tool, not part of the build). Reads the git-ignored research/ clones of Jason's repos,
// finds evidence for every tool in each project's folders, and writes docs/SKILLS_EVIDENCE.md for Jason to review.
// Rule (Jason, 2026-10-21): anything used in a project counts, scripts included. Third-party trees are skipped.
// Usage: node scripts/skills-evidence.mjs
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';

const R = 'research';

// Site projects → their folders. Courses not on the site are listed under COURSEWORK.
const PROJECTS = {
  sobel: ['ECE415-High-Performance-Computing/Lab1'],
  kmeans: ['ECE415-High-Performance-Computing/Lab2'],
  conv: ['ECE415-High-Performance-Computing/Lab3'],
  clahe: ['ECE415-High-Performance-Computing/Lab4'],
  nbody: ['ECE415-High-Performance-Computing/Lab5'],
  rpc: ['ECE348-Distributed-Systems/project1'],
  multicast: ['ECE348-Distributed-Systems/project2'],
  nfs: ['ECE348-Distributed-Systems/project3'],
  runtime: ['ECE348-Distributed-Systems/project4'],
  scheduler: ['ECE318-Operating-Systems/Project2'],
  fuse: ['ECE318-Operating-Systems/Project3'],
  'busy-wait': ['ECE321-Concurrent-Programming/Project1'],
  semaphores: ['ECE321-Concurrent-Programming/Project2'],
  monitors: ['ECE321-Concurrent-Programming/Project3'],
  threads: ['ECE321-Concurrent-Programming/Project4'],
  uart: ['ECE333-Digital-Systems-Lab/Lab2'],
  vga: ['ECE333-Digital-Systems-Lab/Lab3'],
  spi: ['ECE333-Digital-Systems-Lab/Lab4'],
  gpgpu: ['GPGPU', 'ECE338-Parallel-Computer-Architecture'],
  'smith-waterman': ['ECE340-Embedded-Systems/Lab1', 'ECE340-Embedded-Systems/Lab2', 'ECE340-Embedded-Systems/Lab3'],
  house: ['ECE433-Computer-Graphics/homework-3-3d-house'],
  wifi: ['ECE436-Wireless-Communications/patches', 'ECE436-Wireless-Communications/scripts', 'ECE436-Wireless-Communications/run.sh'],
  rambo: ['ECE455-Hardware-Security'],
  cv32: ['ECE494-Microprocessor-Design'],
  'dvd-logo-fpga': ['DVD-Logo-FPGA'],
  'live-fpga-lab': ['Live-FPGA-Lab'],
};
const COURSEWORK = {
  'ECE115 Programming I': ['ECE115-Programming-I'],
  'ECE116 Programming II': ['ECE116-Programming-II'],
  'ECE119 Digital Design': ['ECE119-Digital-Design'],
  'ECE120 Engineering Drawing': ['ECE120-Engineering-Drawing'],
  'ECE216 Algorithms': ['ECE216-Algorithms'],
  'ECE219 Computer Organization': ['ECE219-Computer-Organization'],
  'ECE311 Databases': ['ECE311-Databases'],
  'ECE318 Project 1 (kernel)': ['ECE318-Operating-Systems/Project1'],
  'ECE333 Lab 1': ['ECE333-Digital-Systems-Lab/Lab1'],
  'ECE433 Homeworks 1–2': ['ECE433-Computer-Graphics/homework-1-rasterization-antialiasing', 'ECE433-Computer-Graphics/homework-2-polygon-fill-clipping'],
};
// Not Jason's code: bundled third-party trees and generated output.
const SKIP = /(^|\/)(\.git|node_modules|\.venv|venv|__pycache__|backports-[^/]+|\.Xil|build|dist|\.cache|vendor|example_designs)(\/|$)|(package-lock\.json|uv\.lock|\.rpt)$/;

const ext = (...e) => (f) => e.includes(extname(f.path).toLowerCase());
const name = (re) => (f) => re.test(basename(f.path));
const text = (re, filter = () => true) => (f) => filter(f) && re.test(f.text());
const CODE = ext('.c', '.h', '.cpp', '.cc', '.hpp', '.cu', '.cuh', '.cl', '.py', '.java', '.js', '.ts', '.sh', '.tcl', '.yml', '.yaml', '.toml', '.cfg', '.conf', '.json', '.xml', '.gradle', '.kts', '.sql', '.m', '.v', '.sv', '.svh', '.xdc', '.grc', '.s', '.asm', '.patch', '.ini', '.env', '.dockerfile');
const isCode = (f) => CODE(f) || /^(Makefile|Dockerfile|docker-compose.*|Kbuild|requirements.*\.txt|pyproject\.toml)$/i.test(basename(f.path));

const RULES = {
  C: (f) => ext('.c')(f) || (ext('.patch')(f) && /^\+\+\+ .*\.[ch]\b/m.test(f.text())),
  'C++': ext('.cpp', '.cc', '.hpp', '.cxx'),
  Python: (f) => ext('.py', '.ipynb')(f) || name(/^(requirements.*\.txt|pyproject\.toml)$/)(f),
  Java: ext('.java'),
  JavaScript: ext('.js', '.mjs', '.jsx'),
  // not in the brief's list yet: proposed to Jason (2026-10-21)
  TypeScript: (f) => ext('.ts', '.tsx')(f) && !f.path.endsWith('.d.ts'),
  React: text(/from ['"]react['"]|require\(['"]react['"]\)/, ext('.js', '.jsx', '.ts', '.tsx')),
  Tcl: ext('.tcl'),
  Bash: (f) => ext('.sh')(f) || (isCode(f) && /^#!.*\b(ba)?sh\b/.test(f.head())),
  MATLAB: ext('.m', '.mlx'),
  Verilog: ext('.v'),
  SystemVerilog: ext('.sv', '.svh'),
  CUDA: ext('.cu', '.cuh'),
  OpenCL: (f) => ext('.cl')(f) || text(/CL\/cl(2|_ext)?\.h|<CL\/|xrt|cl::Kernel|clCreateKernel/, ext('.c', '.cpp', '.h', '.hpp'))(f),
  OpenMP: text(/#pragma\s+omp|-fopenmp|<omp\.h>/, isCode),
  pthreads: text(/<pthread\.h>|-lpthread|-pthread\b/, isCode),
  // .xdc constraints and .xpr/.bd projects are Vivado's own formats; scripts that drive vivado/xsct/v++ count too
  'Vivado/Vitis': (f) => ext('.xpr', '.xsa', '.bd', '.xci', '.xdc')(f) || text(/\b(create_project|write_bitstream|launch_runs|vivado|vitis|xsct|create_bd_design)\b|v\+\+/i, isCode)(f),
  'Vitis HLS': text(/#pragma\s+HLS|vitis_hls/i, isCode),
  'ARM/Zynq': (f) => text(/zynq|ps7_|xparameters\.h|processing_system7|xc7z0/i, isCode)(f),
  'RISC-V': text(/riscv(32|64)?-|rv32[ie]|rv64|RISC-V ISA|\.option\s+norvc/i, isCode),
  // MIPS-only syntax: $-prefixed registers with syscall (RISC-V assembly uses bare register names)
  'MIPS assembly': (f) => ext('.s', '.asm')(f) && /\$(t|s|a|v)\d/.test(f.text()) && /\bsyscall\b/.test(f.text()),
  'Linux kernel modules': text(/\bobj-m\b|MODULE_LICENSE|module_init\(/, isCode),
  FUSE: text(/fuse\.h|FUSE_USE_VERSION|fuse_main/, isCode),
  Docker: name(/^(Dockerfile.*|docker-compose.*\.ya?ml|compose\.ya?ml)$/i),
  Traefik: text(/traefik/i, isCode),
  Nginx: text(/\bnginx\b/i, isCode),
  WireGuard: text(/wireguard|\bwg-quick\b/i, isCode),
  'Pi-hole': text(/pi-?hole/i, isCode),
  Ansible: text(/ansible/i, isCode),
  Proxmox: text(/proxmox|\bpvesh\b|\bqm\s/i, isCode),
  ath9k: text(/ath9k/i, isCode),
  'SDR (ADALM-PLUTO)': text(/pluto|adalm|ad936x|ip:192\.168\.2\.1|pyadi|adi\.Pluto/i, isCode),
  'GNU Radio': (f) => ext('.grc')(f) || text(/gnuradio/i, isCode)(f),
  PostgreSQL: text(/postgres|psycopg|\bpg_/i, isCode),
  MySQL: text(/mysql/i, isCode),
  MongoDB: text(/mongo(db|ose)?\b|pymongo/i, isCode),
  // real use, not a profiler's export format
  SQLite: text(/import sqlite3|sqlite3_open|"backend":\s*"sqlite3"|\.sqlite3?\b.*(connect|open)|CREATE TABLE/i, (f) => isCode(f) && !/nsys/.test(f.text())),
  Maven: name(/^pom\.xml$/),
  Gradle: name(/^(build|settings)\.gradle(\.kts)?$|^gradlew$/),
  OpenGL: text(/<GL\/|glut|glfw|glew|OpenGL/i, ext('.c', '.cpp', '.h', '.hpp')),
};

function walk(p) {
  if (!existsSync(p) || SKIP.test(p)) return [];
  const st = statSync(p);
  if (st.isFile()) {
    let cached;
    const read = () => (cached ??= st.size < 2_000_000 ? readFileSync(p, 'utf8') : '');
    return [{ path: p, text: read, head: () => read().slice(0, 200) }];
  }
  return readdirSync(p).flatMap((e) => walk(join(p, e)));
}

function scan(dirs) {
  const files = dirs.flatMap((d) => walk(join(R, d)));
  const found = {};
  for (const [tool, rule] of Object.entries(RULES)) {
    const hits = files.filter((f) => { try { return rule(f); } catch { return false; } });
    if (hits.length) found[tool] = { n: hits.length, eg: relative(R, hits[0].path) };
  }
  // every project lives in a Git repo (Jason: keep Git as a chip for now)
  if (dirs.some((d) => existsSync(join(R, d.split('/')[0], '.git')))) found.Git = { n: 1, eg: `${dirs[0].split('/')[0]} (repo)` };
  return found;
}

const out = ['# Skills evidence', '', `Generated by \`node scripts/skills-evidence.mjs\` on ${new Date().toISOString().slice(0, 10)} from the public repos cloned in \`research/\`. Each cell: number of matching files, and one example. "1" means a single file: check it is real use. Third-party trees (e.g. ECE436 Linux backports) are skipped.`, ''];
const section = (title, map) => {
  out.push(`## ${title}`, '', '| Project | Tools (files, example) |', '|---|---|');
  const result = {};
  for (const [k, dirs] of Object.entries(map)) {
    const f = scan(dirs);
    result[k] = Object.keys(f);
    out.push(`| ${k} | ${Object.entries(f).map(([t, v]) => `**${t}** ${v.n}${v.n === 1 && t !== 'Git' ? ' ⚠' : ''} (\`${v.eg}\`)`).join('<br>')} |`);
  }
  out.push('');
  return result;
};
const projects = section('Projects on the site', PROJECTS);
const coursework = section('Coursework not on the site (option B: named in the line, never counted)', COURSEWORK);
writeFileSync('docs/SKILLS_EVIDENCE.md', out.join('\n'));
writeFileSync('.gate/skills-evidence.json', JSON.stringify({ projects, coursework }, null, 1));
console.log(JSON.stringify({ projects, coursework }));
