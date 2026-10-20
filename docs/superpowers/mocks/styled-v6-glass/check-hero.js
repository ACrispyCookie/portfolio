const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'});
const S=process.argv[2];
for(const [w,h,m] of [[1440,900,false],[1280,720,false],[1024,768,false],[390,844,true]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m,deviceScaleFactor:1});
await p.goto('file://'+S+'_t_index.html',{waitUntil:'networkidle'});await p.waitForTimeout(900);
const pill=()=>p.evaluate(()=>getComputedStyle(document.querySelector('.labpill')).visibility+'/'+getComputedStyle(document.querySelector('.labpill')).opacity);
const cov=await p.evaluate(()=>{const r=document.querySelector('.cover').getBoundingClientRect(),i=document.querySelector('.cover img').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),Math.round(i.width),Math.round(i.height)]});
const unlitTop=await p.evaluate(()=>[...document.querySelectorAll('main>section:not(.hero)')].filter(s=>s.getBoundingClientRect().top<innerHeight&&!s.classList.contains('lit')).map(s=>s.id));
await p.screenshot({path:S+`v5h-${w}.png`});
const p0=await pill();
await p.mouse.move(w/2,h/2);for(let i=0;i<8;i++){await p.mouse.wheel(0,250);await p.waitForTimeout(120)}
await p.waitForTimeout(700);const p1=await pill();
await p.screenshot({path:S+`v5s-${w}.png`});
for(let i=0;i<120;i++){await p.mouse.wheel(0,300);await p.waitForTimeout(40)}
await p.waitForTimeout(900);
const notLit=await p.evaluate(()=>[...document.querySelectorAll('main>section:not(.hero)')].filter(s=>!s.classList.contains('lit')).map(s=>s.id));
console.log(w,'cover',cov,'pill top',p0,'after scroll',p1,'unlit in first view',unlitTop,'unlit at end',notLit);
await p.close()}
await b.close()})();
