# Environment Variables Setup - Özet

## 🔍 Teşhis Sonucu

**Kod kullanımı:** `process.env.*` ✅  
**Function tipi:** 2nd Gen (Cloud Run) ✅  
**Ayarlama yeri:** Google Cloud Run Console (Firebase Console değil) ✅

---

## 📍 Exact UI Steps

### Firebase Console → Google Cloud Run

1. **Firebase Console:**
   ```
   https://console.firebase.google.com/project/aura-2ca80/functions
   ```

2. **getProEphemeris'e tıkla:**
   - Function listesinde `getProEphemeris (europe-west3)` görünmeli
   - Function adına tıkla

3. **"View in Google Cloud Console" butonuna tıkla:**
   - Function detay sayfasında bu buton olmalı
   - Veya direkt link: https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80

### Google Cloud Run Console

4. **"Edit & Deploy New Revision" butonuna tıkla:**
   - Sayfanın üst kısmında

5. **"Variables & Secrets" sekmesine git:**
   - Sol menüden veya tab'lardan

6. **Environment Variables ekle:**
   - "ADD VARIABLE" veya "+" butonuna tıkla
   - 4 variable ekle:

   ```
   EPHEMERIS_BUCKET = aura-ephemeris
   EPHEMERIS_PREFIX = sweph/
   RATE_LIMIT_PER_DAY = 100
   FUNCTION_REGION = europe-west3
   ```

7. **"Deploy" butonuna tıkla:**
   - Yeni revision deploy edilecek

---

## 🧪 Smoke Test

Environment variables ayarlandıktan sonra:

```bash
cd aura-pro-ephemeris-service
node scripts/test-deployed.js
```

**Beklenen çıktı:**
- İlk çağrı: Cache miss, ephemeris dosyaları indirilir
- İkinci çağrı: Cache hit, hızlı response
- Tüm 5 body (Chiron, Ceres, Pallas, Juno, Vesta) longitude değerleri döner

---

## ✅ Doğrulama Checklist

- [ ] Environment variables Cloud Run'da görünüyor
- [ ] Yeni revision deploy edildi
- [ ] Function logs'da ephemeris dosyaları indirildi mesajı var
- [ ] Smoke test başarılı (5 body longitude döndü)
- [ ] İkinci çağrı cache hit gösteriyor
