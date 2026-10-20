import html, re, sys
sys.path.insert(0, '/tmp/claude-1000/-home-jason-portfolio-claude/5bc4e837-ba1f-4739-996f-e2a14793ec72/scratchpad/styled')
exec(open('/tmp/claude-1000/-home-jason-portfolio-claude/5bc4e837-ba1f-4739-996f-e2a14793ec72/scratchpad/styled/gen.py').read().split("# report card")[0])
DOCTYPE = '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
D = '/tmp/claude-1000/-home-jason-portfolio-claude/5bc4e837-ba1f-4739-996f-e2a14793ec72/scratchpad/styled/'

def hl(src):
    out = []
    for line in src.split('\n'):
        e = html.escape(line)
        m = re.search(r'//.*$', e)
        cm = ''
        if m: cm = f'<span class="cm">{m.group(0)}</span>'; e = e[:m.start()]
        e = re.sub(r'(#pragma[^\n]*)', r'<span class="pp">\1</span>', e)
        e = re.sub(r'\b(__shared__|float|int|for)\b', r'<span class="k">\1</span>', e)
        e = re.sub(r'\b(__ldg|fmaf|rsqrtf|__syncthreads)\b', r'<span class="fn">\1</span>', e)
        e = re.sub(r'(?<![\w#])(\d+)(?!\w)', r'<span class="nu">\1</span>', e)
        out.append(e + cm)
    return '\n'.join(out)

SCRIPT_TOC = '''<script>
const links=[...document.querySelectorAll('.toc a')];
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')=='#'+e.target.id))}})},{rootMargin:'-30% 0px -60% 0px'});
document.querySelectorAll('.pbody section').forEach(s=>io.observe(s));
</script>'''

person = lambda i, sub: f'<a class="person" href="#"><img src="{AV[i]}" alt=""><div><b>{NAMES[i]}</b><small>{sub}</small></div></a>'

