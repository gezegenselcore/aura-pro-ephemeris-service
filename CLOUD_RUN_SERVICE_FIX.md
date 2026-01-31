# Cloud Run Service Bulunamıyor - Çözüm

## 🔍 Durum

**Hata:** Cloud Run Console'da `getProEphemeris` service'i `aura-2ca80` projesinde `europe-west3` region'ında bulunamıyor.

**Deploy Durumu:** ✅ Function başarıyla deploy edildi
```
functions[getProEphemeris(europe-west3)] Successful update operation.
```

## 🔧 Çözüm

### 1. Deploy Başarılı ✅

Function başarıyla deploy edildi. Cloud Run service'in görünmesi birkaç saniye sürebilir.

### 2. Cloud Run Service Adı

Firebase Functions v2 (2nd Gen) için Cloud Run service adı şu formatta olabilir:
- `getProEphemeris` (direkt)
- Veya Firebase tarafından oluşturulan bir service

### 3. Doğru Link Kontrolü

**Firebase Console'dan:**
1. https://console.firebase.google.com/project/aura-2ca80/functions
2. `getProEphemeris` function'ına tıkla
3. "View in Google Cloud Console" butonuna tıkla
4. Bu sizi doğru Cloud Run service sayfasına yönlendirir

**Direkt Cloud Run Link:**
```
https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80
```

### 4. Alternatif: Cloud Run Services Listesi

Eğer yukarıdaki link çalışmazsa, tüm Cloud Run services'leri listeleyin:

```
https://console.cloud.google.com/run?project=aura-2ca80
```

Burada `getProEphemeris` service'ini bulabilirsiniz.

### 5. Service Oluşmamışsa

Eğer hala service görünmüyorsa:

1. **Birkaç saniye bekleyin** (Cloud Run service oluşturulması zaman alabilir)

2. **Firebase Console'dan kontrol edin:**
   - Functions → getProEphemeris → Logs
   - Eğer function çalışıyorsa, Cloud Run service de var demektir

3. **Yeniden deploy edin:**
   ```bash
   cd aura-pro-ephemeris-service
   firebase deploy --only functions:getProEphemeris --project aura-2ca80
   ```

## ✅ Deploy Log Özeti

```
+  functions: functions source uploaded successfully
i  functions: updating Node.js 20 (2nd Gen) function getProEphemeris(europe-west3)...
+  functions[getProEphemeris(europe-west3)] Successful update operation.
```

**Sonuç:** ✅ Function başarıyla deploy edildi

## 📋 Environment Variables

Function deploy edildikten sonra Cloud Run Console'dan environment variables ekleyin:

1. **Cloud Run Console'a git:**
   - Firebase Console → Functions → getProEphemeris → "View in Google Cloud Console"
   - Veya: https://console.cloud.google.com/run/detail/europe-west3/getProEphemeris?project=aura-2ca80

2. **"Edit & Deploy New Revision" → "Variables & Secrets"**

3. **Environment Variables ekle:**
   - `EPHEMERIS_BUCKET` = `aura-ephemeris`
   - `EPHEMERIS_PREFIX` = `sweph/`
   - `RATE_LIMIT_PER_DAY` = `100`
   - `FUNCTION_REGION` = `europe-west3`

## 🔗 Hızlı Linkler

- **Firebase Console:** https://console.firebase.google.com/project/aura-2ca80/functions
- **Cloud Run Console:** https://console.cloud.google.com/run?project=aura-2ca80
- **Function Logs:** https://console.firebase.google.com/project/aura-2ca80/functions/logs

## ⚠️ Not

Cloud Run service'in görünmesi birkaç saniye sürebilir. Deploy başarılı olduğu için function çalışıyor olmalı. Eğer hala görünmüyorsa, Firebase Console'dan function'ı açıp "View in Google Cloud Console" butonunu kullanın - bu sizi doğru sayfaya yönlendirir.
