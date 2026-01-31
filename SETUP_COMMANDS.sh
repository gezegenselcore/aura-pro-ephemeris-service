#!/bin/bash
# AURA PRO Ephemeris Service - Setup Commands
# Run these commands in order

set -e

echo "🚀 AURA PRO Ephemeris Service Setup"
echo "=================================="

# 1. GCS Bucket oluştur
echo ""
echo "1️⃣ Creating GCS bucket..."
gcloud config set project $(firebase use --quiet 2>/dev/null || echo "YOUR_PROJECT_ID")
gsutil mb -p $(gcloud config get-value project) -c STANDARD -l europe-west3 gs://aura-ephemeris || echo "Bucket may already exist"

# 2. Klasör yapısı
echo ""
echo "2️⃣ Creating folder structure..."
gsutil mkdir gs://aura-ephemeris/sweph/ || echo "Folder may already exist"

# 3. Ephemeris dosyalarını yükle (kullanıcı manuel indirmeli)
echo ""
echo "3️⃣ Upload ephemeris files..."
echo "   ⚠️  First, download files from: https://www.astro.com/swisseph/swephinfo_e.htm"
echo "   Then run:"
echo "   gsutil cp sepl_18.se1 gs://aura-ephemeris/sweph/"
echo "   gsutil cp semo_18.se1 gs://aura-ephemeris/sweph/"
echo "   gsutil cp seas_18.se1 gs://aura-ephemeris/sweph/"

# 4. Firebase Environment Variables
echo ""
echo "4️⃣ Setting Firebase environment variables..."
firebase functions:config:set \
  ephemeris.bucket="aura-ephemeris" \
  ephemeris.prefix="sweph/" \
  cache.ttl_days="3" \
  ratelimit.per_day="100" || echo "Note: Use Firebase Console for Functions v2"

# 5. Firestore Rules
echo ""
echo "5️⃣ Deploying Firestore rules..."
firebase deploy --only firestore:rules

# 6. Doğrulama
echo ""
echo "6️⃣ Verifying setup..."
echo "   Bucket contents:"
gsutil ls -lh gs://aura-ephemeris/sweph/ || echo "   ⚠️  Files not uploaded yet"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Download ephemeris files (sepl_18.se1, semo_18.se1, seas_18.se1)"
echo "2. Upload to gs://aura-ephemeris/sweph/"
echo "3. Set environment variables in Firebase Console"
echo "4. Deploy function: firebase deploy --only functions:getProEphemeris"
