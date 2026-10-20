const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'});
const S=process.argv[2];let bad=0;
for(const [w,h,m] of [[1440,900,false],[1280,720,false],[1100,800,false],[1024,768,false],[800,1000,false],[760,1000,true],[390,844,true],[360,640,true]]){
const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m});
await p.goto('file://'+S+'_t_index.html',{waitUntil:'networkidle'});await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const els=['.cover','.who','.side','.top .now'].map(s=>[s,document.querySelector(s).getBoundingClientRect()]);const out=[];
for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i][1],c=els[j][1];if(a.left<c.right-1&&c.left<a.right-1&&a.top<c.bottom-1&&c.top<a.bottom-1)out.push(els[i][0]+' x '+els[j][0])}return out});
const sl=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
console.log(w, r.length?'OVERLAP '+r.join(', '):'ok', sl>0?'hscroll '+sl:'');bad+=r.length+(sl>0);await p.close()}
console.log(bad?'FAIL':'PASS');await b.close()})();
