# 💰 AURA PRO Ephemeris Service - Maliyet Analizi

## 📊 Maliyet Bileşenleri

### 1. Firebase Functions (Cloud Run) - Invocation Maliyeti

**Fiyatlandırma:**
- İlk 2M invocation/ay: **ÜCRETSİZ** ✅
- Sonraki: **$0.40 per 1M invocation**

**Örnek Hesaplama:**
- 100 istek/gün × 30 gün = 3,000 istek/ay → **ÜCRETSİZ** ✅
- 1,000 istek/gün × 30 gün = 30,000 istek/ay → **ÜCRETSİZ** ✅
- 10,000 istek/gün × 30 gün = 300,000 istek/ay → **ÜCRETSİZ** ✅
- 100,000 istek/gün × 30 gün = 3M istek/ay → **ÜCRETSİZ** ✅

**Sonuç:** Rate limit'i 100'den 1000'e çıkarmak **invocation maliyeti açısından ücretsiz** (2M limit içinde kalıyoruz).

---

### 2. Firebase Functions - Compute Time (CPU/Memory)

**Fiyatlandırma:**
- Memory: 512 MiB
- CPU: Request-based billing
- İlk 400,000 GB-second/ay: **ÜCRETSİZ**
- Sonraki: $0.0000025 per GB-second

**Hesaplama:**
- Her hesaplama: ~2-5 saniye (ilk çağrıda ephemeris dosyaları indirilir)
- Cache hit: ~0.1-0.5 saniye (çok hızlı)

**Örnek Senaryo (1000 istek/gün, %80 cache hit):**
- Cache miss (200 istek): 200 × 3 saniye × 0.5 GB = 300 GB-second
- Cache hit (800 istek): 800 × 0.3 saniye × 0.5 GB = 120 GB-second
- Toplam: 420 GB-second/gün × 30 = 12,600 GB-second/ay → **ÜCRETSİZ** ✅

**Sonuç:** Compute time da ücretsiz limit içinde.

---

### 3. Firestore - Cache Okuma/Yazma

**Fiyatlandırma:**
- Read: **$0.06 per 100k reads**
- Write: **$0.18 per 100k writes**
- Storage: **$0.18 per GB/ay**

**Örnek Senaryo (1000 istek/gün, %80 cache hit):**
- Cache read (800 istek): 800 × 30 = 24,000 reads/ay → **$0.014** (1.4 cent)
- Cache write (200 istek): 200 × 30 = 6,000 writes/ay → **$0.011** (1.1 cent)
- Storage: ~1 MB cache data → **$0.0002** (0.02 cent)
- **Toplam Firestore: ~$0.025/ay (2.5 cent)**

---

### 4. GCS - Ephemeris Dosyaları Storage

**Fiyatlandırma:**
- Storage: **$0.020 per GB/ay** (Standard)
- Download: **$0.12 per GB** (ilk 1 GB/ay ücretsiz)

**Hesaplama:**
- 3 dosya × ~10-20 MB = ~50 MB total
- Storage: 0.05 GB × $0.020 = **$0.001/ay** (0.1 cent)
- Download: İlk cold start'ta indirilir, sonra cache'de → **ÜCRETSİZ** (1 GB limit içinde)

**Toplam GCS: ~$0.001/ay (0.1 cent)**

---

## 💵 Toplam Maliyet Karşılaştırması

### Senaryo 1: 100 İstek/Gün (Mevcut)

| Bileşen | Aylık Maliyet |
|---------|---------------|
| Functions Invocation | $0.00 (ücretsiz limit içinde) |
| Functions Compute | $0.00 (ücretsiz limit içinde) |
| Firestore (cache) | ~$0.01 (1 cent) |
| GCS Storage | ~$0.001 (0.1 cent) |
| **TOPLAM** | **~$0.01/ay (1 cent)** |

### Senaryo 2: 1000 İstek/Gün (Önerilen)

| Bileşen | Aylık Maliyet |
|---------|---------------|
| Functions Invocation | $0.00 (ücretsiz limit içinde) |
| Functions Compute | $0.00 (ücretsiz limit içinde) |
| Firestore (cache) | ~$0.025 (2.5 cent) |
| GCS Storage | ~$0.001 (0.1 cent) |
| **TOPLAM** | **~$0.026/ay (2.6 cent)** |

### Senaryo 3: 10,000 İstek/Gün (Yoğun Kullanım)

| Bileşen | Aylık Maliyet |
|---------|---------------|
| Functions Invocation | $0.00 (ücretsiz limit içinde) |
| Functions Compute | $0.00 (ücretsiz limit içinde) |
| Firestore (cache) | ~$0.25 (25 cent) |
| GCS Storage | ~$0.001 (0.1 cent) |
| **TOPLAM** | **~$0.25/ay (25 cent)** |

---

## 🎯 Sonuç ve Öneri

### ✅ İyi Haberler:

1. **Functions ücretsiz limit çok yüksek:** 2M invocation/ay ücretsiz
2. **Cache sayesinde gerçek hesaplama çok az:** %80 cache hit oranı normal
3. **Maliyet çok düşük:** 1000 istek/gün için ~2.6 cent/ay

### 📊 Rate Limit Önerisi:

| Limit | Aylık Maliyet | Kullanım Senaryosu |
|-------|---------------|-------------------|
| **100** | ~1 cent | Çok düşük (test için) |
| **1000** | ~2.6 cent | Normal kullanım ✅ **ÖNERİLEN** |
| **5000** | ~13 cent | Orta ölçek |
| **10000** | ~25 cent | Yoğun kullanım |

### 💡 Öneri:

**1000 istek/gün limit'i koyabilirsiniz:**
- Maliyet: Sadece **2.6 cent/ay** artış (1 cent → 2.6 cent)
- Kullanıcı deneyimi: Çok daha iyi
- Cache sayesinde gerçek hesaplama çok daha az olur

**Eğer maliyet kritikse:**
- 500 istek/gün: ~1.3 cent/ay
- Cache sayesinde normal kullanım için yeterli olabilir

---

## 🔧 Limit'i Artırma

Cloud Run Console'dan `RATE_LIMIT_PER_DAY` değerini değiştirin:
- 500: ~1.3 cent/ay
- 1000: ~2.6 cent/ay ✅ **ÖNERİLEN**
- 5000: ~13 cent/ay

**Maliyet artışı minimal, kullanıcı deneyimi çok daha iyi!**
