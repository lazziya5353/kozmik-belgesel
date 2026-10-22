import {$} from '../util.js';
import {CITIES} from '../data/cities.js';
import {ZOD, ELCOL} from '../data/zodiac.js';
import {mod360, moonLon, signIdx, sunLon} from './astro.js';
import {ST} from './state.js';
import {setPin} from '../scene/earth.js';

const R=Math.PI/180;
const ASC_TXT=[
'Koç yükselen: Ortama enerjiyle, doğrudan ve cesur girersin. İlk izlenimin atılgan ve hareketlidir; harekete geçmeyi beklemeyi sevmezsin.',
'Boğa yükselen: Sakin, güven veren ve sabırlı bir duruşun var. Konfor, güzellik ve istikrar ilk bakışta fark edilen yanındır.',
'İkizler yükselen: Meraklı, konuşkan ve çevik görünürsün. İnsanlar seni esprili ve ilgi çekici bulur; aynı anda birçok şeye bakarsın.',
'Yengeç yükselen: Temkinli, sıcak ve koruyucu bir ilk izlenim verirsin. Duygularını hemen göstermesen de çevrene şefkat yayarsın.',
'Aslan yükselen: Karizmatik ve gösterişli bir varlığın var. Odaya girdiğinde fark edilirsin; cömertlik ve özgüven öne çıkar.',
'Başak yükselen: Düzenli, dikkatli ve ölçülü görünürsün. Ayrıntıları yakalar, ilk bakışta mütevazı ve işe yarar biri olarak algılanırsın.',
'Terazi yükselen: Zarif, nazik ve diplomatik bir tavrın var. Uyum ve estetik arar, insanlarla kolay iletişim kurarsın.',
'Akrep yükselen: Yoğun, gizemli ve etkileyici bir bakışın var. Az konuşur, çok gözlemlersin; derinlik ilk izlenimde hissedilir.',
'Yay yükselen: Açık sözlü, iyimser ve özgür ruhlu görünürsün. Macera, öğrenme ve yeni ufuklar seni çeker.',
'Oğlak yükselen: Ciddi, sorumluluk sahibi ve kararlı bir duruşun var. Yaşından olgun algılanabilir; hedeflerine adım adım yürürsün.',
'Kova yükselen: Özgün, bağımsız ve biraz farklı görünürsün. Kalıpların dışında düşünür, insanlara mesafeli ama arkadaşça yaklaşırsın.',
'Balık yükselen: Yumuşak, hayalperest ve sezgisel bir havan var. Çevrendekilerin ruh halini hızla hisseder, empati kurarsın.'];
const SUN_TXT=i=>ZOD[i].ad+' burcunda Güneş: '+ZOD[i].kar;
const MOON_EL={Ateş:'Duygularını hızlı yaşar, coşkuyla ifade edersin.',Toprak:'Duygusal olarak sağlam basmak, güven ve rutin istersin.',Hava:'Duygularını düşünerek, konuşarak ve paylaşarak işlersin.',Su:'Derin ve sezgisel hissedersin; ortamın havasını kolayca emersin.'};

/* Yerel saati (IANA dilimi) UTC'ye çevir; tarihsel yaz saati kayıtlarını Intl bilir */
function tzOffset(ms,tz){const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)),o={};f.forEach(p=>o[p.type]=+p.value);
 return Date.UTC(o.year,o.month-1,o.day,o.hour,o.minute,o.second)-Math.floor(ms/1000)*1000}
function localToUtc(y,mo,d,h,mi,tz){const g=Date.UTC(y,mo-1,d,h,mi);let u=g-tzOffset(g,tz);u=g-tzOffset(u,tz);return new Date(u)}
function calcAsc(date,lat,lon){const jd=date.getTime()/86400000+2440587.5,d=jd-2451545,T=d/36525;
 const gmst=mod360(280.46061837+360.98564736629*d+.000387933*T*T),ramc=mod360(gmst+lon)*R,eps=(23.4392911-.0130042*T)*R,phi=lat*R;
 const asc=mod360(Math.atan2(Math.cos(ramc),-(Math.sin(ramc)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps)))/R);
 const mc=mod360(Math.atan2(Math.sin(ramc),Math.cos(ramc)*Math.cos(eps))/R);
 return{asc,mc,sun:sunLon(T),moon:moonLon(d)}}
const fmtDeg=l=>{const m=mod360(l)%30,d=Math.floor(m),mm=Math.floor((m-d)*60);return d+'° '+String(mm).padStart(2,'0')+'′'};

