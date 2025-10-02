@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🔧 CORRECTION SUPABASE - BLANCHPRO              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  PROBLÈME DÉTECTÉ : Tables déjà existantes
echo.
echo 📋 SOLUTIONS DISPONIBLES :
echo.
echo 1️⃣  RÉINITIALISATION COMPLÈTE (recommandé)
echo    • Supprime toutes les tables existantes
echo    • Recrée tout proprement
echo    • Aucune perte de données (tables vides)
echo.
echo 2️⃣  CRÉATION SÉCURISÉE
echo    • Utilise IF NOT EXISTS
echo    • Évite les conflits
echo    • Garde les données existantes
echo.
echo 3️⃣  CONTINUER SANS MODIFICATION
echo    • Les tables existent déjà
echo    • Peut fonctionner tel quel
echo.

set /p choice="Choisissez une option (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 🔄 OPTION 1 : Réinitialisation complète
    echo.
    echo 📋 ÉTAPES :
    echo    1. Copiez le contenu de database\reset-schema.sql
    echo    2. Exécutez-le dans Supabase SQL Editor
    echo    3. Puis exécutez database\schema.sql
    echo.
    echo 📄 Copie du script de réinitialisation...
    type "database\reset-schema.sql" | clip
    echo    ✅ Script de réinitialisation copié dans le presse-papiers !
    echo.
    echo 🌐 Ouverture de Supabase...
    start https://supabase.com
    echo.
    echo 📋 INSTRUCTIONS :
    echo    1. Allez dans SQL Editor
    echo    2. Collez le script de réinitialisation (Ctrl+V)
    echo    3. Cliquez "Run"
    echo    4. Puis exécutez le schéma principal
    
) else if "%choice%"=="2" (
    echo.
    echo 🛡️  OPTION 2 : Création sécurisée
    echo.
    echo 📄 Copie du schéma sécurisé...
    type "database\schema-safe.sql" | clip
    echo    ✅ Schéma sécurisé copié dans le presse-papiers !
    echo.
    echo 🌐 Ouverture de Supabase...
    start https://supabase.com
    echo.
    echo 📋 INSTRUCTIONS :
    echo    1. Allez dans SQL Editor
    echo    2. Collez le schéma sécurisé (Ctrl+V)
    echo    3. Cliquez "Run"
    echo    4. Aucun conflit, création seulement si nécessaire
    
) else if "%choice%"=="3" (
    echo.
    echo ✅ OPTION 3 : Continuer sans modification
    echo.
    echo 🎯 Les tables existent déjà, votre base de données est probablement prête !
    echo.
    echo 🚀 Voulez-vous démarrer l'application maintenant ? (o/n)
    set /p start_now="> "
    
    if /i "%start_now%"=="o" (
        echo.
        echo 🔄 Démarrage de l'application...
        npm run dev
    ) else (
        echo.
        echo ✅ Configuration terminée !
        echo 📝 Pour démarrer : npm run dev
    )
    
) else (
    echo.
    echo ❌ Option invalide. Relancez le script.
)

echo.
echo 💡 CONSEIL : Si vous n'êtes pas sûr, choisissez l'option 2 (création sécurisée)
echo.
pause