project = f'''{HEAD.format(title="RISC-V GPGPU")}
{topbar(None, 'index.html')}
<div class="wrap" data-trace><main class="railed" style="gap:56px">
<header class="phead">
  <p class="crumb"><a href="course.html">ECE338 Parallel Computer Architecture</a> / RISC-V GPGPU</p>
  <h1 data-pad>RISC-V GPGPU</h1>
  <p class="lead">32 RISC-V cores we designed, running on a real FPGA</p>
  <div class="row"><span class="tag"><b>ECE338</b>Grade 9</span><span class="tag">Team of 3</span><span class="tag"><i class="led"></i>Live demo</span><span class="tag">Version 2 in progress</span></div>
  <div class="row"><a class="btn live" href="https://fpga.njason.dev">Run the demo</a><a class="btn g" href="https://github.com/ACrispyCookie/GPGPU">Code</a><a class="btn g" href="https://github.com/PANAGIVTHS/ECE338-Parallel-Computer-Architecture">Team repo</a></div>
</header>
<figure class="hero-media"><img src="gpgpu-block.jpg" alt="Block design of the GPGPU next to the Zynq processing system"><figcaption>The GPGPU wired to the Zynq's ARM core, in Vivado's block design</figcaption></figure>
<div class="nums">
  <div><b class="cy">2.38×</b><span>faster than the ARM core on the same chip, for one n-body step</span></div>
  <div><b>32</b><span>RISC-V cores running in lockstep</span></div>
  <div><b>1/17</b><span>of the ARM core's clock speed</span></div>
  <div><b>88%</b><span>of the FPGA's logic (LUTs) in use</span></div>
</div>
<div class="layout">
  <nav class="toc" aria-label="On this page"><a href="#what" class="on">What it is</a><a href="#hard">Why it's hard</a><a href="#how">How it works</a><a href="#results">Results</a><a href="#test">How we tested it</a><a href="#mine">My part</a><a href="#nextv">What's next</a><a href="#tools">Tools</a><a href="#team">Team</a></nav>
  <div class="pbody">
    <section id="what"><h2 data-pad>What it is</h2><p>A small processor for parallel work, built from 32 RISC-V cores that all run the same instruction at the same time. The Zynq chip's ARM core sends it a program and data, and it runs the work on all 32 cores at once.</p><p>We first ran it on a ZedBoard. It now also runs on the Smart Zynq SL, where my colleagues use it, and it is one of the two demos in my live FPGA lab.</p></section>
    <section id="hard"><h2 data-pad>Why it's hard</h2><p>Every core has to stay in step with the others, every result has to match a reference model, and the whole design has to fit on one FPGA and still meet timing. It uses 88% of the chip's logic.</p></section>
    <section id="how"><h2 data-pad>How it works</h2><ul><li>One shared fetch and decode stage feeds 32 lanes running in lockstep.</li><li>Each lane has a 5-stage pipeline with hazard detection and forwarding, plus a pipelined multiplier.</li><li>A crossbar connects the lanes to dual-port block RAM.</li><li>The ARM core talks to the GPGPU over AXI GPIO, after a UART inside the FPGA logic proved unreliable.</li></ul>
</section>
    <section id="results"><h2 data-pad>Results</h2><p>One step of a 32-body n-body simulation, GPGPU at about 38.5 MHz against the ZedBoard's ARM Cortex-A9 at about 667 MHz.</p>
      <div class="bars2" role="img" aria-label="Time per n-body step: GPGPU 129 microseconds, ARM Cortex-A9 308 microseconds">
        <div class="b"><span>GPGPU, 38.5 MHz</span><span class="t"><i style="width:41.9%;background:var(--cyan)"></i></span><span>129 µs</span></div>
        <div class="b"><span>Cortex-A9, 667 MHz</span><span class="t"><i style="width:100%;background:var(--cu2)"></i></span><span>308 µs</span></div>
      </div>
      <p>That is 2.38× faster at about a seventeenth of the clock. Peak throughput is about 1.23 billion integer operations per second, and data memory moves 307 MB/s. The slowest part is the UART link to the host, at about 11.5 KB/s.</p></section>
    <section id="test"><h2 data-pad>How we tested it</h2><ul><li>A Python golden model that every result is checked against.</li><li>Constrained-random tests and an instruction fuzzer.</li><li>End-to-end tests running real programs on the board.</li></ul></section>
    <section id="mine"><h2 data-pad>My part</h2><p>We designed and built it together. I went deeper on the communication between the host and the GPGPU.</p></section>
    <section id="nextv"><h2 data-pad>What's next</h2><p>Version 2 adds graphics, DDR memory, branch divergence and warp scheduling.</p></section>
    <section id="team"><h2 data-pad>Team</h2><div class="people">{person('JN','GitHub')}{person('DT','GitHub, website')}{person('PT','GitHub')}</div></section>
  </div>
</div>
{skills(['RISC-V','Vivado/Vitis','ARM/Zynq','Python'], 'Tools', 'What this project was built with. Pick one to see where else I used it.', 'gpgpu', 'tools')}
<nav class="nextp" aria-label="More projects"><a href="#"><small>Previous project</small><b>Live FPGA Lab</b></a><a href="course.html#nbody"><small>Next project</small><b>N-body on GPUs</b></a></nav>
</main>
{FOOT}
</div>
{SCRIPTS}
{SCRIPT_TOC}'''
open(D + 'project.html', 'w').write(DOCTYPE + project)

code = hl(open(D + 'excerpt.cu').read())
DOC = '<div class="doc" aria-hidden="true">' + '<i></i>' * 14 + '</div>'
def tabs(pid, title, ov, how, res, codehtml, rep):
    T = [('ov', 'Overview'), ('how', 'How it works'), ('res', 'Results'), ('code', 'Code'), ('rep', 'Report')]
    bt = ''.join(f'<button role="tab" aria-selected="{"true" if k == "ov" else "false"}" data-p="{k}">{n}</button>' for k, n in T)
    return f'''<div class="tabs" role="tablist" aria-label="{title}">{bt}</div>
<div class="panel" data-p="ov">{ov}</div><div class="panel" data-p="how">{how}</div><div class="panel" data-p="res">{res}</div><div class="panel one" data-p="code">{codehtml}</div><div class="panel one" data-p="rep" id="{pid}-rep">{rep}</div>'''
def rep(t):
    return f'<div class="rep">{DOC}<div class="txt" style="display:grid;gap:10px"><b style="font:700 1.2rem var(--disp)">{t}: project report</b><p style="color:var(--dim)">PDF. A cleaned copy, without student IDs or other students\' names.</p><div class="row"><a class="btn p" href="#">Read the report</a><a class="btn g" href="#">Download</a></div></div></div>'
