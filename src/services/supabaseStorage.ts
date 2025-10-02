import { supabase } from '../config/supabase';

export interface StorageStats {
  used: number; // en bytes
  limit: number; // en bytes
  percentage: number; // pourcentage utilisé
  remaining: number; // bytes restants
  tables: TableStats[];
  lastUpdated: Date;
}

export interface TableStats {
  name: string;
  rows: number;
  size: number; // estimation en bytes
  percentage: number; // pourcentage du total
}

class SupabaseStorageService {
  private cache: StorageStats | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  // Limites du plan gratuit Supabase
  private readonly FREE_PLAN_LIMITS = {
    database: 500 * 1024 * 1024, // 500 MB
    storage: 1 * 1024 * 1024 * 1024, // 1 GB
    bandwidth: 2 * 1024 * 1024 * 1024, // 2 GB/mois
    requests: 50000 // 50k requêtes/mois
  };

  async getStorageStats(): Promise<StorageStats> {
    // Vérifier le cache
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const tableStats = await this.getTableStats();
      const totalUsed = tableStats.reduce((sum, table) => sum + table.size, 0);
      const limit = this.FREE_PLAN_LIMITS.database;
      
      const stats: StorageStats = {
        used: totalUsed,
        limit: limit,
        percentage: (totalUsed / limit) * 100,
        remaining: limit - totalUsed,
        tables: tableStats,
        lastUpdated: new Date()
      };

      // Mettre en cache
      this.cache = stats;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats de stockage:', error);
      
      // Retourner des stats par défaut en cas d'erreur
      return {
        used: 0,
        limit: this.FREE_PLAN_LIMITS.database,
        percentage: 0,
        remaining: this.FREE_PLAN_LIMITS.database,
        tables: [],
        lastUpdated: new Date()
      };
    }
  }

  private async getTableStats(): Promise<TableStats[]> {
    const tables = [
      'customers', 'employees', 'services', 'inventory_items',
      'orders', 'order_services', 'order_items',
      'invoices', 'invoice_items',
      'client_access', 'service_packs', 'pack_services',
      'client_orders', 'client_order_packs'
    ];

    const tableStats: TableStats[] = [];
    let totalRows = 0;

    console.log('🔍 Récupération des statistiques réelles de Supabase...');

    for (const tableName of tables) {
      try {
        // Récupérer le nombre de lignes
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.warn(`⚠️ Erreur pour la table ${tableName}:`, error.message);
          // Continuer avec 0 lignes au lieu d'ignorer la table
          tableStats.push({
            name: tableName,
            rows: 0,
            size: 0,
            percentage: 0
          });
          continue;
        }

        const rowCount = count || 0;
        totalRows += rowCount;

        // Estimation de la taille basée sur le nombre réel de lignes
        const estimatedRowSize = this.getEstimatedRowSize(tableName);
        const tableSize = rowCount * estimatedRowSize;

        console.log(`📊 Table ${tableName}: ${rowCount} lignes, ~${this.formatSize(tableSize)}`);

        tableStats.push({
          name: tableName,
          rows: rowCount,
          size: tableSize,
          percentage: 0 // Sera calculé après
        });
      } catch (error) {
        console.error(`❌ Erreur lors de la récupération des stats pour ${tableName}:`, error);
        // Ajouter la table avec des valeurs par défaut
        tableStats.push({
          name: tableName,
          rows: 0,
          size: 0,
          percentage: 0
        });
      }
    }

    // Calculer les pourcentages
    const totalSize = tableStats.reduce((sum, table) => sum + table.size, 0);
    tableStats.forEach(table => {
      table.percentage = totalSize > 0 ? (table.size / totalSize) * 100 : 0;
    });

    console.log(`📈 Total: ${totalRows} lignes, ~${this.formatSize(totalSize)}`);

    return tableStats.sort((a, b) => b.size - a.size);
  }

  private getEstimatedRowSize(tableName: string): number {
    // Estimation approximative de la taille par ligne selon le type de table
    const sizes: Record<string, number> = {
      'customers': 500, // UUID + textes + dates
      'employees': 300,
      'services': 200,
      'inventory_items': 250,
      'orders': 400,
      'order_services': 150,
      'order_items': 200,
      'invoices': 350,
      'invoice_items': 150,
      'client_access': 200,
      'service_packs': 300,
      'pack_services': 150,
      'client_orders': 350,
      'client_order_packs': 200
    };

    return sizes[tableName] || 250; // Taille par défaut
  }

  // Obtenir des recommandations basées sur l'utilisation
  getRecommendations(stats: StorageStats): string[] {
    const recommendations: string[] = [];

    if (stats.percentage > 80) {
      recommendations.push('⚠️ Stockage critique (>80%) - Envisagez de nettoyer les anciennes données');
    } else if (stats.percentage > 60) {
      recommendations.push('⚡ Stockage élevé (>60%) - Surveillez l\'évolution');
    }

    // Recommandations par table
    const largestTables = stats.tables
      .filter(table => table.percentage > 20)
      .slice(0, 3);

    if (largestTables.length > 0) {
      recommendations.push(`📊 Tables les plus volumineuses: ${largestTables.map(t => t.name).join(', ')}`);
    }

    if (stats.tables.some(table => table.rows > 10000)) {
      recommendations.push('🗂️ Certaines tables ont beaucoup de données - Considérez l\'archivage');
    }

    return recommendations;
  }

  // Formater la taille en unités lisibles
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Vider le cache
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export const supabaseStorageService = new SupabaseStorageService();
