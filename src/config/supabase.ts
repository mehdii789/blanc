// Configuration Supabase
import { createClient } from '@supabase/supabase-js';

// Variables d'environnement pour Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmtotombhpklllxjuirb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sbp_611cad286465a6ca1027b72676cc3cb3d8d75017';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'blanchisserie-app'
    }
  }
});

// Configuration pour le monitoring
export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
};

// Types pour les métriques de monitoring
export interface DatabaseMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageResponseTime: number;
  lastError?: string;
  lastErrorTime?: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

// Classe pour le monitoring des performances
export class SupabaseMonitor {
  private static instance: SupabaseMonitor;
  private metrics: DatabaseMetrics = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0,
    connectionStatus: 'disconnected'
  };
  private responseTimes: number[] = [];

  static getInstance(): SupabaseMonitor {
    if (!SupabaseMonitor.instance) {
      SupabaseMonitor.instance = new SupabaseMonitor();
    }
    return SupabaseMonitor.instance;
  }

  recordQuery(success: boolean, responseTime: number, error?: string): void {
    this.metrics.totalQueries++;
    
    if (success) {
      this.metrics.successfulQueries++;
      this.metrics.connectionStatus = 'connected';
    } else {
      this.metrics.failedQueries++;
      this.metrics.connectionStatus = 'error';
      this.metrics.lastError = error;
      this.metrics.lastErrorTime = new Date();
    }

    // Calculer le temps de réponse moyen (garder seulement les 100 dernières mesures)
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      connectionStatus: 'disconnected'
    };
    this.responseTimes = [];
  }
}

export const monitor = SupabaseMonitor.getInstance();