def nocode(f):
    return f'<p style="color:var(--dim)">A short excerpt from {f} goes here, with a link to the file on GitHub.</p>'
TEAM = av('JN', 'DT', 'PT')
def cproj(pid, n, title, big, tools, main, body):
    acts = ('<a class="btn p" href="project.html">Read the full page</a>' if main else '') + '<a class="btn g" href="https://github.com/ACrispyCookie">Code</a>' + f'<a class="btn g" href="#{pid}-rep" data-rep>Report</a>'
    tg = ''.join(f'<span class="tag"><b>{t}</b></span>' for t in tools)
    return f'''<section class="cproj{' main' if main else ''}" id="{pid}">
<div class="cph"><div><p class="k2">Project {n} of 5</p><h2 data-pad>{title}</h2><p class="big">{big}</p><div class="row" style="margin-top:12px">{tg}<span class="tag">Team of 3</span>{TEAM}</div></div><div class="acts">{acts}</div></div>
{body}</section>'''

nb = cproj('nbody', 5, 'N-body on GPUs', '2,910× faster than the single-core version', ['CUDA', 'OpenMP'], True, tabs('nbody', 'N-body',
  '<div class="gal"><video src="nbody.mp4" poster="nbody.jpg" autoplay muted loop playsinline aria-label="Galaxy simulation"></video><div class="paper2"><img src="nbody-chart.jpg" alt="Throughput by version"></div><div><img src="nbody.jpg" alt="A frame of the galaxy"></div></div><div class="txt"><p>A galaxy simulation where every body pulls on every other body. We started from a single-core C program and made it faster step by step, ending on four NVIDIA Tesla K80 GPUs at once.</p><p>Each step was measured against the one before, so every change had to earn its place.</p></div>',
  '<div class="txt"><ol><li>OpenMP on the CPU: 72×</li><li>A first, naive GPU version: 197×</li><li>Shared-memory tiling: 369×</li><li>Read-only cache and fused multiply-add: 571×</li><li>Spread over four GPUs: 2,175×</li><li>Removing branch divergence: 2,910×</li></ol></div><figure><div class="fr paper"><img src="nbody-chart.jpg" alt="Throughput of each version"></div><figcaption>Throughput of each version, in billions of interactions per second.</figcaption></figure>',
  '<figure><div class="fr paper"><img src="nbody-chart.jpg" alt="Throughput of each version"></div><figcaption>Final version: about 431 billion interactions per second.</figcaption></figure><div class="txt"><p><b>From 293.3 s to 0.0997 s</b> for the same run: 2,910× faster than the sequential CPU code and 40× faster than the OpenMP version.</p><p>Measured on a server with four NVIDIA Tesla K80 GPUs.</p></div>',
  f'<div class="codebox"><div class="cbar"><span>Lab5/src/10_divergence_coar4.cu</span><a href="https://github.com/ACrispyCookie">View on GitHub</a></div><pre class="code"><code>{code}</code></pre></div><p style="color:var(--dim)">The force kernel: each block loads a tile of bodies into shared memory once, then every thread reuses it for its own bodies.</p>',
  rep('N-body on GPUs')))
