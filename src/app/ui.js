import {ST, physics, wfDist, wfKm} from './state.js';
import {_t, baseR, cam, flyTo, focusPos} from './camera.js';
import {$, clamp, lerp, nf, rowsHTML} from '../util.js';
import {PL} from '../scene/planets.js';
import {V3, camera} from '../scene/core.js';
import {sky} from '../scene/sky.js';
import {dailyFor, drawToday} from './astro.js';
import {CH_MOON, CH_SUN} from '../data/whatif.js';
import {MS} from '../data/milestones.js';
import {ZOD} from '../data/zodiac.js';
import {buildHolo, holos} from '../scene/zodiac3d.js';






















/* ---------- ARAYÜZ ---------- */
ST.hover=null;
function speak(t){if(!ST.voice||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='tr-TR';u.rate=.95;const v=speechSynthesis.getVoices().find(v=>/^tr/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){}}
const FI={sun:{ad:'Güneş',inf:[['Yarıçap','109 Dünya'],['Yüzey','~5.500 °C'],['Yaş','4,6 milyar yıl'],['Kütle','Sistemin %99,86’sı'],['Not','Hidrojeni heliuma çevirerek saniyede yaklaşık 4 milyon ton kütleyi ışımaya dönüştürür.']]},
 earth:{ad:'Dünya',inf:[['Güneş’e uzaklık','1 AU'],['Çap','12.742 km'],['Yıl','365,25 gün'],['Yüzey (ort.)','15 °C'],['Not','Yaşam bilinen tek gezegen; yüzeyinin yaklaşık %71’i su ile kaplı.']]},
 moon:{ad:'Ay',inf:[['Dünya’ya uzaklık','384.400 km'],['Çap','3.474 km'],['Yörünge süresi','27,3 gün'],['Yüzey','−173 ile 127 °C'],['Not','Yılda yaklaşık 3,8 cm uzaklaşır ve Dünya’ya hep aynı yüzünü döner.']]}};
function setFocus(f){ST.focus=f;cam.zoom=1;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x.dataset.f===f));const q=$('#plInfo');if(!q)return;
 const p=f[0]==='p'?PL[+f.slice(1)]:FI[f];
 if(p)q.innerHTML='<h3>'+p.ad+'</h3><dl class="stats">'+rowsHTML(p.inf.slice(0,4))+'</dl><p>'+p.inf[4][1]+'</p>';
 else if(f==='sys')q.innerHTML='<p>Tüm gezegenler yörüngeleriyle birlikte görünüyor. Mesafeler sıkıştırılmıştır; gerçekte Neptün Dünya’dan 30 kat uzaktadır.</p>';else q.innerHTML=''}
const TOUR=['sys','sun','p0','p1','earth','moon','p2','p3','p4','p5','p6'];
function stopTour(){ST.tour=false;ST.tourT=0;const t=$('#tourBtn');if(t)t.textContent='▶ Gezegen turunu başlat'}
function resetZod(){ST.zsel=-1;ST.zin=false;cam.fly=null;camera.fov=50;camera.updateProjectionMatrix();$('#warp').style.opacity=0;ST.holoD=.12;$('#zdBox').hidden=true;document.querySelectorAll('#zGrid button').forEach(b=>b.classList.remove('on'))}
function setMode(m){if(ST.mode==='zodyak'&&m!=='zodyak'){resetZod();cam.tp.set(0,0,0)}
 if(ST.mode==='gal'&&m!=='gal'){cam.th=ST.savTh;cam.ph=ST.savPh;camera.fov=50;camera.updateProjectionMatrix();cam.zoom=1;const o=baseR();cam.r=o;focusPos(_t);cam.tp.copy(_t)}
 if(m==='gal'&&ST.mode!=='gal'){ST.savTh=cam.th;ST.savPh=cam.ph;const c=sky.userData.core;cam.th=Math.atan2(c.z,c.x);cam.ph=Math.acos(clamp(c.y,-1,1));cam.zoom=1;cam.fly=null;$('#warp').style.opacity=0}
 if(m!=='gez')stopTour();
 ST.mode=m;$('#panel').dataset.m=m;ST.tlPlay=false;$('#tlPlay').textContent='▶ Oynat';
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
 $('#tl').style.display=m==='gal'?'none':'';
 if(m==='whatif')updateWf();if(m==='zaman'){ST.tlI=-1;updateTl()}
 if(m==='zodyak'){cam.zoom=1;setFocus('earth');drawToday()}
 if(m==='gez')setFocus(ST.focus[0]==='p'||ST.focus==='sys'?ST.focus:'sys');
 else if(m!=='gal'&&(ST.focus==='sys'||ST.focus[0]==='p'))setFocus('earth');
 if(m==='whatif'&&ST.focus!=='earth'&&ST.focus!=='sun'&&ST.focus!=='moon')setFocus('earth')}
