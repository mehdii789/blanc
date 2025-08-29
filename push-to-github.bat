@echo off
echo Push des modifications vers GitHub...
echo.

echo Ajout des fichiers modifies...
git add -A

echo.
echo Commit des changements...
git commit -m "Update: Add deployment scripts and Vercel configuration"

echo.
echo Push vers GitHub...
git push origin main

echo.
echo Push termine!
pause
