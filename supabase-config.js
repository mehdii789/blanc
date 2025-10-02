// Configuration automatique Supabase avec votre jeton
const fs = require('fs');

const PROJECT_ID = 'zmtotombhpklllxjuirb';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const ANON_KEY = 'sbp_611cad286465a6ca1027b72676cc3cb3d8d75017';

console.log('🚀 Configuration automatique avec votre jeton Supabase...');

// Créer le fichier de configuration
const envContent = `# Configuration Supabase - Générée automatiquement
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${ANON_KEY}

# Projet configuré: ${PROJECT_ID}
# Généré le: ${new Date().toLocaleString('fr-FR')}
`;

try {
  // Essayer de créer .env.local
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Fichier .env.local créé avec succès');
} catch (error) {
  // Si échec, créer un fichier alternatif
  fs.writeFileSync('supabase.env', envContent);
  console.log('✅ Configuration sauvée dans supabase.env');
  console.log('📝 Copiez le contenu vers .env.local manuellement');
}

console.log(`
🎯 Configuration Supabase terminée !

📊 Votre projet: ${PROJECT_ID}
🔗 URL: ${SUPABASE_URL}
🔑 Jeton configuré: ${ANON_KEY.substring(0, 20)}...

✅ Prochaines étapes:
1. Copiez le contenu de supabase.env vers .env.local si nécessaire
2. Exécutez le script SQL dans Supabase (database/schema.sql)
3. Lancez: npm run dev
4. Visitez: http://localhost:5173/monitoring-demo

🚀 Votre monitoring est prêt !
`);

// Créer un script de test rapide
const testScript = `
// Test rapide de connexion Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('${SUPABASE_URL}', '${ANON_KEY}');

async function testConnection() {
  try {
    const { data, error } = await supabase.from('customers').select('count');
    if (error) {
      console.log('⚠️ Erreur:', error.message);
      console.log('💡 Exécutez d\\'abord le script SQL database/schema.sql dans Supabase');
    } else {
      console.log('✅ Connexion Supabase réussie !');
    }
  } catch (err) {
    console.log('🔧 Configuration en cours...', err.message);
  }
}

testConnection();
`;

fs.writeFileSync('test-supabase.js', testScript);
console.log('📋 Script de test créé: test-supabase.js');