/* Ya Olsaydı */
const PRE={sun:[['Mars',1.52],['Dünya',1],['Venüs',.72],['Merkür',.39],['Magma',.1],['Korona',.05],['Son Düşüş',.012]],moon:[['Bugün',384400],['Yarı mesafe',192200],['100.000 km',100000],['Roche eşiği',20000],['Parçalanma',12000]]};
const sInv={sun:d=>(Math.log10(d)+2)/(Math.log10(3)+2)*1000,moon:k=>(Math.log10(k)-Math.log10(9000))/(Math.log10(800000)-Math.log10(9000))*1000};
function buildPre(){const c=$('#wfPre');c.innerHTML='';PRE[ST.wfT].forEach(p=>{const b=document.createElement('button');b.textContent=p[0];b.onclick=()=>{ST.wfS[ST.wfT]=Math.round(sInv[ST.wfT](p[1]));$('#wf').value=ST.wfS[ST.wfT];updateWf()};c.appendChild(b)})}
function mix3(a,b,t){return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]}
const rgb=a=>'rgb('+a.map(v=>Math.round(clamp(v,0,255))).join(',')+')';
function drawSky(){const c=$('#sky'),g=c.getContext('2d'),W=c.width,H=c.height,sunM=ST.wfT==='sun';const d=sunM?wfDist():1,p=physics(d);
 let top=[40,90,170],bot=[150,200,240];const ht=p.heat;
 if(ht>0){const t1=clamp(ht,0,1),t2=clamp(ht-1,0,1);top=mix3(mix3(top,[200,110,50],t1),[90,20,10],t2);bot=mix3(mix3(bot,[255,190,110],t1),[255,90,20],t2)}
 top=mix3(top,[150,170,200],p.frozen*.8);bot=mix3(bot,[220,230,245],p.frozen*.8);
 const gr=g.createLinearGradient(0,0,0,H*.8);gr.addColorStop(0,rgb(top));gr.addColorStop(1,rgb(bot));g.fillStyle=gr;g.fillRect(0,0,W,H);
 const PX=8;const disc=(x,y,r,col,glow)=>{if(glow){const q=g.createRadialGradient(x,y,r*.6,x,y,r*2.6+10);q.addColorStop(0,col);q.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r*2.6+10,0,6.3);g.fill()}g.fillStyle=col;g.beginPath();g.arc(x,y,Math.max(r,1),0,6.3);g.fill()};
 const sd=.533/d;disc(sunM?W*.5:W*.78,H*.4,sd*PX/2,'rgba(255,250,230,1)',true);
 const md=sunM?.52:.52*384400/wfKm();disc(sunM?W*.16:W*.3,sunM?H*.28:H*.34,md*PX/2,'rgba(225,225,230,1)',false);
 g.fillStyle='rgba(8,10,16,.92)';g.beginPath();g.moveTo(0,H);g.lineTo(0,H*.82);for(let x=0;x<=W;x+=10)g.lineTo(x,H*.8+Math.sin(x*.05)*4+Math.sin(x*.13)*3);g.lineTo(W,H);g.fill();
 g.fillStyle='rgba(255,255,255,.8)';g.font='11px Inter,sans-serif';g.fillText(sunM?'Ay (bugünkü boyutu)':'Ay',sunM?W*.16+8:W*.3+6,sunM?H*.28+16:H*.34+(md*PX/2)+14);g.fillText('Güneş',(sunM?W*.5:W*.78)+4,H*.4+Math.min(sd*PX/2,H*.4)+14>H*.75?H*.7:H*.4+Math.min(sd*PX/2,H*.4)+14)}
function updateWf(){const sunM=ST.wfT==='sun';let rows,ch;
 if(sunM){const d=wfDist(),p=physics(d),P=Math.pow(d,1.5),v=29.8/Math.sqrt(d),ang=.533/d;
  $('#wfOut').textContent=nf(d,d<.1?3:2)+' AU · '+nf(d*149.6,1)+' milyon km';
  rows=[['Güneş ışığı',nf(1361*p.flux,0)+' W/m² (×'+nf(p.flux,2)+')'],['Denge sıcaklığı',nf(p.teq-273.15,0)+' °C'],['Tahmini yüzey',nf(p.ts-273.15,0)+' °C'],['Yörünge süresi',P<1?nf(P*365.25,0)+' gün':nf(P,2)+' yıl'],['Yörünge hızı',nf(v,1)+' km/sn'],['Güneş’in görünür çapı',nf(ang,2)+'° (Ay’ın '+nf(ang/.52,1)+' katı)']];
  ch=CH_SUN.find(c=>d>=c[0])}
 else{const km=wfKm();$('#wfOut').textContent=nf(km,0)+' km';
  rows=[['Uzaklık',nf(km/6371,1)+' Dünya yarıçapı'],['Gelgit kuvveti',nf(Math.pow(384400/km,3),1)+'× bugünkü'],['Ay’ın görünür çapı',nf(.52*384400/km,2)+'°'],['Yörünge süresi',nf(27.32*Math.pow(km/384400,1.5),1)+' gün'],['Işığın yolu',nf(km/299792,2)+' sn'],['Durum',km<18000?'Roche sınırının içinde':'Kararlı yörünge']];
  ch=CH_MOON.find(c=>km>=c[0])}
 $('#wfStats').innerHTML=rowsHTML(rows);$('#chTitle').textContent=ch[1];$('#chTxt').textContent=ch[2];drawSky();
 const key=ST.wfT+ch[1];if(key!==ST.chK){ST.chK=key;if(ST.mode==='whatif')speak(ch[1]+'. '+ch[2])}}
