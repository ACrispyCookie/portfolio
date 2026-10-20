import json, re
D = '/tmp/claude-1000/-home-jason-portfolio-claude/5bc4e837-ba1f-4739-996f-e2a14793ec72/scratchpad/'
wire = open(D + 'wire/index.html').read()

HEAD = '''<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="board.css">
'''

def topbar(cur=None, home=''):
    items = [('Projects', home + '#projects'), ('Timeline', home + '#timeline'), ('Skills', home + '#skills'), ('Contact', home + '#contact')]
    nav = ''.join(f'<a href="{h}"' + (' aria-current="page"' if n == cur else '') + f'>{n}</a>' for n, h in items)
    sheet = ''.join(f'<a href="{h}">{n}</a>' for n, h in items) + '<a href="https://fpga.njason.dev">Live FPGA Lab</a>'
    return f'''<header class="topbar"><div class="in">
  <a class="name" href="{home or '#top'}">Jason Nikas</a>
  <nav aria-label="Main">{nav}</nav>
  <a class="labpill" href="https://fpga.njason.dev"><i class="led"></i><span>Live <span class="lg">FPGA </span>Lab</span></a>
  <details class="menu"><summary>Menu</summary><div class="sheet">{sheet}</div></details>
</div></header>'''

FOOT = '''<footer class="foot">
  <div><b>Jason Nikas</b><p>Electrical and Computer Engineering, University of Thessaly</p></div>
  <div class="links"><a href="https://github.com/ACrispyCookie">GitHub</a><a href="https://www.linkedin.com/in/jason-nikas-b64163255">LinkedIn</a><a href="#contact">Email</a><a href="https://acrispycookie.dev">Older portfolio</a></div>
  <small><span>© 2026 Jason Nikas</span><span>Built with Astro, self-hosted</span></small>
</footer>
<p class="mocknote">Styled mock in the circuit-board direction. A throwaway preview, not the real build. Live lab values are an example state; pictures come from the project repos.</p>'''

AV = {'JN': 'av-jn.jpg', 'DT': 'av-TsiantosD.jpg', 'PT': 'av-PANAGIVTHS.jpg', 'PB': 'av-Balamotakos.jpg', 'TV': 'av-Tvangos.jpg'}
NAMES = {'JN': 'Jason Nikas', 'DT': 'Dimitrios Tsiantos', 'PT': 'Panagiotis Nikolaos Tsogkas', 'PB': 'Panagiotis Balamotis', 'TV': 'Tvangos'}
def av(*ids):
    return '<div class="av">' + ''.join(f'<img src="{AV[i]}" alt="{NAMES[i]}" width="30" height="30">' for i in ids) + '</div>'

def media(kind, src, alt, cls=''):
    if kind == 'video':
        return f'<div class="media{cls}"><video src="{src}" poster="{src[:-4]}.jpg" autoplay muted loop playsinline aria-label="{alt}"></video></div>'
    return f'<div class="media{cls}"><img src="{src}" alt="{alt}" loading="lazy"></div>'

