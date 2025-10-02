@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🔍 TEST DU MONITORING SUPABASE                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📋 Vérification de l'application...
timeout /t 1 >nul

REM Vérifier si l'application est démarrée
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Application accessible sur http://localhost:5173
) else (
    echo    ❌ Application non accessible
    echo    🚀 Démarrage de l'application...
    start /min npm run dev
    echo    ⏳ Attente du démarrage (10 secondes)...
    timeout /t 10 >nul
)

echo.
echo 📊 Test des fonctionnalités de monitoring...
echo.

echo 1️⃣  Page de monitoring Supabase
echo    📍 URL: http://localhost:5173/supabase-monitoring
echo    🔍 Fonctionnalités à tester:
echo       • Métriques en temps réel
echo       • Test de connexion Supabase
echo       • Statistiques de la base de données
echo       • Graphiques de performance
echo.

echo 2️⃣  Alerte de notification
echo    📍 Visible en haut de l'application
echo    🔍 Fonctionnalités:
echo       • Notification du monitoring activé
echo       • Lien direct vers la page de monitoring
echo       • Possibilité de fermer l'alerte
echo.

echo 3️⃣  Navigation dans la sidebar
echo    📍 Menu "Supabase Monitor" avec icône base de données
echo    🔍 Fonctionnalités:
echo       • Accès direct depuis le menu principal
echo       • Icône distinctive (Database)
echo       • Intégration avec le système de navigation
echo.

echo 🌐 Ouverture automatique de l'application...
start http://localhost:5173/supabase-monitoring

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📋 CHECKLIST DE TEST                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ☐ 1. L'alerte bleue apparaît en haut de la page
echo ☐ 2. Le menu "Supabase Monitor" est visible dans la sidebar
echo ☐ 3. La page de monitoring s'ouvre correctement
echo ☐ 4. Les métriques s'affichent (requêtes, succès, erreurs, temps)
echo ☐ 5. Le bouton "Tester la connexion" fonctionne
echo ☐ 6. Les statistiques de la base de données se chargent
echo ☐ 7. Le statut de connexion est affiché
echo ☐ 8. Les actions de monitoring sont disponibles
echo.

echo 🎯 RÉSULTATS ATTENDUS :
echo    ✅ Statut: Connected (vert) ou Error (rouge)
echo    ✅ Métriques: Nombres > 0 après quelques actions
echo    ✅ Test connexion: Message de succès ou d'erreur
echo    ✅ Stats DB: Nombre de clients, commandes, etc.
echo.

echo 🔧 EN CAS DE PROBLÈME :
echo    1. Vérifiez que Supabase est configuré (.env.local)
echo    2. Vérifiez la console du navigateur (F12)
echo    3. Testez la connexion manuellement
echo    4. Vérifiez les clés API Supabase
echo.

echo Appuyez sur une touche pour fermer...
pause >nul