/* Zaman Çubuğu */
function fmtT(m){if(m.lbl)return m.lbl;const t=m.t,a=Math.abs(t);if(a<3000)return Math.round(2026+t)+' yılı';
 if(a>=1e9)return nf(a/1e9,2)+' milyar yıl '+(t<0?'önce':'sonra');if(a>=1e6)return nf(a/1e6,0)+' milyon yıl '+(t<0?'önce':'sonra');return nf(a,0)+' yıl önce'}
function ageStr(t){const age=Math.max(13.8e9+t,0);if(age>=1e9)return nf(age/1e9,2)+' milyar yıl';if(age>=1e6)return nf(age/1e6,1)+' milyon yıl';return nf(age/1e3,0)+' bin yıl'}
function updateTl(){const i=clamp(Math.round(ST.tl),0,MS.length-1);if(i===ST.tlI)return;ST.tlI=i;const m=MS[i];
 $('#tlEra').textContent=m.era;$('#tlName').textContent=m.ad;$('#tlTime').textContent=fmtT(m);
 $('#zmEra').textContent=m.era+' · '+fmtT(m);$('#zmTitle').textContent=m.ad;$('#zmTxt').textContent=m.txt;
 $('#zmStats').innerHTML=rowsHTML([['Evrenin yaşı',ageStr(m.t)],['Güneş',m.ph],['Dünya',m.dn],['Ay’ın uzaklığı',m.moon>.02?nf(m.mk,0)+' km':'Henüz yok']]);
 if(ST.mode==='zaman')speak(m.ad+'. '+m.txt)}
/* Zodyak */
function selectSign(i){if(cam.fly||ST.mode!=='zodyak')return;const z=ZOD[i];if(!holos[i])buildHolo(i);
 for(const k in holos){holos[k].visible=false}holos[i].userData.appear=0;ST.zsel=i;ST.zin=false;ST.holoD=.12;$('#zdDepth').textContent='Derinliği aç';
 $('#zdBox').hidden=false;$('#zdName').textContent=z.gl+'︎ '+z.ad;
 $('#zdStats').innerHTML=rowsHTML([['Tarih (tropikal)',z.tarih],['Element',z.el],['Yönetici gezegen',z.gez],['Parlak yıldız',z.yil]]);
 $('#zdDaily').innerHTML=dailyFor(i);$('#zdMit').textContent=z.mit;$('#zdKar').textContent=z.kar;$('#zdGok').textContent=z.gok;
 document.querySelectorAll('#zGrid button').forEach((b,k)=>b.classList.toggle('on',k===i));try{$('#panel').scrollTo({top:$('#zGrid').offsetTop-8,behavior:'smooth'})}catch(e){}
 const H=holos[i].position.clone(),dir=H.clone().normalize();flyTo(H.clone().addScaledVector(dir,-380),H.clone(),3.8,45,i,()=>{ST.zin=true});
 speak(z.ad+'. '+z.mit+' '+z.gok)}
function backToEarth(){if(cam.fly||ST.zsel<0)return;ST.zin=false;const r=95,sp=Math.sin(1.3);
 flyTo(new V3(r*sp*Math.cos(.9),r*Math.cos(1.3),r*sp*Math.sin(.9)),new V3(0,0,0),3,40,null,()=>{ST.zsel=-1;cam.th=.9;cam.ph=1.3;document.querySelectorAll('#zGrid button').forEach(b=>b.classList.remove('on'))})}
