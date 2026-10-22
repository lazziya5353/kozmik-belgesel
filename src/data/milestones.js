import * as THREE from 'three';


/* ---------- ZAMAN ÇUBUĞU VERİSİ ---------- */
const MS=[];
function M(t,ad,era,txt,o,lbl){MS.push(Object.assign({t:t,ad:ad,era:era,txt:txt,lbl:lbl||null},o||{}))}
M(-13.8e9,'Büyük Patlama','Kozmik Şafak','Zaman, uzay ve madde tek bir anda ortaya çıktı. Evren, ışıktan bile yoğun, inanılmaz sıcak bir çorbaydı.',{flash:1,fc:'#fff2dc',stars:0,gal:0,sun:0,earth:0,moon:0,neb:0,heat:0,frozen:0,life:0,lights:0,cloud:.5,pw:1,sc:'#ffd9a0',mk:384400,ph:'Henüz yıldız yok',dn:'Henüz yok'},'13,8 milyar yıl önce');
M(-13.7996e9,'İlk Işık','Kozmik Şafak','Evren soğuyup şeffaflaştı ve ilk ışık serbest kaldı. Bugün bu ışığı kozmik mikrodalga artalan ışıması olarak ölçüyoruz.',{flash:.6,fc:'#ff9b52'},'Büyük Patlama’dan 380.000 yıl sonra');
M(-13.6e9,'İlk Yıldızlar','Kozmik Şafak','Karanlık çağın ardından hidrojen bulutları çöktü; dev, mavi ve kısa ömürlü ilk yıldızlar evreni yeniden aydınlattı.',{stars:.15});
M(-13.3e9,'İlk Galaksiler','Galaktik Çağ','Yıldızlar çekim gücüyle galaksiler halinde bir araya geldi. James Webb Uzay Teleskobu bu erken galaksileri doğrudan gözlüyor.',{stars:.35,gal:.15});
M(-12e9,'Samanyolu Büyüyor','Galaktik Çağ','Samanyolu, küçük galaksileri yutarak büyüdü. Güneş’ten çok önce doğan yıldızlar bugün halesinde hâlâ ışıldıyor.',{stars:.6,gal:.55});
M(-10e9,'Yıldız Doğumunun Zirvesi','Galaktik Çağ','Evrenin yıldız yapma hızı bu çağda doruğa çıktı. Ölen yıldızlar karbon, oksijen ve demiri uzaya saçarak gezegenlerin hammaddesini üretti.',{stars:.85,gal:.85});
M(-4.7e9,'Güneş Bulutsusu','Güneş Sistemi','Yakındaki bir yıldızın şok dalgası, gaz ve toz bulutunu çökertmeye başladı. Bu bulutsu hem Güneş’i hem gezegenleri doğuracaktı.',{neb:1,stars:1,gal:1,sc:'#ff6a30',ph:'Gaz ve toz bulutu'});
M(-4.6e9,'Protogüneş','Güneş Sistemi','Bulutun merkezi ısındı ve kızıl bir protoyıldız parlamaya başladı; çevresinde dönen disk gezegenlerin beşiğiydi.',{neb:.7,sun:2.4,sc:'#ff7a3a',pw:.8,ph:'Protoyıldız'});
M(-4.57e9,'Güneş Doğuyor','Güneş Sistemi','Çekirdekte hidrojen füzyonu başladı. Genç Güneş bugünkünden yaklaşık yüzde 30 sönüktü.',{neb:.3,sun:1,sc:'#ffd9a0',pw:.75,ph:'Genç anakol yıldızı'});
M(-4.54e9,'Dünya Doğuyor','Güneş Sistemi','Çarpışan gezegenimsiler Dünya’yı oluşturdu. Yüzey, erimiş kayadan bir magma okyanusuydu.',{neb:0,earth:1,heat:2,life:0,cloud:.7,lights:0,moon:0,mk:30000,dn:'Magma okyanusu'});
M(-4.5e9,'Ay’ın Doğuşu','Güneş Sistemi','Mars büyüklüğündeki Theia, Dünya’ya çarptı. Savrulan enkaz birleşerek Ay’ı oluşturdu. Ay başlangıçta bugünkünden çok daha yakındı (yaklaşık 20–30 bin km) ve yılda birkaç santimetre uzaklaşarak bugünkü mesafeye ulaştı.',{flash:.55,fc:'#ffb36a',moon:1,heat:2},'Yaklaşık 4,5 milyar yıl önce');
M(-4.4e9,'İlk Okyanuslar','Güneş Sistemi','Yüzey soğudu, yağmurlar yağdı ve ilk okyanuslar oluştu. Bu yaş, antik zirkon kristallerinden anlaşılıyor.',{heat:.4,cloud:.6,mk:120000,dn:'Okyanuslu ilkel dünya'});
M(-3.7e9,'Yaşamın İlk İzleri','Yaşam','Yaklaşık 3,5–3,8 milyar yıl önce ilk mikroskobik canlılar belirdi. Kesin fosil kanıtları 3,5 milyar yıl civarına uzanır.',{heat:0,life:.2,mk:240000,dn:'Mikrobiyal yaşam'},'Yaklaşık 3,7 milyar yıl önce');
M(-2.4e9,'Büyük Oksijenlenme','Yaşam','Fotosentez yapan siyanobakteriler atmosferi oksijenle doldurdu. Bu, o güne dek yaşamın çoğunu zehirleyen büyük bir değişimdi.',{life:.5,cloud:.5,mk:300000});
M(-7.2e8,'Kartopu Dünya','Yaşam','Jeolojik kanıtlar, Dünya’nın büyük bölümünün buzla kaplandığı dönemlere işaret eder. Buzullar ekvatora kadar uzanmış olabilir.',{frozen:1,life:.5,mk:350000,dn:'Küresel buzul çağı'});
M(-5.4e8,'Kambriyen Patlaması','Yaşam','Buzlar çekildi; kısa sürede gözlü, kabuklu ve kemikli çok çeşitli hayvan grupları ortaya çıktı.',{frozen:0,life:1,mk:365000,dn:'Zengin biyosfer'});
M(-2.3e8,'Dinozorların Çağı','Yaşam','Dinozorlar yaklaşık 165 milyon yıl boyunca karaların hâkimiydi.',{mk:375000});
M(-6.6e7,'Asteroit Çarpması','Yaşam','Yucatan açıklarına düşen yaklaşık on kilometrelik bir asteroit dinozorların sonunu getirdi. Küçük memeliler hayatta kaldı.',{flash:.35,fc:'#ffc68a',heat:.35,cloud:.9,mk:382000});
M(-3e5,'İlk Homo sapiens','İnsanlık','Afrika’da modern insan ortaya çıktı. Gökyüzünü merakla izleyen ilk gözlemciler belki de bu dönemdeydi.',{heat:0,cloud:.55,mk:384400});
M(-1.2e4,'Tarım Devrimi','İnsanlık','Mevsimleri ve yıldızları izlemek hayati hâle geldi: ekim ve hasat zamanı gökyüzünden okunuyordu.',{});
M(-589,'Uluğ Bey’in Rasathanesi','İnsanlık','Semerkant’ta 1437 dolaylarında Uluğ Bey’in ekibi, Zic-i Sultani adlı yıldız kataloğunu tamamladı; katalog yüzyıllar boyunca başvuru kaynağı oldu.',{});
M(-449,'Takiyüddin’in Rasathanesi','İnsanlık','İstanbul’da 1577’de kurulan rasathane, mekanik saatlerle gözlem yapıyordu; yalnızca birkaç yıl hizmet verebildi.',{});
M(-417,'Galileo’nun Teleskobu','İnsanlık','1609’un sonunda Galileo teleskobu gökyüzüne çevirdi; Ay’ın kraterlerini, Jüpiter’in uydularını ve Samanyolu’nun yıldızlardan oluştuğunu gördü.',{});
M(-57,'Ay’da İlk Adım','İnsanlık','20 Temmuz 1969’da Apollo 11 ile insanoğlu başka bir gök cismine ayak bastı.',{lights:.6});
M(0,'Bugün','Bugün','Dünya, sarı bir cüce olan Güneş’in çevresinde, Samanyolu’nun spiral kollarından birinde dönen mavi bir gezegen.',{lights:1,ph:'Anakol yıldızı (sarı cüce)',dn:'Yaşanabilir'},'2026');
M(1e9,'Parlayan Güneş','Gelecek','Güneş yavaş yavaş parlaklaşıyor. Yaklaşık bir milyar yıl sonra artan ısı, okyanusların buharlaşmasını başlatabilir.',{sun:1.1,heat:.6,lights:0,cloud:.7,mk:422000,dn:'Aşırı ısınıyor'});
M(3.5e9,'Kuruyan Dünya','Gelecek','Tahminlere göre okyanuslar tamamen buharlaşır; yüzey bugünkü Venüs’ü andırır.',{sun:1.35,heat:1.4,life:.1,cloud:.8,mk:520000,dn:'Kavrulmuş çöl'});
M(5e9,'Kızıl Dev Başlıyor','Gelecek','Çekirdekteki hidrojen biter; Güneş şişmeye ve kızarmaya başlar.',{sun:3,sc:'#ff7b3a',heat:2,mk:575000,ph:'Kızıl dev evresi başlıyor',dn:'Erimiş yüzey'});
M(7.6e9,'Kızıl Devin Zirvesi','Gelecek','Güneş yarıçapını bugünkünün yüzlerce katına çıkarır. Dünya’nın yutulup yutulmayacağı kesin değildir; modeller her iki ihtimali de gösterir.',{sun:24,sc:'#ff4a22',earth:.5,pw:1.3,mk:600000,ph:'Kızıl dev',dn:'Yutulabilir (belirsiz)'});
M(7.9e9,'Gezegenimsi Bulutsu','Gelecek','Güneş dış katmanlarını uzaya üfler; parlak bir gaz kabuğu, ölen yıldızın çevresinde birkaç on bin yıl ışıldar.',{sun:.8,sc:'#cfe0ff',earth:0,moon:0,neb:1,pw:1,ph:'Gezegenimsi bulutsu',dn:'Kalmadı'});
M(8e9,'Beyaz Cüce','Gelecek','Geriye Dünya büyüklüğünde, yoğun ve yavaşça soğuyan bir çekirdek kalır: Güneş’in beyaz cüce hâli.',{sun:.06,sc:'#d8e6ff',neb:.5,ph:'Beyaz cüce'});
const NUMK=['sun','pw','earth','heat','frozen','life','lights','cloud','moon','mk','stars','gal','neb','flash'];
MS.forEach(m=>{if(typeof m.sc==='string')m.sc=new THREE.Color(m.sc);m.fc=new THREE.Color(m.fc||'#ffffff');if(m.flash==null)m.flash=0});
for(let i=1;i<MS.length;i++){const p=MS[i-1],m=MS[i];NUMK.forEach(k=>{if(m[k]==null)m[k]=(k==='flash')?0:p[k]});if(m.ph==null)m.ph=p.ph;if(m.dn==null)m.dn=p.dn;if(!m.sc)m.sc=p.sc;}

export {M, MS, NUMK};
