@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🔑 CORRECTION DES CLÉS SUPABASE                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo ❌ PROBLÈME IDENTIFIÉ : Invalid API key
echo.
echo 🔍 CAUSE : Les clés dans .env.local sont des exemples, pas vos vraies clés
echo.

echo 📋 CLÉS ACTUELLES (INVALIDES) :
type .env.local
echo.

echo 🎯 SOLUTION : Récupérer vos vraies clés Supabase
echo.

echo 📝 ÉTAPES À SUIVRE :
echo.
echo 1️⃣  OUVRIR VOTRE PROJET SUPABASE
echo    🌐 Ouverture automatique...
start https://supabase.com/dashboard

echo.
echo 2️⃣  NAVIGATION DANS SUPABASE
echo    • Connectez-vous à votre compte Supabase
echo    • Sélectionnez votre projet (ou créez-en un nouveau)
echo    • Allez dans Settings ^> API (dans la sidebar gauche)
echo.

echo 3️⃣  RÉCUPÉRER LES CLÉS
echo    📋 Copiez ces deux valeurs :
echo    • Project URL (commence par https://...supabase.co)
echo    • anon public key (commence par eyJ...)
echo.

echo 4️⃣  MISE À JOUR AUTOMATIQUE
echo.
set /p project_url="Collez votre Project URL: "
set /p anon_key="Collez votre anon public key: "

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

echo 🔄 REDÉMARRAGE NÉCESSAIRE
echo    L'application doit être redémarrée pour prendre en compte les nouvelles clés.
echo.

echo 🚀 Voulez-vous redémarrer l'application maintenant ? (o/n)
set /p restart="> "

if /i "%restart%"=="o" (
    echo.
    echo 🔄 Redémarrage de l'application...
    echo    ⏳ Arrêt du serveur actuel...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
    echo    🚀 Redémarrage...
    start /min npm run dev
    timeout /t 5 >nul
    echo    🌐 Ouverture de la page de test...
    start http://localhost:5173/supabase-monitoring
) else (
    echo.
    echo ✅ Configuration terminée !
    echo 📝 Pour tester : Redémarrez manuellement l'application
    echo    1. Arrêtez le serveur (Ctrl+C)
    echo    2. Relancez : npm run dev
    echo    3. Testez : http://localhost:5173/supabase-monitoring
)

echo.
echo 🎯 APRÈS LE REDÉMARRAGE :
echo    • Allez sur la page de monitoring
echo    • Cliquez sur "Lancer le diagnostic"
echo    • Vous devriez voir "Connexion établie" ✅
echo    • Le stockage affichera les vraies données
echo.

echo Appuyez sur une touche pour fermer...
pause >nul