function setupUI(){
 document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
 const pc=$('#plChips');[['sys','Güneş Sistemi'],['sun','Güneş'],['p0','Merkür'],['p1','Venüs'],['earth','Dünya'],['moon','Ay'],['p2','Mars'],['p3','Jüpiter'],['p4','Satürn'],['p5','Uranüs'],['p6','Neptün']].forEach(a=>{const b=document.createElement('button');b.dataset.f=a[0];b.textContent=a[1];pc.appendChild(b)});
 document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{if(ST.mode==='gal'||(ST.mode==='zodyak'&&ST.zsel>=0))return;const f=b.dataset.f;if((f==='sys'||f[0]==='p')&&ST.mode!=='gez'&&ST.mode!=='kesif'&&ST.mode!=='zaman')return;stopTour();setFocus(f)});
 $('#tourBtn').onclick=()=>{if(ST.tour){stopTour();return}ST.tour=true;ST.tourI=0;ST.tourT=0;$('#tourBtn').textContent='❚❚ Turu durdur';setFocus(TOUR[0])};
 drawToday();setInterval(()=>{if(ST.mode==='zodyak')drawToday()},60000);
 $('#voice').onclick=()=>{ST.voice=!ST.voice;$('#voice').textContent='Anlatıcı: '+(ST.voice?'açık':'kapalı');$('#voice').classList.toggle('on',ST.voice);if(!ST.voice&&'speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}else{ST.chK='';if(ST.mode==='whatif')updateWf()}};
 $('#pToggle').onclick=()=>{const p=$('#panel');p.classList.toggle('min');$('#pToggle').textContent=p.classList.contains('min')?'Paneli göster':'Paneli gizle'};
 document.querySelectorAll('#wfTarget button').forEach(b=>b.onclick=()=>{ST.wfT=b.dataset.t;document.querySelectorAll('#wfTarget button').forEach(x=>x.classList.toggle('on',x===b));$('#wf').value=ST.wfS[ST.wfT];buildPre();ST.chK='';updateWf()});
 $('#wf').oninput=e=>{ST.wfS[ST.wfT]=+e.target.value;updateWf()};buildPre();
 const zg2=$('#zGrid');ZOD.forEach((z,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+z.gl+'︎</b>'+z.ad;b.onclick=()=>selectSign(i);zg2.appendChild(b)});
 $('#zdBack').onclick=backToEarth;$('#zdDepth').onclick=()=>{ST.holoD=ST.holoD>.5?.12:1;$('#zdDepth').textContent=ST.holoD>.5?'Düzleştir':'Derinliği aç'};
 const tr=$('#tlRange');tr.max=MS.length-1;tr.value=ST.tl;
 const ER={'Kozmik Şafak':'#ffb066','Galaktik Çağ':'#8f7bff','Güneş Sistemi':'#ffd36b','Yaşam':'#6fe08a','İnsanlık':'#6fc8ff','Bugün':'#ffffff','Gelecek':'#ff6b57'};
 const N=MS.length-1,stops=[];MS.forEach((m,i)=>{const a=Math.max(0,(i-.5)/N*100),b=Math.min(100,(i+.5)/N*100);stops.push(ER[m.era]+' '+a+'%',ER[m.era]+' '+b+'%')});
 const stl=document.createElement('style');stl.textContent='#tlRange::-webkit-slider-runnable-track{background:linear-gradient(90deg,'+stops.join(',')+');opacity:.8}#tlRange::-moz-range-track{background:linear-gradient(90deg,'+stops.join(',')+');opacity:.8}';document.head.appendChild(stl);
 const tk=$('#tlTicks');MS.forEach((m,i)=>{const t=document.createElement('i');t.style.left=(i/N*100)+'%';t.title=m.ad;t.onclick=()=>{setMode('zaman');ST.tl=i;tr.value=i;updateTl()};tk.appendChild(t)});
 tr.oninput=()=>{if(ST.mode!=='zaman')setMode('zaman');ST.tlPlay=false;$('#tlPlay').textContent='▶ Oynat';ST.tl=+tr.value;updateTl()};
 $('#tlPlay').onclick=()=>{if(ST.mode!=='zaman'){setMode('zaman')}ST.tlPlay=!ST.tlPlay;if(ST.tlPlay&&ST.tl>=N-.01){ST.tl=0}$('#tlPlay').textContent=ST.tlPlay?'❚❚ Durdur':'▶ Oynat'};
 $('#tlNow').onclick=()=>{ST.tl=MS.findIndex(m=>m.ad==='Bugün');tr.value=ST.tl;ST.tlI=-1;setMode('kesif');const m=MS[Math.round(ST.tl)];$('#tlEra').textContent=m.era;$('#tlName').textContent=m.ad;$('#tlTime').textContent=fmtT(m)};
 const m0=MS[Math.round(ST.tl)];$('#tlEra').textContent=m0.era;$('#tlName').textContent=m0.ad;$('#tlTime').textContent=fmtT(m0);
}

export {FI, PRE, TOUR, ageStr, backToEarth, buildPre, drawSky, fmtT, mix3, resetZod, rgb, sInv, selectSign, setFocus, setMode, setupUI, speak, stopTour, updateTl, updateWf};
