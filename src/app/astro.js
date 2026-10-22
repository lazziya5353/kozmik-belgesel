import {$, rowsHTML} from '../util.js';
import {ELCOL, ZOD} from '../data/zodiac.js';
import {ST} from './state.js';







/* ---------- BUGÜNÜN GÖĞÜ (efemeris) VE GÜNLÜK YORUM ---------- */
const EPL={Merkür:[.38709843,0,.20563661,.00002123,7.00559432,-.00590158,252.25166724,149472.67486623,77.45771895,.15940013,48.33961819,-.12214182],
Venüs:[.72332102,-.00000026,.00676399,-.00005107,3.39777545,.00043494,181.9797085,58517.8156026,131.76755713,.05679648,76.67261496,-.27274174],
Dünya:[1.00000018,-.00000003,.01673163,-.00003661,-.00054346,-.01337178,100.46691572,35999.37306329,102.93005885,.3179526,-5.11260389,-.24123856],
Mars:[1.52371243,.00000097,.09336511,.00009149,1.85181869,-.00724757,-4.56813164,19140.29934243,-23.91744784,.45223625,49.71320984,-.26852431],
Jüpiter:[5.20248019,-.00002864,.0485359,.00018026,1.29861416,-.00322699,34.33479152,3034.90371757,14.27495244,.18199196,100.29282654,.13024619],
Satürn:[9.54149883,-.00003065,.05550825,-.00032044,2.49424102,.00451969,50.07571329,1222.11494724,92.86136063,.54179478,113.63998702,-.25015002],
Uranüs:[19.18797948,-.00020455,.0468574,-.0000155,.77298127,-.00180155,314.20276625,428.49512595,172.43404441,.09266985,74.01692503,.04240589],
Neptün:[30.06952752,.00006447,.00895439,.00000818,1.7700552,.000224,304.22289287,218.46515314,46.68158724,.01009938,131.78635853,-.00606302]};
const D2R=Math.PI/180,mod360=x=>((x%360)+360)%360;
function helio(nm,T){const e=EPL[nm],a=e[0]+e[1]*T,ec=e[2]+e[3]*T,I=(e[4]+e[5]*T)*D2R,L=e[6]+e[7]*T,w=e[8]+e[9]*T,Om=(e[10]+e[11]*T)*D2R;
 const om=w*D2R-Om;let M=mod360(L-w)*D2R;let E=M;for(let i=0;i<12;i++)E=M+ec*Math.sin(E);
 const xp=a*(Math.cos(E)-ec),yp=a*Math.sqrt(1-ec*ec)*Math.sin(E),co=Math.cos(om),so=Math.sin(om),cO=Math.cos(Om),sO=Math.sin(Om),cI=Math.cos(I);
 return[(co*cO-so*sO*cI)*xp+(-so*cO-co*sO*cI)*yp,(co*sO+so*cO*cI)*xp+(-so*sO+co*cO*cI)*yp]}
function geoLon(nm,T){const p=helio(nm,T),e=helio('Dünya',T);return mod360(Math.atan2(p[1]-e[1],p[0]-e[0])/D2R+1.39697*T)}
function sunLon(T){const e=helio('Dünya',T);return mod360(Math.atan2(-e[1],-e[0])/D2R+1.39697*T)}
function moonLon(d){const L=218.316+13.176396*d,M=134.963+13.064993*d,Ms=357.529+.98560028*d,D=297.85+12.190749*d,F=93.272+13.22935*d;
 return mod360(L+6.289*Math.sin(M*D2R)+1.274*Math.sin((2*D-M)*D2R)+.658*Math.sin(2*D*D2R)+.214*Math.sin(2*M*D2R)-.186*Math.sin(Ms*D2R)-.114*Math.sin(2*F*D2R))}
