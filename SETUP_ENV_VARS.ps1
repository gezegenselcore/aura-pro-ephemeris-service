# Firebase Functions Environment Variables Setup Script
# PowerShell script to display environment variables for Firebase Functions v2

Write-Host "🔧 Firebase Functions Environment Variables Setup" -ForegroundColor Cyan
Write-Host ""

# Firebase project
$PROJECT_ID = "aura-2ca80"

# Environment variables
$ENV_VARS = @{
    "EPHEMERIS_BUCKET" = "aura-ephemeris"
    "EPHEMERIS_PREFIX" = "sweph/"
    "EPHEMERIS_VERSION" = "18"
    "RATE_LIMIT_PER_DAY" = "100"
    "FUNCTION_REGION" = "europe-west3"
}

Write-Host "📋 Environment variables for project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ Environment variables to set:" -ForegroundColor Green
Write-Host ""
foreach ($key in $ENV_VARS.Keys) {
    $value = $ENV_VARS[$key]
    Write-Host "  $key = $value" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID/functions" -ForegroundColor White
Write-Host "2. Click on 'getProEphemeris' function" -ForegroundColor White
Write-Host "3. Go to 'Configuration' tab" -ForegroundColor White
Write-Host "4. Scroll to 'Environment variables' section" -ForegroundColor White
Write-Host "5. Add each variable listed above" -ForegroundColor White
Write-Host ""
