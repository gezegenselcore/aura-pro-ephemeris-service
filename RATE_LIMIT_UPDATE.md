# Rate Limit Artırma Rehberi

## 📊 Mevcut Durum

- **Günlük Limit:** 100 istek/kullanıcı
- **Cache TTL:** 3 gün
- **Cache Hit:** Rate limit'e sayılmaz ✅

## 💡 Cache Nasıl Çalışıyor?

**Örnek Senaryo:**
1. Kullanıcı bugün Chiron hesaplaması yapar → 1 istek sayılır
2. Aynı gün tekrar aynı hesaplama → Cache'den döner, **0 istek sayılır** ✅
3. 2 gün sonra aynı hesaplama → Hala cache'de, **0 istek sayılır** ✅
4. 4 gün sonra aynı hesaplama → Cache süresi dolmuş, **1 istek sayılır**

**Yani:** Aynı hesaplamayı tekrar yaparsanız rate limit'e sayılmaz!

## 🔧 Limit'i Artırma

### Seçenek 1: Cloud Run Console'dan (Önerilen)

1. **Cloud Run Console'a git:**
   ```
   https://console.cloud.google.com/run/detail/europe-west3/getproephemeris?project=aura-2ca80
   ```

2. **"Edit & Deploy New Revision" → "Variables & Secrets"**

3. **`RATE_LIMIT_PER_DAY` değerini değiştir:**
   - Mevcut: `100`
   - Yeni: `1000` (veya istediğiniz değer)

4. **"Deploy" butonuna tıkla**

### Seçenek 2: gcloud CLI ile

```bash
gcloud run services update getproephemeris \
  --region europe-west3 \
  --update-env-vars RATE_LIMIT_PER_DAY=1000 \
  --project aura-2ca80
```

## 📈 Önerilen Limit Değerleri

| Senaryo | Önerilen Limit | Açıklama |
|--------|----------------|----------|
| **Test/Development** | 1000 | Geliştirme için yeterli |
| **Küçük Kullanıcı Grubu** | 500-1000 | 10-50 aktif kullanıcı |
| **Orta Ölçek** | 2000-5000 | 100-500 aktif kullanıcı |
| **Büyük Ölçek** | 10000+ | 1000+ aktif kullanıcı |

## 💰 Maliyet Etkisi

**Rate limit artırmanın maliyeti:**
- Rate limit sadece **kontrol mekanizması**
- Asıl maliyet: **Swiss Ephemeris hesaplamaları** (CPU/memory)
- Cache sayesinde aynı hesaplama tekrar yapılmaz
- **Sonuç:** Limit artırmak maliyeti çok etkilemez (cache sayesinde)

## ⚠️ Önemli Notlar

1. **Cache var:** Aynı hesaplama 3 gün içinde tekrar istenirse cache'den döner
2. **Limit abuse'i önler:** Kötü niyetli kullanımı engeller
3. **Kullanıcı başına:** Her kullanıcının kendi limiti var
4. **Günlük reset:** Her gün sıfırlanır

## 🎯 Öneri

**Başlangıç için:** `1000` istek/gün yeterli olabilir
- Cache sayesinde gerçek hesaplama çok daha az olur
- Normal kullanım için fazlasıyla yeterli
- İhtiyaç olursa artırılabilir