const SIGN_EL=['Ateş','Toprak','Hava','Su'];const signIdx=l=>Math.floor(mod360(l)/30);
function skyNow(date){const jd=date.getTime()/86400000+2440587.5,d=jd-2451545,T=d/36525;const out={sun:sunLon(T),moon:moonLon(d),pl:[]};
 ['Merkür','Venüs','Mars','Jüpiter','Satürn','Uranüs','Neptün'].forEach(n=>{const a=geoLon(n,T),b=geoLon(n,T+1/36525);let dl=b-a;if(dl>180)dl-=360;if(dl<-180)dl+=360;out.pl.push({ad:n,lon:a,retro:dl<0})});
 const age=((jd-2451550.1)%29.530588+29.530588)%29.530588;out.age=age;out.ill=(1-Math.cos(2*Math.PI*age/29.530588))/2;
 const ph=[[1.85,'Yeni Ay'],[5.53,'Hilal (büyüyen)'],[9.22,'İlk Dördün'],[12.91,'Şişkin Ay (büyüyen)'],[16.61,'Dolunay'],[20.3,'Şişkin Ay (küçülen)'],[23.99,'Son Dördün'],[27.68,'Hilal (küçülen)'],[99,'Yeni Ay']];out.phase=ph.find(p=>age<p[0])[1];return out}
