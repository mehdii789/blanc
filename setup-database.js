// Script pour configurer automatiquement la base de données Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://zmtotombhpklllxjuirb.supabase.co';
const SUPABASE_ANON_KEY = 'sbp_611cad286465a6ca1027b72676cc3cb3d8d75017';

console.log('🚀 Configuration automatique de la base de données Supabase...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  try {
    console.log('📋 Lecture du schéma SQL...');
    
    // Lire le fichier schema.sql
    const schemaSQL = fs.readFileSync('./database/schema.sql', 'utf8');
    
    console.log('🔧 Exécution du schéma dans Supabase...');
    
    // Note: L'API Supabase ne permet pas d'exécuter du SQL arbitraire via le client JS
    // pour des raisons de sécurité. Il faut utiliser l'interface web ou l'API REST.
    
    console.log(`
⚠️  Configuration manuelle requise:

1. Allez sur: https://supabase.com/dashboard/project/zmtotombhpklllxjuirb
2. Cliquez sur "SQL Editor" dans la sidebar
3. Copiez et collez le contenu du fichier database/schema.sql
4. Cliquez sur "Run" pour exécuter le script

Ou utilisez cette commande curl pour automatiser:

curl -X POST 'https://zmtotombhpklllxjuirb.supabase.co/rest/v1/rpc/exec_sql' \\
  -H 'apikey: ${SUPABASE_ANON_KEY}' \\
  -H 'Authorization: Bearer ${SUPABASE_ANON_KEY}' \\
  -H 'Content-Type: application/json' \\
  --data '{"sql": "-- Votre SQL ici"}'
    `);

    // Test de connexion basique
    console.log('🔍 Test de connexion...');
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
    } else {
      console.log('✅ Connexion Supabase établie !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Créer le fichier .env.local
function createEnvFile() {
  const envContent = `# Configuration Supabase
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Projet: zmtotombhpklllxjuirb
# Configuré automatiquement le ${new Date().toLocaleString('fr-FR')}
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Fichier .env.local créé');
  } catch (error) {
    console.log('⚠️ Créez manuellement le fichier .env.local avec ce contenu:');
    console.log(envContent);
  }
}

async function main() {
  createEnvFile();
  await setupDatabase();
  
  console.log(`
🎯 Configuration terminée !

✅ Étapes suivantes:
1. Exécutez le schéma SQL dans l'interface Supabase
2. Lancez: npm install @supabase/supabase-js (si pas déjà fait)
3. Lancez: npm run dev
4. Visitez: http://localhost:5173/monitoring-demo

🚀 Votre monitoring Supabase est prêt !
  `);
}

main().catch(console.error);
