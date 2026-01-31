# Deploy Sonrası Test Çağrısı

## getProEphemeris Test Request

```javascript
getProEphemeris({
  utcISO: "1992-03-30T08:30:00.000Z",
  zodiacSystem: "tropical",
  bodies: ["Chiron", "Ceres", "Pallas"],
  wantSpeed: true,
  debug: true
})
```

## Debug Çıktısında Beklenenler

Cloud Logging'de (`firebase functions:log` veya GCP Console > Logging) şunları görmelisiniz:

1. **ephemeris dosyaları indirildi** (cold start):
   - `[swephProvider] Downloaded sepl_18.se1 from gs://aura-ephemeris/sweph/sepl_18.se1`
   - `[swephProvider] Downloaded semo_18.se1 from gs://aura-ephemeris/sweph/semo_18.se1`
   - `[swephProvider] Downloaded seas_18.se1 from gs://aura-ephemeris/sweph/seas_18.se1`

2. **cache durumu** (debug=true):
   - İlk çağrı: `[getProEphemeris] Cache durumu: MISS - ephemeris dosyaları GCS'den indirilecek`
   - İkinci çağrı: `[getProEphemeris] Cache durumu: HIT`

3. **kullanılan ephemeris path**:
   - `[swephProvider] EP HE PATH: /tmp/se`
   - `[swephProvider] FILES IN TMP: sepl_18.se1, semo_18.se1, seas_18.se1`

4. **Swiss Ephemeris provider aktif**:
   - `[swephProvider] sweph.set_ephe_path("/tmp/se") OK`
   - `[swephProvider] Swiss Ephemeris provider active`

## Test Script

```bash
cd aura-pro-ephemeris-service
node scripts/test-deployed.js
```

Önkoşul: Firebase Auth (anonymous veya email) ile giriş yapılmış olmalı.
