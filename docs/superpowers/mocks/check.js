// Fails unless: one content edge, trace clear of content, smooth pulse, no overflow.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'});
let fail=0;const bad=m=>{fail++;console.log('  FAIL',m)};
for(const f of process.argv.slice(3))for(const [w,h,mob] of [[390,844,true],[1440,900,false]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.argv[2]+f,{waitUntil:'networkidle'});await p.waitForTimeout(900);
 console.log(f,w);
 if(errs.length)bad('errors '+errs);
 const r=await p.evaluate((W)=>{
  const ov=Math.max(document.documentElement.scrollWidth,innerWidth)-W;
  const main=document.querySelector('main');const blocks=[...main.children,document.querySelector('.foot')].filter(Boolean);
  const lefts=[...new Set(blocks.map(e=>Math.round(e.getBoundingClientRect().left+parseFloat(getComputedStyle(e).paddingLeft)*0)))];
  const firstKids=[...main.children,document.querySelector('.foot')].filter(e=>e&&e.offsetParent&&!e.matches('.bus')).map(e=>Math.round(e.getBoundingClientRect().left));
  const svg=document.querySelector('svg.trace'),path=document.querySelector('.t-drawn');let hits=[];let traceX=null;
  if(path){const sb=svg.getBoundingClientRect();const L=path.getTotalLength();
   const boxes=[...document.querySelectorAll('main .card,main .w,main .read,main .ccard,main .cproj,main .rc,main .skx2,main .side .w,main .origin,main .mini a,main .board,main .cover,main .nums > div,main .gradebox,main figure,main .people,main .nextp a')].map(e=>e.getBoundingClientRect());
   for(let l=12;l<L;l+=10){const pt=path.getPointAtLength(l);const x=pt.x+sb.left,y=pt.y+sb.top;
    for(const bx of boxes){if(x>bx.left-6&&x<bx.right+6&&y>bx.top-6&&y<bx.bottom+6){hits.push([Math.round(x),Math.round(y+scrollY)]);break}}}
   traceX=Math.round(path.getPointAtLength(L).x+sb.left)}
  const contentLeft=Math.min(...[...main.querySelectorAll('h2,h1')].map(e=>e.getBoundingClientRect().left));
  return {ov,firstKids:[...new Set(firstKids)],hits:hits.slice(0,5),nHits:hits.length,traceX,contentLeft};},w);
 if(r.ov)bad('horizontal overflow '+r.ov);
 if(r.firstKids.length>1)bad('section content starts at different x: '+r.firstKids.join(','));
 if(r.nHits)bad('trace runs over content '+r.nHits+' samples, e.g. '+JSON.stringify(r.hits));
 if(r.traceX!=null&&r.contentLeft-r.traceX<28)bad('trace too close to content: gap '+(r.contentLeft-r.traceX));
 // pulse smoothness
 await p.evaluate(()=>{window.__l=[];const pu=document.querySelector('.t-pulse');(function f(){__l.push(parseFloat(pu&&pu.style.strokeDashoffset));requestAnimationFrame(f)})()});
 for(let i=0;i<30;i++){await p.mouse.wheel(0,70);await p.waitForTimeout(16)}
 await p.waitForTimeout(400);
 const l=await p.evaluate(()=>__l.filter(x=>!isNaN(x)));let j=0;for(let i=1;i<l.length;i++)if(l[i]-l[i-1]>30||l[i-1]-l[i]>30&&!(l[i]>l[i-1]))j++;
 let back=0;for(let i=1;i<l.length;i++){const d=l[i-1]-l[i];if(d<-5)back++}
 if(j>2)bad('pulse jumps '+j);
 // a real tap/click on the first skill chip must select it
 const pt=await p.evaluate(()=>{const c=document.querySelector('.skx2 .chip');if(!c)return null;c.scrollIntoView({block:'center',behavior:'instant'});const r=c.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
 if(pt){await p.waitForTimeout(250);if(mob)await p.touchscreen.tap(pt[0],pt[1]);else await p.mouse.click(pt[0],pt[1]);await p.waitForTimeout(150);
  if(await p.evaluate(()=>document.querySelector('.skx2 .chip').getAttribute('aria-pressed'))!=='true')bad('skill chip did not respond to a tap');}
 await p.close();}
console.log(fail?`${fail} FAILED`:'ALL PASS');await b.close();process.exit(fail?1:0)})();
