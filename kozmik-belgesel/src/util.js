const $=s=>document.querySelector(s);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
let seed=1337;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function gauss(){return Math.sqrt(-2*Math.log(1-rnd()))*Math.cos(6.2831853*rnd())}
const PRM=new Uint8Array(512);(()=>{const p=[];for(let i=0;i<256;i++)p.push(i);for(let i=255;i>0;i--){const j=(rnd()*(i+1))|0;const t=p[i];p[i]=p[j];p[j]=t}for(let i=0;i<512;i++)PRM[i]=p[i&255]})();
function h3(i,j,k){return PRM[PRM[PRM[i&255]+(j&255)]+(k&255)]/255}
function vn(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
 const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const a=lerp(lerp(h3(xi,yi,zi),h3(xi+1,yi,zi),u),lerp(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v);
 const b=lerp(lerp(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),lerp(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v);
 return lerp(a,b,w)}
function fbm(x,y,z,o){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vn(x*f,y*f,z*f);n+=a;a*=.5;f*=2.03}return s/n}
const nf=(x,d)=>x.toLocaleString('tr-TR',{maximumFractionDigits:d==null?1:d,minimumFractionDigits:0});

function rowsHTML(r){return r.map(x=>'<div><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>').join('')}

export {$, PRM, clamp, fbm, gauss, h3, lerp, nf, rnd, rowsHTML, seed, sstep, vn};
