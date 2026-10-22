import {$} from '../util.js';
import {ZOD} from '../data/zodiac.js';
import {dailyFor, hashStr, signIdx, skyNow} from './astro.js';
import {ST} from './state.js';

const COLS=[['Kırmızı','#ff5a4a'],['Turuncu','#ff9a3c'],['Altın sarısı','#ffc468'],['Zümrüt yeşili','#38c98a'],['Turkuaz','#3fd8d0'],['Gök mavisi','#5aa8ff'],['Lacivert','#4a62d8'],['Mor','#a58bff'],['Pembe','#ff7ab8'],['Beyaz','#f2f4ff']];
/* Her burç için o güne özgü; aynı gün içinde sabit kalan "şanslı" değerler */
function lucky(i){const d=new Date(),key=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'-'+ZOD[i].ad;
 const c=COLS[hashStr(key+'c')%COLS.length],n=1+hashStr(key+'n')%99;let k=hashStr(key+'k')%12;if(k===i)k=(k+6)%12;return{col:c,num:n,mate:ZOD[k]}}
function hideCard(){const c=$('#dayCard');if(c)c.hidden=true}
function showCard(i){const c=$('#dayCard');if(!c)return;const z=ZOD[i],L=lucky(i),S=ST.sky||skyNow(new Date()),dt=new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'});
 c.innerHTML='<div class="hd"><span class="gl">'+z.gl+'︎</span><div><h3>'+z.ad+'</h3><small>'+dt+' · Günlük yorum</small></div><button class="x" aria-label="Kapat">×</button></div>'
 +'<div class="lk"><span><i style="background:'+L.col[1]+'"></i>Şanslı renk: '+L.col[0]+'</span><span>Şanslı sayı: '+L.num+'</span><span>Uyumlu burç: '+L.mate.gl+'︎ '+L.mate.ad+'</span></div>'
 +dailyFor(i)+'<small>Ay şu an '+ZOD[signIdx(S.moon)].ad+' burcunda · '+S.phase+'. Yorumlar eğlence amaçlı bir anlatıdır.</small>';
 c.querySelector('.x').onclick=hideCard;c.hidden=false;c.scrollTop=0}
export {hideCard, showCard, lucky};
