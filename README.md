# Kozmik Belgesel

Gerçek zamanlı 3B Türkçe uzay belgeseli: Samanyolu, Güneş Sistemi, "Ya Olsaydı?", Zaman Çubuğu, Zodyak Keşfi.

## Yapı

```
index.html            Sayfa iskeleti (panel, zaman çubuğu, yüklenme ekranı)
netlify.toml          Netlify ayarı (npm run build -> dist)
src/
  main.js             Başlatma ve ana döngü
  styles.css          Tüm stiller
  util.js             Yardımcılar (gürültü, matematik, biçimlendirme)
  data/               Veriler: kilometre taşları, burçlar, "Ya Olsaydı?" metinleri
  scene/              3B nesneler: core, sky (Samanyolu), sun, earth (+Ay), planets, zodiac3d
  app/                Mantık: state, camera, apply, astro (efemeris + günlük yorum), ui, input
```

## Çalıştırma

```
npm install
npm run dev        # yerel geliştirme
npm run build      # dist/ klasörüne üretim derlemesi
```

## Netlify

GitHub reposunu Netlify'a bağla. Ayarlar `netlify.toml` içinde olduğu için elle bir şey girmen gerekmez
(Build command: `npm run build`, Publish directory: `dist`).
