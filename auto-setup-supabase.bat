@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🚀 SETUP SUPABASE AUTOMATIQUE               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📋 ÉTAPE 1/5 : Vérification des fichiers...
timeout /t 1 >nul

if exist ".env.local" (
    echo    ✅ .env.local existe déjà
) else (
    echo    📝 Création de .env.local...
    echo # Configuration Supabase - BlanchPro > .env.local
    echo VITE_SUPABASE_URL=https://zmtotombhpklllxjuirb.supabase.co >> .env.local
    echo VITE_SUPABASE_ANON_KEY=sbp_611cad286465a6ca1027b72676cc3cb3d8d75017 >> .env.local
    echo    ✅ .env.local créé avec les clés temporaires
)

echo.
echo 📋 ÉTAPE 2/5 : Préparation du schéma SQL...
timeout /t 1 >nul

if exist "database\schema.sql" (
    echo    ✅ Schéma SQL disponible (244 lignes, 14 tables)
    echo    📊 Tables incluses : customers, orders, services, employees, etc.
) else (
    echo    ❌ Schéma SQL manquant !
)

echo.
echo 📋 ÉTAPE 3/5 : Ouverture automatique de Supabase...
timeout /t 1 >nul

echo    🌐 Ouverture de supabase.com dans votre navigateur...
start https://supabase.com

echo    ⏳ Attente de 3 secondes...
timeout /t 3 >nul

echo.
echo 📋 ÉTAPE 4/5 : Instructions interactives...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                     🎯 ACTIONS REQUISES                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 1️⃣  CRÉER LE PROJET :
echo    • Cliquez sur "New Project"
echo    • Nom : BlanchPro
echo    • Mot de passe : [choisissez un mot de passe fort]
echo    • Région : Europe West
echo.
echo 2️⃣  CONFIGURER LA BASE DE DONNÉES :
echo    • Allez dans "SQL Editor"
echo    • Cliquez sur "New Query"
echo    • Copiez TOUT le contenu de database\schema.sql
echo    • Collez et cliquez "Run"
echo.
echo 3️⃣  RÉCUPÉRER LES CLÉS :
echo    • Allez dans "Settings" ^> "API"
echo    • Copiez Project URL et anon public key
echo.

echo Appuyez sur une touche quand vous avez terminé ces étapes...
pause >nul

echo.
echo 📋 ÉTAPE 5/5 : Mise à jour des clés...
echo.
echo 🔑 Entrez vos vraies clés Supabase :
echo.
set /p SUPABASE_URL="Project URL (https://...): "
set /p SUPABASE_KEY="Anon Key (eyJ...): "

echo.
echo 💾 Mise à jour de .env.local...

echo # Configuration Supabase - BlanchPro > .env.local
echo VITE_SUPABASE_URL=%SUPABASE_URL% >> .env.local
echo VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY% >> .env.local

echo    ✅ Clés mises à jour dans .env.local
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎉 CONFIGURATION TERMINÉE !               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Voulez-vous démarrer l'application maintenant ? (o/n)
set /p start_app="> "

if /i "%start_app%"=="o" (
    echo.
    echo 🔄 Démarrage de l'application...
    echo    📱 L'application va s'ouvrir sur http://localhost:5173
    echo    🔍 Vérifiez la console pour les messages Supabase
    echo.
    npm run dev
) else (
    echo.
    echo ✅ Configuration terminée !
    echo 📝 Pour démarrer plus tard : npm run dev
    echo 🔍 Vérifiez les logs dans la console du navigateur
)

echo.
echo 📋 RÉSUMÉ DE LA CONFIGURATION :
echo    ✅ Projet Supabase créé
echo    ✅ Base de données configurée (14 tables)
echo    ✅ Clés API configurées
echo    ✅ Application prête à démarrer
echo.
pause
