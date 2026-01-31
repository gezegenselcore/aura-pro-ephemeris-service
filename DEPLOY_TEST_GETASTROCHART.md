# getAstroChart Deploy Test

## Test Call

```javascript
// Firebase Functions shell veya client'tan:
getAstroChart({
  utcISO: "1992-03-30T05:30:00.000Z",
  lat: 41.0082,
  lon: 28.9784,
  zodiacSystem: "tropical",
  houseSystem: "placidus",
  nodeType: "mean",
  lilithType: "mean",
  wantAspects: true,
  debug: true
})
```

## Beklenen Response

```json
{
  "chart": {
    "bodies": {
      "Sun": { "lonDeg": <0..360>, "latDeg": ..., "speedLonDegPerDay": ..., "retrograde": false },
      "Moon": { ... },
      "Mercury": { ... },
      ...
      "Chiron": { ... },
      "ASC": { "lonDeg": ..., "latDeg": 0 },
      "MC": { ... }
    },
    "angles": { "ascDeg": ..., "mcDeg": ..., "dscDeg": ..., "icDeg": ... },
    "houses": { "cuspsDeg": [ <12 values 0..360> ] },
    "aspects": [ { "a": "...", "b": "...", "type": "...", "orbDeg": ..., "exactDeg": ... } ]
  },
  "meta": {
    "provider": "swisseph",
    "jdUt": ...,
    "jdTt": ...,
    "zodiacSystem": "tropical",
    "houseSystem": "placidus",
    "cached": false,
    "version": "v1",
    "debugSnapshot": { "ephePathSet": true, "filesPresent": ["sepl_18.se1", "semo_18.se1", "seas_18.se1"], "jdUt": ..., "jdTt": ... }
  }
}
```

When `debug: true`, `meta.debugSnapshot` is present (only on compute, not on cached response).

## Body ID → SE Constant

| Body      | SE Constant   |
|-----------|---------------|
| Sun       | 0             |
| Moon      | 1             |
| Mercury   | 2             |
| Venus     | 3             |
| Mars      | 4             |
| Jupiter   | 5             |
| Saturn    | 6             |
| Uranus    | 7             |
| Neptune   | 8             |
| Pluto     | 9             |
| Mean Node | 10            |
| True Node | 11            |
| Mean Lilith | 12          |
| True Lilith | 13          |
| Chiron    | 15            |
| Ceres     | 4 (bodies.ts) |
| Pallas    | 5             |
| Juno      | 6             |
| Vesta     | 7             |

## Cache Key Format

`sha256(utcISO|lat|lon|zodiacSystem|houseSystem|nodeType|lilithType|wantAspects)`

TTL: 2 gün

## Deploy

```bash
cd aura-pro-ephemeris-service
cd functions
npm install
npm run build
cd ..
firebase login   # copuryasemin19@gmail.com
firebase use <projectId>
firebase deploy --only functions:getAstroChart
```

## Smoke test (self-contained, no Firebase client SDK)

Script: `scripts/test-deployed-astrochart.js` — uses firebase-admin (custom token) + REST signInWithCustomToken + POST callable URL.

### Env (required)

- **GOOGLE_APPLICATION_CREDENTIALS** — path to service account JSON (Cloud Functions Invoker + Firestore + Storage read).
- **FIREBASE_WEB_API_KEY** — Firebase Web API key (for signInWithCustomToken).
- **GCLOUD_PROJECT** — optional, default `aura-2ca80`.

### 5 test cases + thresholds

1. **Tropical** — Sun, angles, houses length 12; longitudes 0..360.
2. **Sidereal Lahiri** — Sun diff from tropical ≥ 10°.
3. **Mean vs true node** — NorthNode diff > 0.01°.
4. **Houses** — cuspsDeg length 12; asc–cusp1 diff < 5°.
5. **Cache** — second call `meta.cached === true`.

Optional (6): **debugSnapshot** — request with `debug: true` and distinct utcISO; `meta.debugSnapshot` has `ephePathSet`, `filesPresent`, `jdUt`, `jdTt`.

### Run locally

```bash
cd aura-pro-ephemeris-service
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
export FIREBASE_WEB_API_KEY=your-web-api-key
npm run smoke:astrochart
```

Expected: `PASS: 5/5 tests passed.` — exit 0.

### CI (GitHub Actions)

Workflow: `.github/workflows/smoke-getAstroChart.yml` — **GezegenselCore/aura-pro-ephemeris-service** repo kökünde (AURA işlemleri Gezegensel Core içinde).

- **Trigger:** push to `main` (paths: `scripts/**`, `functions/**`, `package.json`, workflow file) or `workflow_dispatch`.
- **Secrets:** `GOOGLE_APPLICATION_CREDENTIALS_JSON` (full SA JSON), `FIREBASE_WEB_API_KEY` (repo veya GezegenselCore org).
- **Artifact:** `smoke-getAstroChart-log` (smoke-log.txt) on success/failure.
