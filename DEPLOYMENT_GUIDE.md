# Guide de Déploiement - Application de Gestion d'Entreprise

## 🚀 Déploiement sur Netlify (Recommandé)

### Option 1: Déploiement via Interface Web Netlify

1. **Préparer le projet localement:**
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Aller sur Netlify:**
   - Visitez [netlify.com](https://netlify.com)
   - Connectez-vous ou créez un compte

3. **Déployer:**
   - Cliquez sur "Add new site" > "Deploy manually"
   - Glissez-déposez le dossier `dist` généré
   - Ou utilisez "Browse to upload" pour sélectionner le dossier `dist`

### Option 2: Déploiement via Git (Recommandé pour les mises à jour)

1. **Pousser votre code sur GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connecter à Netlify:**
   - Sur Netlify: "Add new site" > "Import an existing project"
   - Connectez votre repository Git
   - Configurez les paramètres de build:
     - **Build command:** `npm install --legacy-peer-deps && npm run build`
     - **Publish directory:** `dist`
     - **Node version:** `18.0.0`

### Option 3: Déploiement via CLI

1. **Installer Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Se connecter à Netlify:**
   ```bash
   netlify login
   ```

3. **Déployer:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## 🔧 Configuration Automatique

Votre projet contient déjà:
- ✅ `netlify.toml` - Configuration Netlify optimisée
- ✅ `package.json` - Scripts de build configurés
- ✅ `vite.config.ts` - Configuration Vite optimisée
- ✅ Redirections SPA pour React Router
- ✅ En-têtes de sécurité

## 🌐 Autres Plateformes de Déploiement

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
1. Installer gh-pages: `npm install --save-dev gh-pages`
2. Ajouter dans package.json:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
3. Exécuter: `npm run deploy`

## 🔍 Vérification du Déploiement

Après déploiement, vérifiez:
- ✅ Page d'accueil se charge correctement
- ✅ Navigation entre les pages fonctionne
- ✅ Aucune erreur 404 sur les routes
- ✅ Styles CSS appliqués correctement
- ✅ Fonctionnalités interactives opérationnelles

## 🐛 Résolution de Problèmes

### Erreurs de Build
- Vérifiez Node.js version (recommandé: 18.x)
- Utilisez `--legacy-peer-deps` pour les dépendances
- Supprimez `node_modules` et `package-lock.json`, puis réinstallez

### Erreurs 404 sur les Routes
- Vérifiez que les redirections SPA sont configurées
- Le fichier `netlify.toml` contient déjà la configuration nécessaire

### Problèmes de Performance
- Les chunks sont optimisés dans `vite.config.ts`
- Cache configuré dans `netlify.toml`

## 📝 Notes Importantes

- **Framework détecté:** React avec TypeScript
- **Build tool:** Vite
- **Dossier de publication:** `dist`
- **Configuration:** Optimisée pour SPA avec routing client-side
- **Sécurité:** En-têtes de sécurité configurés
