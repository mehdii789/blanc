@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              📋 COPIE AUTOMATIQUE DU SCHÉMA SQL              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📄 Copie du schéma SQL dans le presse-papiers...

if exist "database\schema.sql" (
    type "database\schema.sql" | clip
    echo    ✅ Schéma SQL copié dans le presse-papiers !
    echo.
    echo 📋 INSTRUCTIONS :
    echo    1. Allez dans votre projet Supabase
    echo    2. Cliquez sur "SQL Editor"
    echo    3. Cliquez sur "New Query"
    echo    4. Faites Ctrl+V pour coller le schéma
    echo    5. Cliquez sur "Run" pour exécuter
    echo.
    echo 🌐 Ouverture de Supabase...
    start https://supabase.com
) else (
    echo    ❌ Fichier database\schema.sql introuvable !
)

echo.
pause
