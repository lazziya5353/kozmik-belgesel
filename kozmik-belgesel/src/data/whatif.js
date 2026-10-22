/* ---------- YA OLSAYDI BÖLÜMLERİ ---------- */
const CH_SUN=[
[2.2,'Buz Kuşağı','Güneş burada parlak bir yıldızdan farksız: ışık bugünün beşte biri ile onda biri arasında. Okyanuslar donar, Dünya buzdan bir kabuğa dönüşür.'],
[1.45,'Kızıl Soğuk','Mars’ın yörüngesi. Işık bugünün yarısından azına düşer; ortalama sıcaklık donma noktasının çok altındadır. Yüzey suyu buz, hava soğuk ve incedir.'],
[1.05,'Soğuyan Mavi','Dünya yaşanabilirliğin kenarında ama daha soğuk. Buzullar ekvatora doğru ilerler; beyaz buz ışığı yansıttıkça soğuma kendini besler.'],
[.97,'Bugünkü Dünya','1 AU: ışığın 1361 W/m² olduğu, sıvı suyun kararlı kalabildiği kuşak. Güneş gökyüzünde yaklaşık yarım derecelik bir disk.'],
[.85,'İlk Isınma','Birkaç derecelik ısınma bile kutup buzlarını eritir ve su buharını artırır. Su buharı güçlü bir sera gazıdır: ısınma kendini besler.'],
[.75,'Nemli Sera','Akı bugünkünün 1,4–1,8 katı. Okyanuslar hızla buharlaşır, üst atmosferdeki su buharı uzaya kaçar; Dünya geri dönüşsüz bir eşiğe yaklaşır.'],
[.6,'Venüs Eşiği','Venüs’ün yörüngesi (0,72 AU) civarı. Kaçak sera etkisi başlar: okyanuslar tümüyle buharlaşır ve yüzey yüzlerce dereceye çıkar.'],
[.25,'Merkür Yörüngesi','Güneş, gökyüzünde bugünkünün 2,5–4 katı çapında. Yüzey kızgın kaya, atmosfer yoğun ve zehirli bir buhar tabakası.'],
[.07,'Magma Okyanusu','Kaya erimeye başlar; gündüz yüzey magma okyanusuna dönüşür. Atmosfer, buharlaşmış kayaç ve metallerden oluşur.'],
[.02,'Korona','Güneş’in dış atmosferi olan koronanın içine yaklaşıyorsun (Parker Güneş Sondası bu bölgeye girdi). Güneş rüzgârı yüzeyi kazır ve atmosferi sıyırır.'],
[0,'Son Düşüş','Güneş gökyüzünün büyük bölümünü kaplar. Kaya buharlaşır, sürtünme yörüngeyi bozar ve Dünya Güneş’in yüzeyine doğru çöker.']];
const CH_MOON=[
[600000,'Uzaklaşan Ay','Ay çok uzakta: gelgitler zayıflar, Ay küçük bir disk olur ve tam Güneş tutulmaları artık görülmez. (Gerçekte Ay yılda yaklaşık 3,8 cm uzaklaşıyor.)'],
[340000,'Bugünkü Ay','384.400 km: Ay gökyüzünde yarım derecelik bir disk; Güneş ile neredeyse aynı çapta, bu yüzden tam tutulmalar görürüz. Gelgitler Dünya’nın dönüşünü çok yavaşça yavaşlatır.'],
[200000,'Yaklaşan Ay','Ay daha büyük ve parlak. Gelgit kuvveti uzaklığın küpüyle arttığı için okyanus gelgitleri belirgin biçimde güçlenir.'],
[100000,'Dev Ay','Ay gökyüzünü kaplar: bugünkünden 2–4 kat geniş. Gelgitler on katlarca güçlenir ve kıyılar günde iki kez devasa dalgalarla basılır.'],
[40000,'Gelgit Çağı','Gelgitler yüzlerce kat güçlenir. Kara bile günde iki kez metrelerce kabarıp çöker; depremler ve yanardağlar olağan hâle gelir. Ay’ın yörünge süresi birkaç güne iner.'],
[18000,'Roche Eşiği','Ay, Roche sınırına yaklaşır (akışkan bir gövde için yaklaşık 18.000 km). Gelgit kuvveti kayayı çatlatır; Ay’ın yüzeyi yarılır ve şekli bozulur.'],
[0,'Parçalanma','Roche sınırının içinde Ay’ı bir arada tutan kendi çekimi gelgit kuvvetini yenemez. Ay parçalanır ve Dünya’nın çevresinde Satürn benzeri bir enkaz halkası oluşturur.']];

export {CH_MOON, CH_SUN};
