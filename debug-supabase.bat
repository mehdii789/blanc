@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🔍 DEBUG SUPABASE - DIAGNOSTIC                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📋 Problème identifié : Stockage Supabase affiche 0
echo.

echo 🔍 CAUSES POSSIBLES :
echo    1️⃣  L'application utilise localStorage au lieu de Supabase
echo    2️⃣  Les clés API Supabase sont incorrectes
echo    3️⃣  La base de données Supabase est vide
echo    4️⃣  Les politiques RLS bloquent l'accès
echo    5️⃣  Erreur de configuration réseau
echo.

echo 📊 VÉRIFICATIONS AUTOMATIQUES :
echo.

echo 1. Vérification du fichier .env.local...
if exist ".env.local" (
    echo    ✅ .env.local existe
    echo    📄 Contenu :
    type .env.local
) else (
    echo    ❌ .env.local manquant !
    echo    🔧 Création du fichier...
    echo VITE_SUPABASE_URL=https://zmtotombhpklllxjuirb.supabase.co > .env.local
    echo VITE_SUPABASE_ANON_KEY=sbp_611cad286465a6ca1027b72676cc3cb3d8d75017 >> .env.local
    echo    ✅ .env.local créé avec les clés par défaut
)

echo.
echo 2. Vérification de la configuration...
if exist "src\config\database.ts" (
    echo    ✅ Configuration trouvée
    findstr "USE_SUPABASE" src\config\database.ts
) else (
    echo    ❌ Fichier de configuration manquant
)

echo.
echo 3. Ouverture de l'application pour diagnostic...
if exist "node_modules" (
    echo    ✅ Dépendances installées
) else (
    echo    ⚠️  Installation des dépendances...
    npm install --legacy-peer-deps
)

echo.
echo 🌐 Ouverture de la page de monitoring...
start http://localhost:5173/supabase-monitoring

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📋 INSTRUCTIONS DE DEBUG                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 1️⃣  DIAGNOSTIC AUTOMATIQUE :
echo    • Allez sur la page de monitoring qui vient de s'ouvrir
echo    • Cliquez sur "Lancer le diagnostic" dans la section "Diagnostic Supabase"
echo    • Observez les résultats du test
echo.
echo 2️⃣  VÉRIFICATION MANUELLE :
echo    • Ouvrez la console du navigateur (F12)
echo    • Cherchez les messages d'erreur Supabase
echo    • Vérifiez si vous voyez "🔍 Récupération des statistiques réelles"
echo.
echo 3️⃣  TEST DE CRÉATION :
echo    • Créez un nouveau client dans l'application
echo    • Vérifiez si le compteur de stockage change
echo    • Regardez les logs dans la console
echo.
echo 4️⃣  VÉRIFICATION SUPABASE :
echo    • Ouvrez votre dashboard Supabase
echo    • Vérifiez que les tables contiennent des données
echo    • Vérifiez les politiques RLS
echo.

echo 🎯 RÉSULTATS ATTENDUS :
echo    ✅ Diagnostic : "Connexion établie" + nombre de lignes > 0
echo    ✅ Console : Messages de récupération des statistiques
echo    ✅ Stockage : Barres de progression avec données réelles
echo    ✅ Tables : Nombre de lignes affiché pour chaque table
echo.

echo 🔧 SOLUTIONS SELON LE PROBLÈME :
echo    • Base vide → Créer des données dans l'application
echo    • Connexion échouée → Vérifier les clés API
echo    • RLS bloque → Vérifier les politiques Supabase
echo    • localStorage utilisé → Vérifier USE_SUPABASE=true
echo.

echo 📞 SUPPORT :
echo    Si le problème persiste, fournissez :
echo    • Résultats du diagnostic automatique
echo    • Messages d'erreur de la console
echo    • Statut des tables dans Supabase
echo.

echo Appuyez sur une touche pour continuer...
pause >nul
