@echo off
echo.
echo ========================================
echo   Configuration Supabase BlanchPro
echo ========================================
echo.

echo 1. Verification des fichiers...
if exist ".env.local" (
    echo    ✅ .env.local existe
) else (
    echo    ❌ .env.local manquant
    echo    Création du fichier .env.local...
    echo # Configuration Supabase > .env.local
    echo VITE_SUPABASE_URL=https://zmtotombhpklllxjuirb.supabase.co >> .env.local
    echo VITE_SUPABASE_ANON_KEY=sbp_611cad286465a6ca1027b72676cc3cb3d8d75017 >> .env.local
    echo    ✅ .env.local créé
)

echo.
echo 2. Verification du schema SQL...
if exist "database\schema.sql" (
    echo    ✅ Schema SQL disponible
) else (
    echo    ❌ Schema SQL manquant
)

echo.
echo 3. Instructions suivantes:
echo    📋 1. Créez votre projet sur supabase.com
echo    📋 2. Exécutez le contenu de database\schema.sql
echo    📋 3. Mettez à jour vos clés dans .env.local
echo    📋 4. Démarrez l'application avec: npm run dev
echo.

echo 4. Voulez-vous démarrer l'application maintenant? (o/n)
set /p choice="> "

if /i "%choice%"=="o" (
    echo.
    echo Démarrage de l'application...
    npm run dev
) else (
    echo.
    echo Configuration terminée !
    echo Démarrez manuellement avec: npm run dev
)

echo.
pause
