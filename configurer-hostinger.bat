@echo off
chcp 65001 >nul
echo.
echo ⚙️  Configuration des fichiers Hostinger...
echo.

(
echo ^<?php
echo define^('DB_HOST', 'localhost'^);
echo define^('DB_NAME', 'blanchisserie'^);
echo define^('DB_USER', 'Blanc_admin'^);
echo define^('DB_PASS', 'a8VFD@w#IO2*'^);
echo define^('DB_CHARSET', 'utf8mb4'^);
echo define^('ALLOWED_ORIGINS', ['https://brown-coyote-823292.hostingersite.com', 'http://localhost:3000']^);
echo define^('API_VERSION', '1.0.0'^);
echo define^('TIMEZONE', 'Europe/Paris'^);
echo define^('DEBUG_MODE', false^);
echo if ^(DEBUG_MODE^) { error_reporting^(E_ALL^); ini_set^('display_errors', 1^); }
echo else { error_reporting^(0^); ini_set^('display_errors', 0^); }
echo date_default_timezone_set^(TIMEZONE^);
) > hostinger\api\config.php
echo ✅ config.php configuré

(
echo # Configuration Hostinger - Production
echo VITE_HOSTINGER_API_URL=https://brown-coyote-823292.hostingersite.com/api
echo VITE_USE_HOSTINGER=true
echo.
echo # Desactiver Supabase en production
echo VITE_USE_SUPABASE=false
) > .env.production
echo ✅ .env.production configuré

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║    ✅ CONFIGURATION TERMINÉE !                  ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo Configuration appliquée :
echo   - Base : blanchisserie
echo   - User : Blanc_admin
echo   - Domaine : brown-coyote-823292.hostingersite.com
echo.
echo 📋 Prochaine étape : npm run build
echo.
pause