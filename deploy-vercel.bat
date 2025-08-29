@echo off
echo Deploiement sur Vercel...
echo.

echo Installation des dependances...
npm install --legacy-peer-deps

echo.
echo Build de l'application...
npm run build

echo.
echo Deploiement sur Vercel...
npx vercel --prod

echo.
echo Deploiement termine!
pause
