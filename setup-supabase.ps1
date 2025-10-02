# Script PowerShell de configuration Supabase
Write-Host "🚀 Configuration automatique de Supabase..." -ForegroundColor Green

$PROJECT_ID = "zmtotombhpklllxjuirb"
$SUPABASE_URL = "https://$PROJECT_ID.supabase.co"

# Créer le contenu du fichier .env.local
$envContent = @"
# Configuration Supabase
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Instructions:
# 1. Allez dans votre projet Supabase: https://supabase.com/dashboard/project/$PROJECT_ID
# 2. Cliquez sur "Settings" > "API"
# 3. Copiez la clé "anon public" et remplacez YOUR_ANON_KEY_HERE ci-dessus
# 4. Exécutez le script SQL dans l'éditeur SQL de Supabase (fichier database/schema.sql)
"@

try {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de créer .env.local automatiquement" -ForegroundColor Yellow
    Write-Host "Créez manuellement le fichier .env.local avec ce contenu:" -ForegroundColor Yellow
    Write-Host $envContent -ForegroundColor Cyan
}

# Vérifier package.json
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $hasSupabase = $packageJson.dependencies.'@supabase/supabase-js'
    
    if (-not $hasSupabase) {
        Write-Host "📦 Installation de la dépendance Supabase..." -ForegroundColor Yellow
        npm install @supabase/supabase-js
    } else {
        Write-Host "✅ Dépendance Supabase déjà installée" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ package.json non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez dans votre projet Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$PROJECT_ID" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Dans 'Settings' > 'API', copiez votre clé 'anon public'" -ForegroundColor White
Write-Host ""
Write-Host "3. Éditez le fichier .env.local et remplacez YOUR_ANON_KEY_HERE" -ForegroundColor White
Write-Host ""
Write-Host "4. Dans l'éditeur SQL de Supabase, exécutez le contenu du fichier:" -ForegroundColor White
Write-Host "   database/schema.sql" -ForegroundColor Blue
Write-Host ""
Write-Host "5. Lancez votre application et allez sur:" -ForegroundColor White
Write-Host "   http://localhost:5173/monitoring-demo" -ForegroundColor Blue
Write-Host ""
Write-Host "6. Pour voir le monitoring réel (après configuration):" -ForegroundColor White
Write-Host "   http://localhost:5173/monitoring" -ForegroundColor Blue
Write-Host ""
Write-Host "✨ Votre tableau de bord de monitoring est prêt !" -ForegroundColor Green
