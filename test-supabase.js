// Script de test pour vérifier la connexion Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmtotombhpklllxjuirb.supabase.co';
const supabaseKey = 'sbp_611cad286465a6ca1027b72676cc3cb3d8d75017';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à Supabase...');
    
    // Test de connexion simple
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie !');
    console.log('📊 Données reçues:', data);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter le test
testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase est prêt à être utilisé !');
  } else {
    console.log('⚠️  Vérifiez votre configuration Supabase');
  }
});