RUNTIME_SVG = '''<div class="media"><svg class="drawn" viewBox="0 0 320 200" role="img" aria-label="Diagram: a running program moving from one machine to another">
<rect width="320" height="200" fill="#183539"/>
<rect x="28" y="58" width="104" height="84" rx="16" fill="#11282d" stroke="#3b7a82" stroke-width="2"/><rect x="188" y="58" width="104" height="84" rx="16" fill="#11282d" stroke="#3b7a82" stroke-width="2"/>
<rect x="46" y="80" width="40" height="40" rx="10" fill="#2c5f66"/><rect x="210" y="80" width="40" height="40" rx="10" fill="#41e2f2"/>
<path d="M90 100 C130 100 150 100 204 100" fill="none" stroke="#d8b46a" stroke-width="3" stroke-dasharray="6 7" stroke-linecap="round"/><circle cx="204" cy="100" r="5" fill="#d8b46a"/>
<text x="80" y="164" fill="#9db6b8" font-size="12" text-anchor="middle" font-family="Hanken Grotesk">machine A</text><text x="240" y="164" fill="#9db6b8" font-size="12" text-anchor="middle" font-family="Hanken Grotesk">machine B</text></svg></div>'''
THREADS_SVG = '''<div class="media"><svg class="drawn" viewBox="0 0 320 200" role="img" aria-label="Diagram: three threads taking turns on one CPU">
<rect width="320" height="200" fill="#183539"/>
<g font-family="Hanken Grotesk" font-size="12" fill="#9db6b8"><text x="24" y="62">T1</text><text x="24" y="106">T2</text><text x="24" y="150">T3</text></g>
<g stroke-linecap="round" stroke-width="14"><path d="M56 58 H110 M200 58 H236" stroke="#41e2f2"/><path d="M114 102 H160 M240 102 H290" stroke="#d8b46a"/><path d="M164 146 H196" stroke="#86e3bd"/></g>
<path d="M56 176 H296" stroke="#3b7a82" stroke-width="2"/><g fill="#3b7a82"><circle cx="112" cy="176" r="4"/><circle cx="162" cy="176" r="4"/><circle cx="198" cy="176" r="4"/><circle cx="238" cy="176" r="4"/></g></svg></div>'''
HOMELAB_SVG = '''<div class="media"><svg class="drawn" viewBox="0 0 320 200" role="img" aria-label="Service categories running on the homelab">
<rect width="320" height="200" fill="#183539"/>
<g font-family="Hanken Grotesk" font-size="13" fill="#eaf2f1">
<rect x="22" y="30" width="132" height="40" rx="20" fill="#11282d"/><text x="88" y="55" text-anchor="middle">FPGA lab</text>
<rect x="166" y="30" width="132" height="40" rx="20" fill="#11282d"/><text x="232" y="55" text-anchor="middle">Web services</text>
<rect x="22" y="80" width="132" height="40" rx="20" fill="#11282d"/><text x="88" y="105" text-anchor="middle">Media and files</text>
<rect x="166" y="80" width="132" height="40" rx="20" fill="#11282d"/><text x="232" y="105" text-anchor="middle">Remote access</text>
<rect x="22" y="130" width="132" height="40" rx="20" fill="#11282d"/><text x="88" y="155" text-anchor="middle">Automation</text>
<rect x="166" y="130" width="132" height="40" rx="20" fill="#11282d"/><text x="232" y="155" text-anchor="middle">Monitoring</text></g>
<circle cx="22" cy="50" r="5" fill="#5dffa8"/></svg></div>'''

def card(title, head, tag, grade, team, med, href='#', flag=False, extra=''):
    t = f'<a class="tag" href="course.html"><b>{tag}</b>Grade {grade}</a>' if grade else f'<span class="tag"><b>{tag}</b></span>'
    tm = av(*team) if len(team) > 1 else '<span class="tag">Solo</span>'
    return f'''<article class="card{' flag' if flag else ''}">{med}
  <div class="body"><h3><a href="{href}">{title}</a></h3><p class="head">{head}</p>{extra}
  <div class="meta">{t}{tm}</div></div></article>'''

def skills(tools, title='Skills', lead='Tools from my projects. The number is how many projects on this site use each one.', self='', sid='skills'):
    ch = ''.join(f'<button class="chip" type="button" aria-pressed="false">{x}</button>' for x in tools)
    return f'''<section class="sec" id="{sid}">
  <h2 data-pad>{title}</h2>
  <p class="lead">{lead}</p>
  <div class="skx2" data-self="{self}"><div class="chips">{ch}</div><button class="more btn g s" type="button" hidden>Show all</button><p class="usedline" aria-live="polite"></p></div>
</section>'''

CONTACT = '''<section class="sec" id="contact">
  <h2 data-pad>Contact</h2>
  <div class="ccard">
    <div class="cl"><p class="lead" style="margin:0">Questions about a project, or want to talk? Email me.</p>
      <div class="mail"><span id="em">nikasjason1@gmail.com</span><button class="btn g s" id="cp" type="button">Copy</button></div></div>
    <div class="cr"><a class="clink" href="https://github.com/ACrispyCookie"><b>GitHub</b><small>ACrispyCookie</small></a><a class="clink" href="https://www.linkedin.com/in/jason-nikas-b64163255"><b>LinkedIn</b><small>Jason Nikas</small></a><a class="clink" href="https://acrispycookie.dev"><b>Older portfolio</b><small>acrispycookie.dev</small></a></div>
  </div>
</section>'''

SCRIPTS = '''<script src="site.js"></script>
<script>
const cp=document.getElementById('cp');if(cp)cp.onclick=e=>{const t=document.getElementById('em').textContent;
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{e.target.textContent='Copied'}).catch(()=>{const r=document.createRange();r.selectNodeContents(document.getElementById('em'));const s=getSelection();s.removeAllRanges();s.addRange(r);e.target.textContent='Selected, press copy'})};
</script>'''

