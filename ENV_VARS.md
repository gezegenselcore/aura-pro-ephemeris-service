# AURA PRO Ephemeris Service — Environment Variables

## Runtime Environment Variables

Cloud Function `getProEphemeris` uses these env vars (with defaults):

| Variable | Default | Açıklama |
|----------|---------|----------|
| `EPHEMERIS_BUCKET` | `aura-ephemeris` | GCS bucket adı |
| `EPHEMERIS_PREFIX` | `sweph/` | Bucket içi klasör prefix |

**GCS path format:** `gs://{EPHEMERIS_BUCKET}/{EPHEMERIS_PREFIX}<dosya>`

Örnek: `gs://aura-ephemeris/sweph/sepl_18.se1`

## Ayar Yöntemi

### Google Cloud Console

1. https://console.cloud.google.com/functions
2. Proje: `aura-2ca80` (veya ilgili Firebase projesi)
3. `getProEphemeris` fonksiyonunu seç
4. **Edit** → **Runtime, build, connections and security** → **Environment variables**
5. Ekle:
   - `EPHEMERIS_BUCKET` = `aura-ephemeris`
   - `EPHEMERIS_PREFIX` = `sweph/`

### gcloud CLI

```bash
gcloud functions deploy getProEphemeris \
  --set-env-vars "EPHEMERIS_BUCKET=aura-ephemeris,EPHEMERIS_PREFIX=sweph/"
```

**Not:** firebase.json env vars desteklemez; Cloud Console veya gcloud ile ayarlanır.
Code içinde default değerler vardır — GCS bucket/project aynıysa değiştirmenize gerek yok.