cl = cproj('clahe', 4, 'CLAHE', '1,334 megapixels per second on a Tesla K80', ['CUDA'], False, tabs('clahe', 'CLAHE',
  '<div class="gal"><div class="paper2"><img src="plot-planet_surface.jpg" alt="Throughput by version on one test image"></div></div><div class="txt"><p>Contrast enhancement that works tile by tile, moved to the GPU and tuned version by version.</p></div>',
  '<div class="txt"><p>The steps, each with what it changed.</p></div>', '<div class="txt"><p><b>1,334 megapixels per second</b> on a Tesla K80, about 24× the CPU version.</p></div>', nocode('the CLAHE kernel'), rep('CLAHE')))
cv = cproj('conv', 3, 'CUDA convolution', 'Up to 16.97× faster than the CPU', ['CUDA'], False, tabs('conv', 'CUDA convolution',
  '<div class="gal"><div class="paper2"><img src="conv-runtime.jpg" alt="Runtime by image size"></div></div><div class="txt"><p>Image filtering with a 2D convolution, moved from the CPU to an NVIDIA Tesla K80.</p></div>',
  '<div class="txt"><p>The steps, each with what it changed.</p></div>', '<div class="txt"><p><b>Up to 16.97× faster</b> than the CPU version, on a Tesla K80.</p></div>', nocode('the convolution kernel'), rep('CUDA convolution')))
km = cproj('kmeans', 2, 'K-means', '17.31× faster with 56 threads', ['OpenMP', 'C'], False, tabs('kmeans', 'K-means',
  '<div class="txt"><p>Clustering parallelised with OpenMP.</p></div><div></div>', '<div class="txt"><p>The steps, each with what it changed.</p></div>', '<div class="txt"><p><b>17.31× faster</b> with 56 threads.</p></div>', nocode('the parallel loop'), rep('K-means')))
sb = cproj('sobel', 1, 'Sobel filter', '21.49× faster than the original C code', ['C'], False, tabs('sobel', 'Sobel filter',
  '<div class="txt"><p>Edge detection on a 4096×4096 image, tuned step by step on an Intel Core i5-1235U.</p></div><div></div>', '<div class="txt"><p>The steps, each with what it changed.</p></div>', '<div class="txt"><p><b>21.49× faster</b> than the original C code.</p></div>', nocode('the inner loop'), rep('Sobel filter')))

steps = ''.join(f'<a href="#{i}"><i></i><small>Project {n}</small><b>{t}</b></a>' for i, n, t in [('sobel', 1, 'Sobel filter'), ('kmeans', 2, 'K-means'), ('conv', 3, 'CUDA convolution'), ('clahe', 4, 'CLAHE'), ('nbody', 5, 'N-body on GPUs')])
course = f'''{HEAD.format(title="ECE415 High Performance Computing")}
{topbar(None, 'index.html')}
<div class="wrap" data-trace><main class="railed" style="gap:48px">
<header class="chead"><div><p class="crumb"><a href="index.html#projects">Projects</a> / ECE415</p><h1 data-pad>High Performance Computing</h1>
  <p class="intro">Five projects that build on each other, from tuning C code on one CPU to running a galaxy simulation on four GPUs at once.</p></div>
  <div class="gradebox"><b>9.5</b><span>course grade</span></div></header>
<nav class="steps" aria-label="The five projects in order">{steps}</nav>
{nb}{cl}{cv}{km}{sb}
{skills(['CUDA','OpenMP','C'], 'Tools', 'What this course\'s projects were built with. Pick one to see every project that uses it.', '', 'tools')}
</main>
{FOOT}
</div>
{SCRIPTS}
<script>
document.documentElement.classList.add('js');
document.querySelectorAll('.cproj').forEach(p=>{{const tabs=p.querySelectorAll('[role=tab]'),pans=p.querySelectorAll('.panel[data-p]');
 const show=k=>{{tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.p==k));pans.forEach(x=>x.classList.toggle('on',x.dataset.p==k))}};
 tabs.forEach(t=>t.onclick=()=>show(t.dataset.p));show('ov');
 const r=p.querySelector('[data-rep]');if(r)r.onclick=()=>show('rep')}});
</script>'''
open(D + 'course.html', 'w').write(DOCTYPE + course)
print('pages ok')
