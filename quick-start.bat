@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🚀 DÉMARRAGE RAPIDE BLANCHPRO                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Vérification de la configuration...
timeout /t 1 >nul

REM Vérifier .env.local
if exist ".env.local" (
    echo    ✅ Configuration Supabase détectée
) else (
    echo    ⚠️  Configuration Supabase manquante
    echo    🔧 Lancement de la configuration automatique...
    call auto-setup-supabase.bat
    exit /b
)

echo.
echo 📦 Vérification des dépendances...
if exist "node_modules" (
    echo    ✅ Dépendances installées
) else (
    echo    📥 Installation des dépendances...
    npm install --legacy-peer-deps
)

echo.
echo 🚀 Démarrage de l'application BlanchPro...
echo    📱 URL : http://localhost:5173
echo    🔍 Vérifiez la console pour les messages Supabase
echo    ⚡ Mode hybride : Supabase + localStorage fallback
echo.

npm run dev
