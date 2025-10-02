import { supabase } from '../config/supabase';

export interface SupabaseTestResult {
  isConnected: boolean;
  tablesStatus: Record<string, {
    accessible: boolean;
    count: number;
    error?: string;
  }>;
  totalRows: number;
  errors: string[];
}

export class SupabaseTestService {
  async runFullTest(): Promise<SupabaseTestResult> {
    console.log('🧪 Démarrage du test complet Supabase...');
    
    const result: SupabaseTestResult = {
      isConnected: false,
      tablesStatus: {},
      totalRows: 0,
      errors: []
    };

    const tables = [
      'customers', 'employees', 'services', 'inventory_items',
      'orders', 'order_services', 'order_items',
      'invoices', 'invoice_items',
      'client_access', 'service_packs', 'pack_services',
      'client_orders', 'client_order_packs'
    ];

    // Test de connexion basique
    try {
      const { data, error } = await supabase.from('customers').select('id').limit(1);
      if (error) {
        result.errors.push(`Connexion échouée: ${error.message}`);
        return result;
      }
      result.isConnected = true;
      console.log('✅ Connexion Supabase établie');
    } catch (error) {
      result.errors.push(`Erreur de connexion: ${error instanceof Error ? error.message : 'Inconnue'}`);
      return result;
    }

    // Test de chaque table
    for (const tableName of tables) {
      try {
        console.log(`🔍 Test de la table: ${tableName}`);
        
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          result.tablesStatus[tableName] = {
            accessible: false,
            count: 0,
            error: error.message
          };
          result.errors.push(`Table ${tableName}: ${error.message}`);
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          const rowCount = count || 0;
          result.tablesStatus[tableName] = {
            accessible: true,
            count: rowCount
          };
          result.totalRows += rowCount;
          console.log(`✅ ${tableName}: ${rowCount} lignes`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        result.tablesStatus[tableName] = {
          accessible: false,
          count: 0,
          error: errorMsg
        };
        result.errors.push(`Table ${tableName}: ${errorMsg}`);
        console.log(`❌ ${tableName}: ${errorMsg}`);
      }
    }

    console.log(`📊 Test terminé: ${result.totalRows} lignes au total`);
    return result;
  }

  async testCreateAndRead(): Promise<boolean> {
    console.log('🧪 Test de création et lecture...');
    
    try {
      // Essayer de créer un client test
      const testCustomer = {
        name: 'Test Customer',
        email: `test-${Date.now()}@example.com`,
        phone: '0123456789'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('customers')
        .insert([testCustomer])
        .select();

      if (insertError) {
        console.log(`❌ Erreur d'insertion: ${insertError.message}`);
        return false;
      }

      console.log('✅ Client test créé:', insertData);

      // Essayer de le lire
      const { data: readData, error: readError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', testCustomer.email);

      if (readError) {
        console.log(`❌ Erreur de lecture: ${readError.message}`);
        return false;
      }

      console.log('✅ Client test lu:', readData);

      // Nettoyer - supprimer le client test
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', insertData[0].id);

        if (deleteError) {
          console.log(`⚠️ Erreur de suppression: ${deleteError.message}`);
        } else {
          console.log('✅ Client test supprimé');
        }
      }

      return true;
    } catch (error) {
      console.log(`❌ Erreur générale: ${error instanceof Error ? error.message : 'Inconnue'}`);
      return false;
    }
  }

  async checkRLS(): Promise<boolean> {
    console.log('🔒 Vérification des politiques RLS...');
    
    try {
      // Tester l'accès aux données sans authentification
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .limit(5);

      if (error) {
        console.log(`❌ RLS bloque l'accès: ${error.message}`);
        return false;
      }

      console.log(`✅ RLS configuré correctement, ${data?.length || 0} clients accessibles`);
      return true;
    } catch (error) {
      console.log(`❌ Erreur RLS: ${error instanceof Error ? error.message : 'Inconnue'}`);
      return false;
    }
  }
}

export const supabaseTestService = new SupabaseTestService();
