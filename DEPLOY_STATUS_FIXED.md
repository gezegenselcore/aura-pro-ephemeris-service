# getProEphemeris Deploy Durumu - Teşhis ve Düzeltme

## 🔍 Teşhis Sonuçları

### 1. Terminal Komutları Çıktıları

```bash
firebase --version
# 15.2.1

firebase use
# aura-2ca80

firebase projects:list
# - aura-2ca80 (Aura) ✅ (current)
# - iron-brothers
# - auracloud-484016 YOK ❌

firebase functions:list
# getProEphemeris v2 callable europe-west3 ✅ (aura-2ca80'de)

firebase functions:list --project auracloud-484016
# Error: Failed to list functions ❌ (erişim yok veya proje yok)

firebase functions:list --project aura-2ca80
# getProEphemeris v2 callable europe-west3 ✅
```

### 2. .firebaserc Durumu

```json
{
  "projects": {
    "default": "aura-2ca80"
  }
}
```

✅ **Doğru:** Default project `aura-2ca80` (Aura)

### 3. Function Durumu Tablosu

| Project | Project ID | getProEphemeris Var mı? | Region | Durum |
|---------|-----------|-------------------------|--------|-------|
| **Aura** | `aura-2ca80` | ✅ **VAR** | `europe-west3` | Deploy edilmiş |
| **AuraCloud** | `auracloud-484016` | ❌ **YOK** | - | Erişim yok / Proje yok |

---

## ✅ Sonuç

**getProEphemeris şu anda `aura-2ca80` (Aura) projesinde deploy edilmiş.**

**Cloud Run'da `auracloud-484016` projesine bakıyorsunuz, bu yüzden "SERVICE not found" hatası alıyorsunuz.**

---

## 🔧 Çözüm

### Seçenek 1: Aura (aura-2ca80) Projesini Kullan (Önerilen)

Function zaten bu projede deploy edilmiş. Doğru Cloud Run linki:

**Cloud Run Console:**
```
https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80
```

**Firebase Console:**
```
https://console.firebase.google.com/project/aura-2ca80/functions
```

### Seçenek 2: AuraCloud (auracloud-484016) Projesine Deploy Et

Eğer AuraCloud projesine deploy etmek istiyorsanız:

1. **Projeye erişim kontrolü:**
   ```bash
   firebase login:list
   # Hangi hesapla login olduğunuzu kontrol edin
   ```

2. **AuraCloud projesine geçiş:**
   ```bash
   firebase use auracloud-484016
   # Eğer hata verirse, projeye erişiminiz yok demektir
   ```

3. **Deploy:**
   ```bash
   firebase deploy --only functions:getProEphemeris
   ```

---

## 📋 Doğru Cloud Run Linki (Mevcut Deploy)

**Project:** `aura-2ca80` (Aura)  
**Region:** `europe-west3`  
**Service:** `getProEphemeris`

**Link:**
```
https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80
```

---

## 🔐 Environment Variables (Cloud Run)

Yukarıdaki linke gidip "Edit & Deploy New Revision" → "Variables & Secrets" sekmesinden şunları ekleyin:

| Name | Value |
|------|-------|
| `EPHEMERIS_BUCKET` | `aura-ephemeris` |
| `EPHEMERIS_PREFIX` | `sweph/` |
| `RATE_LIMIT_PER_DAY` | `100` |
| `FUNCTION_REGION` | `europe-west3` |

---

## ✅ Region Tutarlılığı Doğrulaması

**Kod:**
```typescript
// functions/src/index.ts:38
region: process.env.FUNCTION_REGION || 'europe-west3'
```

**Deploy Çıktısı:**
```
functions[getProEphemeris(europe-west3)] Successful create operation.
```

✅ **Region tutarlı:** `europe-west3` (Frankfurt)

---

## 📝 Özet

| Özellik | Değer |
|---------|-------|
| **Deploy Edilen Proje** | `aura-2ca80` (Aura) |
| **Function Adı** | `getProEphemeris` |
| **Region** | `europe-west3` |
| **Version** | v2 (2nd Gen) |
| **Cloud Run Link** | https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80 |
| **Firebase Console Link** | https://console.firebase.google.com/project/aura-2ca80/functions |

**Not:** `auracloud-484016` projesine erişiminiz yok veya proje listede değil. Function `aura-2ca80` projesinde deploy edilmiş ve çalışıyor.