const PSYM={Merkür:'☿',Venüs:'♀',Mars:'♂',Jüpiter:'♃',Satürn:'♄',Uranüs:'♅',Neptün:'♆'};
function drawToday(){const S=skyNow(new Date()),c=$('#wheel');if(!c)return;const g=c.getContext('2d'),W=c.width,cx=W/2,R=W*.46,r2=W*.33;g.clearRect(0,0,W,W);
 const sIdx=signIdx(S.sun);
 for(let i=0;i<12;i++){const a0=Math.PI+i*Math.PI/6,a1=a0+Math.PI/6;g.beginPath();g.arc(cx,cx,R,-a0,-a1,true);g.arc(cx,cx,r2,-a1,-a0,false);g.closePath();g.fillStyle=i===sIdx?'rgba(255,196,104,.28)':(i%2?'rgba(160,185,255,.06)':'rgba(160,185,255,.11)');g.fill();g.strokeStyle='rgba(160,185,255,.25)';g.stroke();
  const am=a0+Math.PI/12,rr=(R+r2)/2;g.fillStyle=ELCOL[ZOD[i].el];g.font='18px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ZOD[i].gl+'︎',cx+rr*Math.cos(-am),cx+rr*Math.sin(-am))}
 const dots=[['☉',S.sun,'#ffc468'],['☽',S.moon,'#ffffff']].concat(S.pl.map(p=>[PSYM[p.ad],p.lon,'#9fd8ff']));const rd=r2-14;const used=[];
 dots.forEach((d,k)=>{const a=-(Math.PI+d[1]*D2R);let rr=rd;used.forEach(u=>{if(Math.abs(u-d[1])<9)rr-=14});used.push(d[1]);const x=cx+rr*Math.cos(a),y=cx+rr*Math.sin(a);g.fillStyle='rgba(4,6,16,.75)';g.beginPath();g.arc(x,y,10,0,6.3);g.fill();g.fillStyle=d[2];g.font='16px serif';g.fillText(d[0]+'︎',x,y+1)});
 const rows=[['Güneş',ZOD[sIdx].ad+' · '+Math.floor(mod360(S.sun)%30)+'°'],['Ay',ZOD[signIdx(S.moon)].ad+' · '+S.phase+' (%'+Math.round(S.ill*100)+')']].concat(S.pl.map(p=>[p.ad,ZOD[signIdx(p.lon)].ad+' · '+Math.floor(mod360(p.lon)%30)+'°'+(p.retro?' ℞ geri':'')]));
 $('#todayStats').innerHTML=rowsHTML(rows);$('#todayDate').textContent=new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'});ST.sky=S}
/* günlük yorum: tarih + burç ile üretilir */
const BK={g:['Gün, hızlı karar vermekten çok gözlem yapmaya uygun; küçük ayrıntılar büyük resmi netleştiriyor.','Bugün uzun süredir ertelediğin bir işi tek bir adımla başlatmak iyi gelebilir.','Etrafındaki insanların sözlerinden çok davranışlarına dikkat etmek seni doğru yöne taşır.','Plansız bir sapma, beklenmedik bir fikir getirebilir; ona alan bırak.','Bugün enerjini üç işe dağıtmak yerine tek bir işe vermek daha verimli olur.','Bir konuda fikrini değiştirmek zayıflık değil, yeni bilgiye uyum sağlamaktır.','Kendine ayıracağın sessiz bir yarım saat, günün geri kalanını toparlar.','Eski bir tanıdıktan gelecek mesaj ya da hatıra, bugünün tonunu belirleyebilir.'],
 a:['İlişkilerde bugün dinlemek, anlatmaktan daha güçlü.','Küçük bir ilgi göstergesi, büyük bir cümleden daha etkili olabilir.','Beklentini açıkça söylemek, sessizce kırılmaktan iyidir.','Birine zaman ayırmak bugün en değerli hediye.','Yakın çevrende bir yanlış anlaşılma varsa bugün tatlıya bağlama günü.','Yalnız kalmak da bugün bir tür iyi gelme biçimi olabilir.'],
 i:['İş akışında öncelik sıralaman net olursa gün rahat geçer.','Bir toplantıda ya da konuşmada sade anlatım seni öne çıkarır.','Finansal ya da sözleşmeye dair konularda acele etmeden, ayrıntıları okuyarak ilerle.','Ekip çalışmasında bugün esnek olan kazanır.','Yaratıcı bir fikri not almak için güzel bir gün; hayata geçirmeyi yarına bırakabilirsin.','Bitirmediğin küçük işleri kapatmak zihnini hafifletir.'],
 e:['Su içmek ve kısa bir yürüyüş bugün enerjini toparlar.','Akşama doğru yorgunluk hissedersen ekranlardan kısa bir mola ver.','Bedenin dinlenmeyi istiyorsa ona kulak ver.','Hareket etmek zihnini de açar.','Dengeli bir öğün ve erken bir uyku bugünün en iyi yatırımı.']};
const MOONTONE={Ateş:'enerjik ve girişken',Toprak:'sakin ve pratik',Hava:'meraklı ve konuşkan',Su:'duygusal ve sezgisel'};
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dailyFor(i){const S=ST.sky||skyNow(new Date()),dt=new Date(),key=dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+'-'+ZOD[i].ad;let h=hashStr(key);const pick=(arr,k)=>arr[(hashStr(key+k)+h)%arr.length];
 const ms=signIdx(S.moon),me=ZOD[ms].el,own=ZOD[i].el;let ctx='Ay bugün '+ZOD[ms].ad+' burcunda; '+(ms===i?'kendi burcunda olduğu için duyguların belirgin ve dışa dönük.':(me===own?'aynı elementtesin, bu yüzden iç dengen güçlü.':'günün genel tonu '+MOONTONE[me]+'.'));
 const mer=S.pl.find(p=>p.ad==='Merkür');if(mer&&mer.retro)ctx+=' Merkür geri hareketli görünüyor: mesajları ve sözleşmeleri iki kez kontrol et.';
 const st=(k,n)=>{const v=1+((hashStr(key+k)>>>3)%5);return '★'.repeat(v)+'☆'.repeat(5-v)};
 return '<p>'+ctx+'</p><p>'+pick(BK.g,'g')+'</p><dl class="stats"><div><dt>Aşk</dt><dd>'+st('a')+'</dd></div><div><dt>İş</dt><dd>'+st('i')+'</dd></div><div><dt>Enerji</dt><dd>'+st('e')+'</dd></div></dl><p><b>Aşk:</b> '+pick(BK.a,'a')+'</p><p><b>İş:</b> '+pick(BK.i,'i')+'</p><p><b>Sağlık:</b> '+pick(BK.e,'e')+'</p><p class="note">Ay burcu, geri hareket ve tarih gerçek gökyüzü hesabıdır; yorum cümleleri ise tarihe göre üretilen eğlence amaçlı kültürel metindir, astrolog yorumu değildir.</p>'}

export {BK, D2R, EPL, MOONTONE, PSYM, SIGN_EL, dailyFor, drawToday, geoLon, hashStr, helio, mod360, moonLon, signIdx, skyNow, sunLon};
