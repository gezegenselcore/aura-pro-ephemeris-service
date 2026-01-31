# Environment Variables Setup - Google Cloud Run (2nd Gen Functions)

## ✅ Environment Mechanism Confirmed

**Kod kullanımı:**
- `process.env.EPHEMERIS_BUCKET` ✅
- `process.env.EPHEMERIS_PREFIX` ✅
- `process.env.RATE_LIMIT_PER_DAY` ✅
- `process.env.FUNCTION_REGION` ✅

**NOT:** `functions.config()` kullanılmıyor - bu 1st gen için. 2nd gen functions için **Google Cloud Run** üzerinden ayarlanmalı.

---

## 📋 Adım Adım: Environment Variables Ayarlama

### 1. Firebase Console'dan Cloud Run'a Git

1. **Firebase Console'a git:**
   - https://console.firebase.google.com/project/aura-2ca80

2. **Functions sekmesine tıkla:**
   - Sol menüden "Functions" seç

3. **getProEphemeris function'ını bul:**
   - Function listesinde `getProEphemeris` (europe-west3) görünmeli
   - Function adına **tıkla** (açılır)

4. **"View in Google Cloud Console" butonuna tıkla:**
   - Function detay sayfasında sağ üstte veya sayfa içinde bu buton olmalı
   - Bu sizi Google Cloud Console'a yönlendirir

### 2. Google Cloud Console - Cloud Run Service

1. **Cloud Run service sayfasında:**
   - Service adı: `getProEphemeris`
   - Region: `europe-west3`

2. **"Edit & Deploy New Revision" butonuna tıkla:**
   - Sayfanın üst kısmında veya "EDIT" butonu

3. **"Variables & Secrets" sekmesine git:**
   - Sol menüden veya tab'lardan "Variables & Secrets" seç

4. **Environment Variables ekle:**
   - "ADD VARIABLE" veya "+" butonuna tıkla
   - Şu 4 variable'ı ekle:

   | Name | Value |
   |------|-------|
   | `EPHEMERIS_BUCKET` | `aura-ephemeris` |
   | `EPHEMERIS_PREFIX` | `sweph/` |
   | `RATE_LIMIT_PER_DAY` | `100` |
   | `FUNCTION_REGION` | `europe-west3` |

5. **"Deploy" butonuna tıkla:**
   - Sayfanın altında veya üstte "Deploy" butonu
   - Yeni revision deploy edilecek (1-2 dakika sürebilir)

### 3. Alternatif: gcloud CLI ile

Eğer gcloud CLI kullanmak isterseniz:

```bash
# Login
gcloud auth login

# Project seç
gcloud config set project aura-2ca80

# Environment variables ayarla
gcloud run services update getProEphemeris \
  --region europe-west3 \
  --update-env-vars EPHEMERIS_BUCKET=aura-ephemeris,EPHEMERIS_PREFIX=sweph/,RATE_LIMIT_PER_DAY=100,FUNCTION_REGION=europe-west3
```

---

## ✅ Doğrulama

### 1. Cloud Run Console'da Kontrol

1. Cloud Run service sayfasında
2. "Revisions" sekmesine git
3. En son revision'ı seç
4. "Variables & Secrets" sekmesinde environment variables görünmeli

### 2. Function Logs Kontrol

1. Firebase Console → Functions → getProEphemeris
2. "Logs" sekmesine git
3. İlk çağrıda şu log görünmeli:
   ```
   [swephProvider] Downloaded sepl_18.se1 from gs://aura-ephemeris/sweph/sepl_18.se1
   [swephProvider] Downloaded semo_18.se1 from gs://aura-ephemeris/sweph/semo_18.se1
   [swephProvider] Downloaded seas_18.se1 from gs://aura-ephemeris/sweph/seas_18.se1
   ```

### 3. Smoke Test

Aşağıdaki script ile test edebilirsiniz (sonraki adımda).

---

## 🔗 Hızlı Linkler

- **Firebase Console Functions:** https://console.firebase.google.com/project/aura-2ca80/functions
- **Google Cloud Run Console:** https://console.cloud.google.com/run?project=aura-2ca80
- **Direct Cloud Run Service:** https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80

---

## ⚠️ Önemli Notlar

1. **2nd Gen Functions:** Environment variables **Google Cloud Run** üzerinden ayarlanır, Firebase Console'dan değil.

2. **Deploy Gerekli:** Environment variables ekledikten sonra yeni revision deploy edilmelidir.

3. **Region:** Function `europe-west3` region'ında, Cloud Run service de aynı region'da olmalı.

4. **Default Values:** Kodda default değerler var ama production'da explicit olarak ayarlanmalı.