# report card
C = [("ECE494","Processor Design",10,"CV32E40P timing"),("ECE436","Wireless Communications",10,"Wi-Fi jammer"),("ECE433","Computer Graphics",10,"3D house"),("ECE318","Operating Systems",10,"Deduplicating filesystem"),("ECE321","Concurrent Programming",10,"User-level threads"),("ECE415","High Performance Computing",9.5,"N-body"),("ECE455","Hardware Security",9.5,"RAMBO air-gap"),("ECE348","Distributed Systems",9.5,"Distributed runtime"),("ECE338","Parallel Computer Architecture",9,"GPGPU"),("ECE333","Digital Systems",9,"DVD Logo FPGA"),("ECE340","Embedded Systems",8.5,"Smith-Waterman")]
rc = ''.join(f'<li><b>{c}</b><span class="bars"><i style="width:{g*10}%"></i></span><span>{g:g}</span><small>{n}, <a href="course.html">{p}</a></small></li>' for c, n, g, p in C)

# other projects groups from wireframe
gi = wire.index('<div class="groups">'); ge = wire.index('</section>', gi)
groups = wire[gi:ge].rsplit('</div>', 0)[0]
groups = groups.replace('<a href="#">', '<a href="course.html">')
groups = re.sub(r'<a href="course.html">([^<]+)<small>', r'<a href="course.html"><b>\1</b><small>', groups)

# timeline from wireframe
ti = wire.index('<div class="tlw"'); te = wire.index('<p class="note">Each bar', ti)
tl = wire[ti:te].replace(' · ', ', ')
tl = tl.replace('<span class="lanehead">Education</span>', '<span class="lanehead e1">Education</span>').replace('<span class="lanehead">Work</span>', '<span class="lanehead e2">Work</span>').replace('<span class="lanehead">Teaching</span>', '<span class="lanehead e3">Teaching</span>')
G0, G1, GK = 15, 40, 4
def fm(a):
    a = float(a)
    if a <= G0: return a
    if a >= G1: return a - (G1 - G0) + GK
    return G0 + (a - G0) * GK / (G1 - G0)
def _ev(m):
    a, n = float(m.group(1)), float(m.group(2))
    return f'--a:{fm(a):g};--n:{fm(a + n) - fm(a):g}'
tl = re.sub(r'--a:([\d.]+);--n:([\d.]+)', _ev, tl)
tl = re.sub(r'top:calc\(([\d.]+) \* var\(--m\)\)', lambda m: f'top:calc({fm(m.group(1)):g} * var(--m))', tl)
tl = re.sub(r'--months:(\d+)', lambda m: f'--months:{fm(m.group(1)):g}', tl)
tl = re.sub(r'<span style="top:calc\([\d.]+ \* var\(--m\)\)">2024</span>', '', tl)
BRK = f'<b class="brk" aria-hidden="true" style="top:calc({G0 + 1.4} * var(--m));height:calc({GK - 1.4} * var(--m))"></b>'
tl = tl.replace('<div class="lane">', '<div class="lane">' + BRK)
tl = tl.replace('<b>ColonyMC</b>', '<b><a href="https://acrispycookie.dev">ColonyMC</a></b>')

SK = "CUDA, RISC-V, Verilog, SystemVerilog, C, C++, OpenMP, OpenCL, pthreads, Python, Java, JavaScript, Bash, MATLAB, Vivado/Vitis, Vitis HLS, ARM/Zynq, MIPS assembly, Linux kernel modules, FUSE, OpenGL, Docker, Proxmox, Traefik, Nginx, WireGuard, Pi-hole, Ansible, ath9k, SDR (ADALM-PLUTO), GNU Radio, PostgreSQL, MySQL, MongoDB, SQLite, Git, Maven, Gradle".split(", ")
chips = ''.join(f'<button class="chip" aria-pressed="{"true" if i == 0 else "false"}">{x}</button>' for i, x in enumerate(SK))
P = {'nbody': ["N-body on GPUs", "ECE415", "nbody.jpg"], 'conv': ["CUDA convolution", "ECE415", "plot-senator.jpg"], 'clahe': ["CLAHE", "ECE415", "plot-planet_surface.jpg"], 'gpgpu': ["RISC-V GPGPU", "ECE338", "gpgpu-block.jpg"], 'cv32': ["CV32E40P timing", "ECE494", "cv32.jpg"], 'house': ["Explorable 3D house", "ECE433", "house.jpg"], 'fuse': ["Deduplicating filesystem", "ECE318", "fuse.jpg"], 'wifi': ["Wi-Fi jammer", "ECE436", "wifi.jpg"], 'rambo': ["RAMBO air-gap", "ECE455", "rambo.jpg"], 'lab': ["Live FPGA Lab", "Personal", "lab.jpg"], 'dvd': ["DVD Logo FPGA", "Personal", "dvd.jpg"], 'homelab': ["Homelab", "Personal", ""], 'mc': ["Minecraft plugins", "acrispycookie.dev", ""]}
M = {"CUDA": ['nbody', 'conv', 'clahe'], "RISC-V": ['gpgpu', 'cv32'], "OpenGL": ['house'], "FUSE": ['fuse'], "ath9k": ['wifi'], "SDR (ADALM-PLUTO)": ['rambo'], "GNU Radio": ['rambo'], "Java": ['mc'], "Maven": ['mc'], "Gradle": ['mc'], "Vivado/Vitis": ['gpgpu', 'dvd'], "ARM/Zynq": ['gpgpu', 'lab'], "Verilog": ['dvd'], "Docker": ['homelab', 'lab'], "Traefik": ['homelab', 'lab']}
for t in ["Proxmox", "Nginx", "WireGuard", "Pi-hole", "Ansible"]: M[t] = ['homelab']