function drawWheel(res){const c=$('#ascWheel'),W=320,dpr=Math.min(devicePixelRatio||1,3);c.width=c.height=W*dpr;c.style.aspectRatio='1';const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 const cx=W/2,R0=W*.47,R1=W*.37,R2=W*.2;g.clearRect(0,0,W,W);
 // Yükselen burç sol tarafta (doğu ufku); zodyak saat yönünün tersine ilerler
 const ang=l=>Math.PI-(mod360(l)-res.asc)*R;
 g.lineWidth=1;
 ZOD.forEach((z,i)=>{const a0=ang(i*30),a1=ang(i*30+30),am=ang(i*30+15);
  g.beginPath();g.arc(cx,cx,R0,a0,a1,true);g.arc(cx,cx,R1,a1,a0,false);g.closePath();g.fillStyle=ELCOL[z.el]?ELCOL[z.el]+'26':'rgba(160,185,255,.08)';g.fill();g.strokeStyle='rgba(160,185,255,.4)';g.stroke();
  g.fillStyle='#e8ecf6';g.font='20px "Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(z.gl+'︎',cx+Math.cos(am)*(R0+R1)/2,cx-Math.sin(am)*(R0+R1)/2)});
 // evler (eşit)
 for(let h=0;h<12;h++){const a=ang(res.asc+h*30);g.strokeStyle=h%3===0?'rgba(255,196,104,.9)':'rgba(160,185,255,.25)';g.lineWidth=h%3===0?1.6:1;g.beginPath();g.moveTo(cx+Math.cos(a)*R2,cx-Math.sin(a)*R2);g.lineTo(cx+Math.cos(a)*R1,cx-Math.sin(a)*R1);g.stroke();
  const am=ang(res.asc+h*30+15);g.fillStyle='rgba(180,195,230,.8)';g.font='11px Inter,sans-serif';g.fillText(h+1,cx+Math.cos(am)*(R2+R1)/2,cx-Math.sin(am)*(R2+R1)/2)}
 g.strokeStyle='rgba(160,185,255,.35)';g.beginPath();g.arc(cx,cx,R2,0,7);g.stroke();
 const pt=(l,sym,col,rr)=>{const a=ang(l);g.fillStyle=col;g.beginPath();g.arc(cx+Math.cos(a)*(R1-4),cx-Math.sin(a)*(R1-4),3.4,0,7);g.fill();g.font='17px "Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans",sans-serif';g.fillText(sym,cx+Math.cos(a)*rr,cx-Math.sin(a)*rr)};
 pt(res.sun,'☉','#ffc468',R1-20);pt(res.moon,'☽','#cfe3ff',R1-38);
 g.fillStyle='#ffc468';g.font='600 12px Inter,sans-serif';g.textAlign='right';g.fillText('YÜK',cx-R0-2+18,cx-12);g.textAlign='center';g.fillText('MC',cx+Math.cos(ang(res.mc))*(R2-12),cx-Math.sin(ang(res.mc))*(R2-12))}

function fillCities(){const s=$('#ascCity');if(s.options.length)return;CITIES.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=c.ad;s.appendChild(o)});s.value=CITIES.findIndex(c=>c.ad.startsWith('İstanbul'))}
function save(o){try{localStorage.setItem('kb-asc',JSON.stringify(o))}catch(e){}}
function load(){try{return JSON.parse(localStorage.getItem('kb-asc')||'null')}catch(e){return null}}
function compute(){const v=$('#ascDate').value,t=$('#ascTime').value,ci=+$('#ascCity').value;if(!v||!t)return;const c=CITIES[ci],[y,m,d]=v.split('-').map(Number),[h,mi]=t.split(':').map(Number);
 const u=localToUtc(y,m,d,h,mi,c.tz),res=calcAsc(u,c.lat,c.lon);save({v,t,ci});setPin(c.lat,c.lon,true);
 const ai=signIdx(res.asc),si=signIdx(res.sun),mi2=signIdx(res.moon);$('#ascOut').hidden=false;
 $('#ascStats').innerHTML=[['Yükselen',ZOD[ai].gl+'︎ '+ZOD[ai].ad+' '+fmtDeg(res.asc)],['Güneş',ZOD[si].gl+'︎ '+ZOD[si].ad+' '+fmtDeg(res.sun)],['Ay',ZOD[mi2].gl+'︎ '+ZOD[mi2].ad+' '+fmtDeg(res.moon)],['Tepe noktası (MC)',ZOD[signIdx(res.mc)].ad+' '+fmtDeg(res.mc)],['UTC anı',u.toISOString().slice(0,16).replace('T',' ')]].map(r=>'<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>').join('');
 $('#ascName').textContent=ZOD[ai].ad+' yükselen';$('#ascText').textContent=ASC_TXT[ai];
 $('#ascSun').textContent=SUN_TXT(si);$('#ascMoon').textContent=ZOD[mi2].ad+' burcunda Ay ('+ZOD[mi2].el+'): '+MOON_EL[ZOD[mi2].el];
 drawWheel(res);return res}
let wired=false;
function enterAsc(){ST.live=true;fillCities();const s=load();if(s){$('#ascDate').value=s.v;$('#ascTime').value=s.t;$('#ascCity').value=s.ci}
 if(!wired){wired=true;$('#ascForm').onsubmit=e=>{e.preventDefault();compute()}}
 if(s&&s.v)compute()}
function leaveAsc(){ST.live=false;setPin(0,0,false)}
export {calcAsc, compute, enterAsc, leaveAsc, localToUtc};
