@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🔑 MISE À JOUR CLÉS SUPABASE                    ║
echo ╚══════════════════════════════════════════════════════════════╗
echo.

echo 📋 CLÉS ACTUELLES (INVALIDES) :
echo.
type .env.local 2>nul || echo Fichier .env.local introuvable
echo.

echo 🎯 RÉCUPÉRATION DE VOS VRAIES CLÉS :
echo.
echo 1️⃣  Dans Supabase Dashboard (qui vient de s'ouvrir) :
echo    • Allez dans Settings ^> API
echo    • Copiez Project URL et anon public key
echo.

echo 2️⃣  SAISIE DES NOUVELLES CLÉS :
echo.
set /p project_url="Project URL (https://xxx.supabase.co): "
set /p anon_key="anon public key (eyJ...): "

echo.
echo 💾 Mise à jour de .env.local...

echo # Configuration Supabase - BlanchPro > .env.local
echo VITE_SUPABASE_URL=%project_url% >> .env.local
echo VITE_SUPABASE_ANON_KEY=%anon_key% >> .env.local

echo    ✅ Clés mises à jour !
echo.

echo 📄 NOUVELLES CLÉS :
type .env.local
echo.

echo 🗃️  CRÉATION DU SCHÉMA DE BASE DE DONNÉES :
echo    Maintenant, vous devez créer les tables dans Supabase.
echo.

echo 📋 Voulez-vous copier le schéma SQL ? (o/n)
set /p copy_schema="> "

if /i "%copy_schema%"=="o" (
    echo.
    echo 📄 Copie du schéma SQL dans le presse-papiers...
    type "database\schema-safe.sql" | clip
    echo    ✅ Schéma copié !
    echo.
    echo 📝 INSTRUCTIONS :
    echo    1. Retournez dans Supabase Dashboard
    echo    2. Allez dans SQL Editor
    echo    3. Cliquez "New Query"
    echo    4. Collez le schéma (Ctrl+V)
    echo    5. Cliquez "Run"
)

echo.
echo 🔄 REDÉMARRAGE DE L'APPLICATION :
echo    L'application doit être redémarrée pour utiliser les nouvelles clés.
echo.

echo 🚀 Redémarrer maintenant ? (o/n)
set /p restart="> "

if /i "%restart%"=="o" (
    echo.
    echo 🔄 Redémarrage...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
    start /min cmd /c "npm run dev"
    timeout /t 8 >nul
    start http://localhost:5173/supabase-monitoring
    echo    ✅ Application redémarrée !
    echo    🌐 Page de monitoring ouverte
) else (
    echo.
    echo ✅ Configuration terminée !
    echo 📝 Pour tester :
    echo    1. Redémarrez : npm run dev
    echo    2. Testez : http://localhost:5173/supabase-monitoring
)

echo.
echo 🎯 VÉRIFICATION FINALE :
echo    • Le diagnostic devrait afficher "Connexion établie"
echo    • Créez quelques clients pour voir le stockage augmenter
echo    • Le monitoring affichera les vraies données Supabase
echo.

pause
