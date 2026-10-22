import {MS} from '../data/milestones.js';
import {Col} from '../scene/core.js';
import {clamp, lerp, sstep} from '../util.js';






/* ---------- DURUM ---------- */
const ST={mode:'kesif',focus:'earth',wfT:'sun',wfS:{sun:807,moon:837},tl:MS.length-6,tlPlay:false,zsel:-1,voice:false,chK:'',holoD:0};
ST.tl=MS.findIndex(m=>m.ad==='Bugün');
const CUR={sun:1,pw:1,heat:0,frozen:0,life:1,lights:1,cloud:.55,earth:1,moon:1,lk:Math.log(384400),stars:1,gal:1,neb:0,flash:0,melt:0};
const TT=Object.assign({},CUR),CC={sc:new Col('#ffe2b0'),fc:new Col('#ffffff'),cc:new Col('#ffffff'),atm:new Col('#5a9bff')},TC={sc:new Col('#ffe2b0'),fc:new Col('#ffffff'),cc:new Col('#ffffff'),atm:new Col('#5a9bff')};
const K_W=new Col('#ffffff'),K_VEN=new Col('#f1d9a0'),K_ASH=new Col('#3a1c14'),K_BL=new Col('#5a9bff'),K_OR=new Col('#ffa050'),K_RD=new Col('#ff4a1a'),K_IC=new Col('#b8d8ff'),K_SUN=new Col('#ffe2b0');
const AU_KM=149.6e6;
function physics(d){const flux=1/(d*d),teq=255/Math.sqrt(d);const lf=Math.log2(flux);
 const heat=clamp(lf,0,1)+clamp((lf-1)/2,0,1),frozen=clamp(-lf/1.5,0,1);let ts;
 if(frozen>=1||flux<1)ts=teq+(flux<.35?0:33*clamp((flux-.35)/.65,0,1));
 else if(heat<=1)ts=lerp(teq+33,teq*2.45,heat);else ts=teq*lerp(2.45,1,clamp(Math.log10(flux/8)/2,0,1));
 return{flux:flux,teq:teq,heat:heat,frozen:frozen,ts:ts}}
function skin(h,f){if(h<=1)TC.cc.copy(K_W).lerp(K_VEN,h);else TC.cc.copy(K_VEN).lerp(K_ASH,clamp(h-1,0,1));
 if(h<=1)TC.atm.copy(K_BL).lerp(K_OR,h);else TC.atm.copy(K_OR).lerp(K_RD,clamp(h-1,0,1));TC.atm.lerp(K_IC,f)}
function wfDist(){const s=ST.wfS.sun/1000;return Math.pow(10,lerp(-2,Math.log10(3),s))}
function wfKm(){const s=ST.wfS.moon/1000;return Math.pow(10,lerp(Math.log10(9000),Math.log10(800000),s))}
function target(){
 TT.sun=1;TT.pw=1;TT.heat=0;TT.frozen=0;TT.life=1;TT.lights=1;TT.cloud=.55;TT.earth=1;TT.moon=1;TT.lk=Math.log(384400);TT.stars=1;TT.gal=1;TT.neb=0;TT.flash=0;TT.melt=0;
 TC.sc.copy(K_SUN);TC.fc.copy(K_W);skin(0,0);
 if(ST.mode==='whatif'){
  if(ST.wfT==='sun'){const d=wfDist(),p=physics(d);TT.sun=1/d;TT.pw=clamp(Math.pow(p.flux,.3),.45,2.6);TT.heat=p.heat;TT.frozen=p.frozen;TT.cloud=p.heat<=1?.55+.35*p.heat:.85;
   TT.life=1-clamp(p.heat-.3,0,1);TT.lights=(1-sstep(.2,.6,p.heat))*(1-p.frozen*.5);TT.melt=sstep(.02,.008,d);skin(p.heat,p.frozen)}
  else TT.lk=Math.log(wfKm())}
 else if(ST.mode==='zaman'){const u=clamp(ST.tl,0,MS.length-1),i=Math.min(Math.floor(u),MS.length-2),f=sstep(0,1,u-i),a=MS[i],b=MS[i+1];
  ['sun','pw','earth','heat','frozen','life','lights','cloud','moon','stars','gal','neb','flash'].forEach(k=>{TT[k]=lerp(a[k],b[k],f)});
  TT.lk=lerp(Math.log(a.mk),Math.log(b.mk),f);TC.sc.copy(a.sc).lerp(b.sc,f);TC.fc.copy(a.fc).lerp(b.fc,f);skin(TT.heat,TT.frozen)}
}

export {AU_KM, CC, CUR, K_ASH, K_BL, K_IC, K_OR, K_RD, K_SUN, K_VEN, K_W, ST, TC, TT, physics, skin, target, wfDist, wfKm};
