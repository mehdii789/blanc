@echo off
echo.
echo ===============================================================
echo      CORRECTION DES FICHIERS POUR HOSTINGER
echo ===============================================================
echo.
echo Creation du fichier .htaccess corrige...

copy /Y "UPLOAD_HOSTINGER\.htaccess" "UPLOAD_HOSTINGER\public_html\.htaccess" >nul
copy /Y "UPLOAD_HOSTINGER\api\.htaccess" "UPLOAD_HOSTINGER\public_html\api\.htaccess" >nul

echo Fichiers .htaccess corriges et copies !
echo.
echo ===============================================================
echo      INSTRUCTIONS ULTRA-SIMPLES
echo ===============================================================
echo.
echo 1. Allez sur https://hpanel.hostinger.com
echo 2. Sites Web - Gerer - Gestionnaire de fichiers
echo 3. Ouvrez public_html/
echo 4. Uploadez ces 2 fichiers (remplacez si demande) :
echo    - UPLOAD_HOSTINGER\public_html\.htaccess
echo    - UPLOAD_HOSTINGER\public_html\api\.htaccess
echo.
echo 5. Testez : https://brown-coyote-823292.hostingersite.com
echo.
echo ===============================================================
echo.
pause

explorer UPLOAD_HOSTINGER\public_html
