@echo off
echo.
echo ===============================================================
echo      PREPARATION DES FICHIERS POUR HOSTINGER
echo ===============================================================
echo.

echo 🗂️  Création du dossier d'upload...
if not exist "UPLOAD_HOSTINGER" mkdir UPLOAD_HOSTINGER
if not exist "UPLOAD_HOSTINGER\public_html" mkdir UPLOAD_HOSTINGER\public_html
if not exist "UPLOAD_HOSTINGER\public_html\api" mkdir UPLOAD_HOSTINGER\public_html\api

echo.
echo 📋 Copie du FRONTEND (dist → public_html)...
xcopy /E /I /Y "dist\*" "UPLOAD_HOSTINGER\public_html\" >nul
echo    ✅ Frontend copié

echo.
echo 📋 Copie de l'API PHP...
copy /Y "hostinger\api\config.php" "UPLOAD_HOSTINGER\public_html\api\" >nul
copy /Y "hostinger\api\database.php" "UPLOAD_HOSTINGER\public_html\api\" >nul
copy /Y "hostinger\api\index.php" "UPLOAD_HOSTINGER\public_html\api\" >nul
echo    ✅ API copiée

echo.
echo 📋 Copie du .htaccess...
copy /Y "hostinger\.htaccess" "UPLOAD_HOSTINGER\public_html\.htaccess" >nul
echo    ✅ .htaccess copié

echo.
echo 📋 Création du guide d'upload...
(
echo ═══════════════════════════════════════════════════════════════
echo    📖 GUIDE D'UPLOAD HOSTINGER - ÉTAPES SIMPLES
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ Tous vos fichiers sont prêts dans le dossier :
echo    UPLOAD_HOSTINGER\public_html\
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 1 : ALLER SUR HOSTINGER
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Ouvrez votre navigateur
echo 2. Allez sur : https://hpanel.hostinger.com
echo 3. Connectez-vous
echo 4. Cliquez sur "Sites Web"
echo 5. Cliquez sur "Gérer" à côté de votre site
echo 6. Cliquez sur "Gestionnaire de fichiers"
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 2 : VIDER public_html
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Dans le gestionnaire, ouvrez le dossier "public_html/"
echo 2. Sélectionnez TOUT le contenu (Ctrl+A)
echo 3. Cliquez sur "Supprimer"
echo 4. Confirmez la suppression
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 3 : UPLOADER LE FRONTEND
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Dans public_html/, cliquez sur "Upload" en haut
echo 2. Sélectionnez TOUS les fichiers de :
echo    UPLOAD_HOSTINGER\public_html\
echo    (index.html, .htaccess, 404.html, dossier assets/, dossier api/)
echo 3. Glissez-déposez ou cliquez "Choisir des fichiers"
echo 4. Attendez la fin de l'upload (1-2 minutes)
echo.
echo ⚠️  IMPORTANT : Uploadez aussi le dossier "assets/" ET "api/"
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 4 : VÉRIFIER LA STRUCTURE
echo ═══════════════════════════════════════════════════════════════
echo.
echo Votre public_html/ doit contenir :
echo   ✓ index.html
echo   ✓ .htaccess
echo   ✓ 404.html
echo   ✓ assets/ (dossier avec 2 fichiers dedans)
echo   ✓ api/ (dossier avec 3 fichiers .php dedans)
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 5 : ACTIVER SSL (HTTPS)
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Retournez au tableau de bord de votre site
echo 2. Cliquez sur "Sécurité" dans le menu
echo 3. Cliquez sur "SSL"
echo 4. Activez le "Certificat SSL gratuit"
echo 5. Activez "Forcer HTTPS"
echo 6. Attendez 5-10 minutes
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📋 ÉTAPE 6 : TEST
echo ═══════════════════════════════════════════════════════════════
echo.
echo Ouvrez votre navigateur et testez :
echo.
echo 1. Frontend : https://brown-coyote-823292.hostingersite.com
echo    → Vous devriez voir votre application
echo.
echo 2. API : https://brown-coyote-823292.hostingersite.com/api/customers
echo    → Vous devriez voir : []
echo.
echo ═══════════════════════════════════════════════════════════════
echo  🎉 FÉLICITATIONS !
echo ═══════════════════════════════════════════════════════════════
echo.
echo Votre application est en ligne !
echo.
echo Si vous voyez des erreurs :
echo   - Vérifiez que tous les fichiers sont bien uploadés
echo   - Vérifiez les permissions (755 pour dossiers, 644 pour fichiers)
echo   - Consultez les logs dans hPanel ^> Erreurs
echo.
echo ═══════════════════════════════════════════════════════════════
) > UPLOAD_HOSTINGER\GUIDE_UPLOAD.txt
echo    ✅ Guide créé

echo.
echo ===============================================================
echo               FICHIERS PRETS POUR UPLOAD !
echo ===============================================================
echo.
echo 📂 Tous vos fichiers sont dans :
echo    UPLOAD_HOSTINGER\public_html\
echo.
echo 📖 Lisez le guide :
echo    UPLOAD_HOSTINGER\GUIDE_UPLOAD.txt
echo.
echo 🌐 Structure préparée :
echo    public_html/
echo    ├── index.html
echo    ├── .htaccess
echo    ├── 404.html
echo    ├── assets/ (CSS + JS)
echo    └── api/ (config.php, database.php, index.php)
echo.
echo ===============================================================
echo  PROCHAINE ETAPE : UPLOAD SUR HOSTINGER
echo ===============================================================
echo.
echo 1. Allez sur https://hpanel.hostinger.com
echo 2. Sites Web ^> Gérer ^> Gestionnaire de fichiers
echo 3. Ouvrez public_html/
echo 4. Supprimez tout le contenu existant
echo 5. Uploadez TOUT le contenu de UPLOAD_HOSTINGER\public_html\
echo 6. Activez SSL (Sécurité ^> SSL)
echo.
echo 🎯 Temps estimé : 5-10 minutes
echo.
pause

explorer UPLOAD_HOSTINGER
