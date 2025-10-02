// Script de test pour vérifier la configuration Supabase
import { supabaseService } from '../services/supabaseService';
import { monitor } from '../config/supabase';

export class SupabaseTest {
  private static instance: SupabaseTest;
  
  static getInstance(): SupabaseTest {
    if (!SupabaseTest.instance) {
      SupabaseTest.instance = new SupabaseTest();
    }
    return SupabaseTest.instance;
  }

  async runAllTests(): Promise<boolean> {
    console.log('🧪 Début des tests Supabase...');
    
    try {
      // Test 1: Connexion
      const connectionTest = await this.testConnection();
      if (!connectionTest) return false;

      // Test 2: Lecture des données
      const readTest = await this.testRead();
      if (!readTest) return false;

      // Test 3: Écriture des données
      const writeTest = await this.testWrite();
      if (!writeTest) return false;

      // Test 4: Monitoring
      const monitoringTest = await this.testMonitoring();
      if (!monitoringTest) return false;

      console.log('✅ Tous les tests Supabase ont réussi !');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      return false;
    }
  }

  private async testConnection(): Promise<boolean> {
    console.log('🔌 Test de connexion...');
    
    try {
      const isConnected = await supabaseService.testConnection();
      
      if (isConnected) {
        console.log('✅ Connexion réussie');
        return true;
      } else {
        console.error('❌ Échec de la connexion');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
  }

  private async testRead(): Promise<boolean> {
    console.log('📖 Test de lecture des données...');
    
    try {
      // Test de lecture des clients
      const customers = await supabaseService.getCustomers();
      console.log(`📊 ${customers.length} clients trouvés`);

      // Test de lecture des services
      const services = await supabaseService.getServices();
      console.log(`🛠️ ${services.length} services trouvés`);

      // Test de lecture de l'inventaire
      const inventory = await supabaseService.getInventoryItems();
      console.log(`📦 ${inventory.length} articles d'inventaire trouvés`);

      console.log('✅ Lecture des données réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur de lecture:', error);
      return false;
    }
  }

  private async testWrite(): Promise<boolean> {
    console.log('✏️ Test d\'écriture des données...');
    
    try {
      // Test de création d'un client
      const testCustomer = await supabaseService.createCustomer({
        name: 'Test Client',
        email: `test-${Date.now()}@example.com`,
        phone: '0123456789',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        notes: 'Client de test'
      });

      console.log(`👤 Client de test créé: ${testCustomer.name}`);

      // Test de suppression du client de test
      await supabaseService.deleteCustomer(testCustomer.id);
      console.log('🗑️ Client de test supprimé');

      console.log('✅ Écriture des données réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur d\'écriture:', error);
      return false;
    }
  }

  private async testMonitoring(): Promise<boolean> {
    console.log('📊 Test du monitoring...');
    
    try {
      // Récupérer les métriques
      const metrics = monitor.getMetrics();
      
      console.log('📈 Métriques actuelles:');
      console.log(`  - Requêtes totales: ${metrics.totalQueries}`);
      console.log(`  - Requêtes réussies: ${metrics.successfulQueries}`);
      console.log(`  - Requêtes échouées: ${metrics.failedQueries}`);
      console.log(`  - Temps de réponse moyen: ${Math.round(metrics.averageResponseTime)}ms`);
      console.log(`  - Statut de connexion: ${metrics.connectionStatus}`);

      // Test des statistiques
      const stats = await supabaseService.getStats();
      console.log('📊 Statistiques de l\'application:');
      console.log(`  - Total clients: ${stats.totalCustomers}`);
      console.log(`  - Total commandes: ${stats.totalOrders}`);
      console.log(`  - Commandes en attente: ${stats.pendingOrders}`);

      console.log('✅ Monitoring fonctionnel');
      return true;
    } catch (error) {
      console.error('❌ Erreur de monitoring:', error);
      return false;
    }
  }

  async testPerformance(): Promise<void> {
    console.log('⚡ Test de performance...');
    
    const startTime = Date.now();
    const iterations = 10;
    
    try {
      for (let i = 0; i < iterations; i++) {
        await supabaseService.getCustomers();
      }
      
      const endTime = Date.now();
      const averageTime = (endTime - startTime) / iterations;
      
      console.log(`📊 Performance: ${Math.round(averageTime)}ms par requête (moyenne sur ${iterations} requêtes)`);
      
      if (averageTime < 200) {
        console.log('✅ Performance excellente');
      } else if (averageTime < 500) {
        console.log('⚠️ Performance acceptable');
      } else {
        console.log('❌ Performance dégradée');
      }
    } catch (error) {
      console.error('❌ Erreur de test de performance:', error);
    }
  }

  async generateTestReport(): Promise<string> {
    const metrics = monitor.getMetrics();
    const stats = await supabaseService.getStats();
    
    const report = `
# Rapport de Test Supabase
Généré le: ${new Date().toLocaleString('fr-FR')}

## Métriques de Performance
- Requêtes totales: ${metrics.totalQueries}
- Taux de succès: ${metrics.totalQueries > 0 ? Math.round((metrics.successfulQueries / metrics.totalQueries) * 100) : 100}%
- Temps de réponse moyen: ${Math.round(metrics.averageResponseTime)}ms
- Statut de connexion: ${metrics.connectionStatus}

## Statistiques de l'Application
- Clients: ${stats.totalCustomers}
- Commandes: ${stats.totalOrders}
- Commandes en attente: ${stats.pendingOrders}
- Commandes terminées: ${stats.completedOrders}
- Factures: ${stats.totalInvoices}
- Factures payées: ${stats.paidInvoices}
- Articles en stock faible: ${stats.lowStockItems}
- Chiffre d'affaires: ${stats.totalRevenue.toFixed(2)}€

## Recommandations
${this.getRecommendations(metrics, stats)}
    `;
    
    return report.trim();
  }

  private getRecommendations(metrics: any, stats: any): string {
    const recommendations = [];
    
    if (metrics.averageResponseTime > 500) {
      recommendations.push('- Optimiser les requêtes lentes');
    }
    
    if (metrics.failedQueries > metrics.successfulQueries * 0.05) {
      recommendations.push('- Investiguer les erreurs de requêtes');
    }
    
    if (stats.lowStockItems > 0) {
      recommendations.push(`- Réapprovisionner ${stats.lowStockItems} articles en stock faible`);
    }
    
    if (stats.pendingOrders > stats.completedOrders * 0.5) {
      recommendations.push('- Traiter les commandes en attente');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- Système fonctionnel, aucune action requise');
    }
    
    return recommendations.join('\n');
  }
}

export const supabaseTest = SupabaseTest.getInstance();