home = f'''{HEAD.format(title="Jason Nikas")}
{topbar()}
<div class="wrap" id="top" data-trace>
<main>
<section class="hero" aria-label="About me">
  <div class="top">
    <div class="lcol">
    <div class="cover"><img src="fuji.jpg" width="1200" height="1200" alt="Jason from behind, facing Mount Fuji at dusk"></div>
    <div class="now" data-trace-start><p>Currently working on</p>
      <a class="w" href="project.html"><div class="t" style="background-image:url(gpgpu-block.jpg)"></div><div><h3>GPGPU v2</h3><p>Graphics, DDR, warp scheduling</p></div></a>
      <a class="w" href="#"><div class="t">{HOMELAB_SVG.replace('class="media"', 'style="height:100%"')}</div><div><h3>Homelab</h3><p>Web, media, remote access, monitoring</p></div></a>
    </div>
    </div>
    <div class="rcol">
    <div class="who">
      <h1>Jason<br>Nikas</h1>
      <p class="does">I build systems from code down to hardware: GPUs on FPGAs, CUDA programs, operating systems and distributed systems.</p>
      <p class="school">Electrical and Computer Engineering student at the University of Thessaly</p>
      <div class="row cta"><a class="btn p" href="#projects">See my projects</a><a class="btn g" href="https://github.com/ACrispyCookie"><svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>GitHub</a><a class="btn g" href="https://www.linkedin.com/in/jason-nikas-b64163255"><svg width="17" height="17" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M0 1.15C0 .52.53 0 1.18 0h13.64C15.47 0 16 .52 16 1.15v13.7c0 .63-.53 1.15-1.18 1.15H1.18C.53 16 0 15.48 0 14.85V1.15zm4.94 12.24V6.17H2.54v7.22h2.4zM3.74 5.18c.84 0 1.36-.55 1.36-1.25-.02-.71-.52-1.25-1.34-1.25-.82 0-1.36.54-1.36 1.25 0 .7.52 1.25 1.33 1.25h.01zm4.91 8.21V9.36c0-.22.02-.43.08-.58.17-.43.57-.88 1.23-.88.87 0 1.21.66 1.21 1.62v3.87h2.4V9.25c0-2.22-1.18-3.25-2.76-3.25-1.27 0-1.84.7-2.16 1.19v.02h-.02l.02-.02V6.17h-2.4c.03.68 0 7.22 0 7.22h2.4z"/></svg>LinkedIn</a></div>
    </div>
    <div class="side">
    <div class="board" aria-live="polite">
      <div class="hdr"><span><i class="led"></i>Live FPGA Lab</span><div class="pins" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
      <p class="what">A real FPGA board in my homelab. Anyone can run demos on it from the browser.</p>
      <div class="runrow"><div class="running"><small>Running now</small><b>GPGPU n-body</b><span>on the Smart Zynq SL</span></div>
      <div class="foot2"><a class="btn live" href="https://fpga.njason.dev">Open the lab</a><div class="row"><span class="tag">Queue <b>1</b></span><span class="tag"><b>47 °C</b></span></div></div></div>
      <p class="note">Example state; the real panel reads the live stream</p>
    </div>
    </div>
    </div>
  </div>
</section>


<section class="sec" id="glance">
  <h2 data-pad>At a glance</h2>
  <div class="glance">
    <div class="read"><b>27</b><span>projects on this site, 10 main and 17 smaller</span></div>
    <div class="read"><b>4</b><span>volunteer teaching-assistant roles since 2025</span></div>
    <div class="read"><b>8</b><span>courses graded 9.5 or higher, each with a project on this site</span></div>
  </div>
  <details class="rc"><summary>Course grades <span>11 courses</span></summary><ul>{rc}</ul></details>
</section>

<section class="sec" id="projects">
  <h2 data-pad>Projects</h2>
  <p class="lead">Course projects, most of them built in teams.</p>
  <div class="grid feat">
    <article class="card wide">{media('img', 'gpgpu-block.jpg', 'Block design of the GPGPU on the Zynq')}
      <div class="body"><h3><a href="project.html">RISC-V GPGPU</a></h3>
        <p class="head">32 RISC-V cores we designed, running on a real FPGA</p>
        <p class="lead2">Runs an n-body step 2.38× faster than the ARM core on the same chip. My colleagues now use it on the Smart Zynq SL, and it runs live in the FPGA lab.</p>
        <div class="meta"><a class="tag" href="course.html"><b>ECE338</b>Grade 9</a><div class="row"><a class="btn live" href="https://fpga.njason.dev">Run the demo</a>{av('JN','DT','PT')}</div></div></div></article>
    {card('N-body on GPUs', '2,910× faster than the single-core version', 'ECE415', '9.5', ['JN','DT','PT'], media('video', 'nbody.mp4', 'Galaxy simulation'), 'course.html#nbody', True)}
    {card('RAMBO air-gap', "Read data from a computer with no network, using only its memory's radio noise", 'ECE455', '9.5', ['JN','DT','PT'], media('img', 'rambo.jpg', 'The receiver setup next to the target laptop'), '#', True)}
    {card('Wi-Fi jammer', 'One modified Wi-Fi card cut its neighbour from 87.7 to 0.02 Mbit/s', 'ECE436', '10', ['JN','DT','PB'], media('img', 'wifi.jpg', 'Throughput of the fair and unfair stations over time', ' paper'), '#', True)}
    {card('Explorable 3D house', 'A 3D engine we wrote from scratch in C++ and OpenGL', 'ECE433', '10', ['JN','PT'], media('img', 'house.jpg', 'The house in daylight'), '#', True)}
  </div>
  <div class="grid compact">
    {card('Distributed runtime', 'Running programs move between machines without stopping', 'ECE348', '9.5', ['JN'], RUNTIME_SVG)}
    {card('User-level threads', 'A thread library with its own preemptive scheduler, written from scratch', 'ECE321', '10', ['JN','PT','TV'], THREADS_SVG)}
  </div>
  <h3 class="subgrid-h">Personal projects</h3>
  <p class="lead" style="margin-top:-8px">Built on my own, outside any course.</p>
  <div class="grid">
    {card('Live FPGA Lab', 'A real FPGA board anyone can use from the browser', 'Personal', None, ['JN'], media('img', 'lab.jpg', 'The lab dashboard').replace('<img ','<img style="object-position:left top" '), 'https://fpga.njason.dev').replace('<span class="tag">Solo</span>', '<span class="tag"><i class="led"></i>Live</span>')}
    {card('DVD Logo FPGA', 'The bouncing DVD logo, drawn by hardware and steered by tilting the board', 'From ECE333', None, ['JN'], media('video', 'dvd.mp4', 'The DVD logo bouncing on a monitor driven by the FPGA')).replace('<span class="tag">Solo</span>', '')}
    {card('Homelab', 'The servers at home that run my services and the FPGA lab', 'Personal', None, ['JN'], HOMELAB_SVG).replace('<span class="tag">Solo</span>', '')}
  </div>
  <a class="origin" href="https://acrispycookie.dev">
    <div class="blk" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="6" fill="#2c5f66"/><rect x="4" y="4" width="32" height="11" rx="4" fill="#86e3bd"/><rect x="12" y="20" width="6" height="6" fill="#0b1d21"/><rect x="22" y="20" width="6" height="6" fill="#0b1d21"/></svg></div>
    <div><h3>Where I started: Minecraft plugins</h3><p>From 2019 to 2023 I wrote Java plugins, first for my own server, ColonyMC, which reached 20–30 players, then as a freelancer for other servers.</p></div>
    <span class="btn g">See them on acrispycookie.dev</span>
  </a>
</section>

<section class="sec" id="other">
  <h2 data-pad>Other projects</h2>
  <p class="lead">Smaller course projects, grouped by course. Each opens its section on the course page.</p>
  {groups}
</section>

<section class="sec" id="timeline">
  <h2 data-pad>Timeline</h2>
  <p class="lead">Education, work and teaching on one time axis. I was picked as a volunteer TA in each course for my grade.</p>
  {tl}
</section>

{skills(SK)}


{CONTACT}
</main>
{FOOT}
</div>
{SCRIPTS}'''
open(D + 'styled/index.html', 'w').write(home)
print('home ok')
