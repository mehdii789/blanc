#  GUIDE DEPLOIEMENT HOSTINGER

## ETAPE 1 : Build
npm install --legacy-peer-deps
npm run build

## ETAPE 2 : Base de donn?es MySQL
1. hPanel > Bases de donn?es > MySQL > Cr?er
2. Notez : nom, user, password, host
3. phpMyAdmin > Import > schema.sql

## ETAPE 3 : Configuration API
Editez hostinger/api/config.php avec vos infos MySQL

## ETAPE 4 : Upload
A. public_html/ <- Tout le contenu de dist/
B. public_html/api/ <- Tous les fichiers de hostinger/api/
C. public_html/.htaccess <- hostinger/.htaccess

## ETAPE 5 : Permissions
- Dossiers : 755
- Fichiers PHP : 644

## ETAPE 6 : Variables d'environnement
Cr?ez .env.production :
VITE_HOSTINGER_API_URL=https://votre-domaine.com/api

Puis rebuild : npm run build

## ETAPE 7 : SSL
hPanel > S?curit? > SSL > Activer + Forcer HTTPS

## ETAPE 8 : Test
https://votre-domaine.com
https://votre-domaine.com/api/customers

## Structure finale :
public_html/
  index.html
  .htaccess
  assets/
  api/
    config.php
    database.php
    index.php
