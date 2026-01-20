# AURA PRO Ephemeris Service - Setup Commands (PowerShell)
# Run these commands in order

Write-Host "🚀 AURA PRO Ephemeris Service Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. GCS Bucket oluştur (gcloud CLI gerekli)
Write-Host ""
Write-Host "1️⃣ Creating GCS bucket..." -ForegroundColor Yellow
Write-Host "   Run in Google Cloud Console or use gcloud CLI:" -ForegroundColor Gray
Write-Host "   gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l europe-west3 gs://aura-ephemeris" -ForegroundColor White

# 2. Klasör yapısı
Write-Host ""
Write-Host "2️⃣ Creating folder structure..." -ForegroundColor Yellow
Write-Host "   gsutil mkdir gs://aura-ephemeris/sweph/" -ForegroundColor White

# 3. Ephemeris dosyalarını yükle
Write-Host ""
Write-Host "3️⃣ Upload ephemeris files..." -ForegroundColor Yellow
Write-Host "   ⚠️  First, download files from:" -ForegroundColor Red
Write-Host "   https://www.astro.com/swisseph/swephinfo_e.htm" -ForegroundColor Blue
Write-Host ""
Write-Host "   Then run:" -ForegroundColor Gray
Write-Host "   gsutil cp seas_433.se1 gs://aura-ephemeris/sweph/" -ForegroundColor White
Write-Host "   gsutil cp sepl_433.se1 gs://aura-ephemeris/sweph/" -ForegroundColor White

# 4. Firebase Environment Variables
Write-Host ""
Write-Host "4️⃣ Setting Firebase environment variables..." -ForegroundColor Yellow
Write-Host "   Use Firebase Console:" -ForegroundColor Gray
Write-Host "   Functions → getProEphemeris → Configuration → Environment variables" -ForegroundColor White
Write-Host ""
Write-Host "   Add these variables:" -ForegroundColor Gray
Write-Host "   EPHEMERIS_BUCKET = aura-ephemeris" -ForegroundColor White
Write-Host "   EPHEMERIS_PREFIX = sweph/" -ForegroundColor White
Write-Host "   RATE_LIMIT_PER_DAY = 100" -ForegroundColor White
Write-Host "   FUNCTION_REGION = us-central1" -ForegroundColor White

# 5. Firestore Rules
Write-Host ""
Write-Host "5️⃣ Deploying Firestore rules..." -ForegroundColor Yellow
Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor White

# 6. Doğrulama
Write-Host ""
Write-Host "6️⃣ Verifying setup..." -ForegroundColor Yellow
Write-Host "   gsutil ls -lh gs://aura-ephemeris/sweph/" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup commands ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download ephemeris files (seas_433.se1, sepl_433.se1)" -ForegroundColor White
Write-Host "2. Upload to gs://aura-ephemeris/sweph/" -ForegroundColor White
Write-Host "3. Set environment variables in Firebase Console" -ForegroundColor White
Write-Host "4. Deploy function: firebase deploy --only functions:getProEphemeris" -ForegroundColor White
