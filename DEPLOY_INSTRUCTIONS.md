# Déploiement Vercel - Instructions

## Problème Technique
Le service de déploiement automatique rencontre des erreurs internes. Voici comment déployer manuellement.

## Option 1: Interface Web Vercel (Recommandée)

1. **Accédez à [vercel.com](https://vercel.com)**
2. **Connectez-vous** avec votre compte GitHub
3. **Cliquez sur "New Project"**
4. **Sélectionnez votre repository** `mehdii789/blanc`
5. **Configuration automatique détectée:**
   - Framework: Create React App
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Output Directory: `dist`
6. **Cliquez sur "Deploy"**

## Option 2: Script Batch (Créé)

J'ai créé `deploy-vercel.bat` dans votre projet. Double-cliquez dessus pour:
- Installer les dépendances
- Builder l'application
- Déployer sur Vercel

## Configuration Optimisée ✅

Votre `vercel.json` est configuré pour:
- **SPA Routing**: Toutes les routes redirigent vers index.html
- **Cache optimisé**: Assets statiques mis en cache 1 an
- **Build automatique**: Utilise le répertoire `dist`

## URL de Déploiement

Une fois déployé, vous obtiendrez une URL comme:
`https://blanchisserie-app-[hash].vercel.app`

## Fonctionnalités Déployées

✅ **Portail Client** avec codes d'accès
✅ **Gestion complète** (commandes, factures, inventaire)
✅ **Synchronisation inventaire-production**
✅ **Interface responsive** avec Tailwind CSS
✅ **Routage SPA** fonctionnel
