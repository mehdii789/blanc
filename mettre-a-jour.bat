@echo off
echo.
echo ===============================================================
echo      MISE A JOUR DE L'APPLICATION HOSTINGER
echo ===============================================================
echo.
echo Etape 1/3 : Build du projet...
call npm run build
if errorlevel 1 (
    echo.
    echo ERREUR lors du build !
    pause
    exit /b 1
)

echo.
echo Etape 2/3 : Preparation des fichiers...
if exist "UPLOAD_HOSTINGER\public_html" rmdir /s /q "UPLOAD_HOSTINGER\public_html"
mkdir "UPLOAD_HOSTINGER\public_html"
mkdir "UPLOAD_HOSTINGER\public_html\api"

echo.
echo Copie du FRONTEND...
xcopy /E /I /Y "dist\*" "UPLOAD_HOSTINGER\public_html\" >nul

echo.
echo Copie de l'API PHP (si modifications)...
copy /Y "hostinger\api\config.php" "UPLOAD_HOSTINGER\public_html\api\" >nul
copy /Y "hostinger\api\database.php" "UPLOAD_HOSTINGER\public_html\api\" >nul
copy /Y "hostinger\api\index.php" "UPLOAD_HOSTINGER\public_html\api\" >nul

echo.
echo Copie des .htaccess...
copy /Y "UPLOAD_HOSTINGER\.htaccess" "UPLOAD_HOSTINGER\public_html\.htaccess" >nul 2>&1
if not exist "UPLOAD_HOSTINGER\.htaccess" (
    copy /Y "hostinger\.htaccess" "UPLOAD_HOSTINGER\public_html\.htaccess" >nul 2>&1
)
copy /Y "UPLOAD_HOSTINGER\api\.htaccess" "UPLOAD_HOSTINGER\public_html\api\.htaccess" >nul 2>&1

echo.
echo ===============================================================
echo      BUILD TERMINE !
echo ===============================================================
echo.
echo Etape 3/3 : Upload sur Hostinger
echo.
echo 1. Allez sur : https://hpanel.hostinger.com
echo 2. Sites Web - Gerer - Gestionnaire de fichiers
echo 3. Ouvrez public_html/
echo 4. Supprimez les ANCIENS fichiers (gardez api/ si pas modifie)
echo 5. Uploadez TOUT le contenu de :
echo    UPLOAD_HOSTINGER\public_html\
echo.
echo Fichiers prets dans : UPLOAD_HOSTINGER\public_html\
echo.
echo Voulez-vous ouvrir le dossier ? (O/N)
set /p choix=
if /i "%choix%"=="O" explorer UPLOAD_HOSTINGER\public_html
echo.
echo Testez apres upload : https://brown-coyote-823292.hostingersite.com
echo.
pause
