const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'});
for(const f of process.argv.slice(3)){const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('file://'+process.argv[2]+f,{waitUntil:'networkidle'});await p.waitForTimeout(600);
const r=await p.evaluate(()=>{
 const rgb=s=>{const m=s.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
 const lum=([r,g,b])=>{const c=[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 const out=[];
 document.querySelectorAll('body *').forEach(e=>{if(!e.offsetParent&&e.tagName!=='BODY')return;
  const own=[...e.childNodes].some(n=>n.nodeType==3&&n.textContent.trim());if(!own)return;
  const cs=getComputedStyle(e);let fg=rgb(cs.color);
  let a=e,bg=null;while(a){const c=rgb(getComputedStyle(a).backgroundColor);if(c[3]===undefined||c[3]>0.9){bg=c;break}if(getComputedStyle(a).backgroundImage!=='none'&&a!==document.body){bg=null;break}a=a.parentElement}
  if(!bg){return}
  const L1=lum(fg),L2=lum(bg);const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;const need=(size>=24||(size>=18.66&&bold))?3:4.5;
  if(ratio<need)out.push([e.tagName+'.'+e.className,e.textContent.trim().slice(0,30),ratio.toFixed(2),cs.color,getComputedStyle(a).backgroundColor])});
 return out});
console.log(f,r.length?r:'contrast OK');await p.close()}
await b.close()})();
