# getAstroChart — Sonuç Raporu

## Yapılan Değişiklikler

### 1. API types (`api/chartTypes.ts`)
- Zod schema: `GetAstroChartRequestSchema`
- Request: utcISO, lat, lon, zodiacSystem, houseSystem, nodeType?, lilithType?, wantAspects?, debug?
- Response: chart (bodies, angles, houses, aspects), meta

### 2. chartSwiss (`ephemeris/chartSwiss.ts`)
- **Bodies:** Sun (0), Moon (1), Mercury (2)–Pluto (9), Chiron (15), Ceres/Pallas/Juno/Vesta (bodies.ts), NorthNode (10/11), Lilith (12/13), ASC/MC/DSC/IC
- **Houses:** swe_houses_ex / houses_ex, Placidus ('P')
- **Aspects:** conjunction, sextile, square, trine, opposition (Sun/Moon orb 8°, diğer 6°)
- **Flags:** SEFLG_SWIEPH | SEFLG_SPEED
- **Sidereal:** swe_set_sid_mode(SE_SIDM_LAHIRI) (sidereal_lahiri seçiliyse)

### 3. Cache (`cache/chartCache.ts`)
- Firestore: `astroChartCache`
- TTL: 2 gün
- Key: sha256(utcISO|lat|lon|zodiacSystem|houseSystem|nodeType|lilithType|wantAspects)

### 4. index.ts
- getAstroChart stub kaldırıldı, gerçek implementasyon eklendi
- Rate limit, cache lookup, computeFullChart, cache write

### 5. Client (CloudChartService.ts)
- Cloud response → AstroData transform (`cloudChartToAstroData`)
- positions, angles, houses, moonPhase, aspects oluşturuluyor

## Body ID → SE Constant

| Body      | SE ID |
|-----------|-------|
| Sun       | 0     |
| Moon      | 1     |
| Mercury   | 2     |
| Venus     | 3     |
| Mars      | 4     |
| Jupiter   | 5     |
| Saturn    | 6     |
| Uranus    | 7     |
| Neptune   | 8     |
| Pluto     | 9     |
| Mean Node | 10    |
| True Node | 11    |
| Mean Lilith | 12   |
| True Lilith | 13   |
| Chiron    | 15    |
| Ceres/Pallas/Juno/Vesta | bodies.ts (4,5,6,7) |

## Cache Key Format

```
sha256(utcISO|lat|lon|zodiacSystem|houseSystem|nodeType|lilithType|wantAspects)
```

## Deploy Test

```bash
cd aura-pro-ephemeris-service
cd functions && npm install && npm run build && cd ..
firebase deploy --only functions:getAstroChart
```

Test çağrısı:
```javascript
getAstroChart({
  utcISO: "1992-03-30T05:30:00.000Z",
  lat: 41.0082,
  lon: 28.9784,
  zodiacSystem: "tropical",
  houseSystem: "placidus",
  debug: true
})
```

## Beklenen Log (başarı)

- `[getAstroChart] Cache MISS - computing`
- `[chartSwiss] JD_UT: ... JD_TT: ...`
- `[getAstroChart] Swiss Ephemeris chart computed`

Client tarafında: `ONLINE ATTEMPT SUCCESS → SWITCH TO ONLINE`
