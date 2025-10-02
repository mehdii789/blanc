// Script de configuration automatique Supabase
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration automatique de Supabase...');

// Configuration de votre projet
const PROJECT_ID = 'zmtotombhpklllxjuirb';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

// Créer le fichier .env.local
const envContent = `# Configuration Supabase
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Instructions:
# 1. Allez dans votre projet Supabase: https://supabase.com/dashboard/project/${PROJECT_ID}
# 2. Cliquez sur "Settings" > "API"
# 3. Copiez la clé "anon public" et remplacez YOUR_ANON_KEY_HERE ci-dessus
# 4. Exécutez le script SQL dans l'éditeur SQL de Supabase (fichier database/schema.sql)
`;

try {
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Fichier .env.local créé');
  console.log('📝 Éditez le fichier .env.local et ajoutez votre clé API');
} catch (error) {
  console.log('⚠️ Créez manuellement le fichier .env.local avec ce contenu:');
  console.log(envContent);
}

// Vérifier si les dépendances sont installées
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
  
  if (!hasSupabase) {
    console.log('📦 Dépendance Supabase manquante');
    console.log('Exécutez: npm install @supabase/supabase-js');
  } else {
    console.log('✅ Dépendance Supabase déjà installée');
  }
}

console.log(`
🎯 Prochaines étapes:

1. Allez dans votre projet Supabase:
   https://supabase.com/dashboard/project/${PROJECT_ID}

2. Dans "Settings" > "API", copiez votre clé "anon public"

3. Éditez le fichier .env.local et remplacez YOUR_ANON_KEY_HERE

4. Dans l'éditeur SQL de Supabase, exécutez le contenu du fichier:
   database/schema.sql

5. Lancez votre application et allez sur /monitoring

6. Testez la migration avec:
   import { dataMigration } from './src/utils/migration';
   await dataMigration.migrateAllData();
`);
