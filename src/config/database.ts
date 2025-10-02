// Configuration de la base de données
export const DATABASE_CONFIG = {
  // Supabase - Base de données PostgreSQL hébergée
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || 'https://zmtotombhpklllxjuirb.supabase.co',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sbp_611cad286465a6ca1027b72676cc3cb3d8d75017'
  },
  
  // JSONBin.io - Service de fallback (désactivé)
  JSONBIN: {
    BASE_URL: 'https://api.jsonbin.io/v3/b',
    API_KEY: '$2a$10$9vKvO8rjYoN3qF5mP2sL4eH6tG8wR1xZ3cV7bN9mQ4kJ6fD2aS8pL',
    BIN_ID: '673f2a1bad19ca34f8c8e5d2'
  },
  
  // Configuration du cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Mode de fonctionnement
  USE_SUPABASE: true, // true pour utiliser Supabase, false pour localStorage
  USE_REMOTE_DB: false, // Ancien système JSONBin (désactivé)
  
  // Fallback vers localStorage en cas d'erreur
  FALLBACK_TO_LOCAL: true
};

// Fonction pour obtenir la configuration selon l'environnement
export const getDatabaseConfig = () => {
  // En développement, on peut utiliser des variables d'environnement
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    ...DATABASE_CONFIG,
    // Configuration Supabase avec variables d'environnement
    SUPABASE: {
      URL: import.meta.env.VITE_SUPABASE_URL || DATABASE_CONFIG.SUPABASE.URL,
      ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || DATABASE_CONFIG.SUPABASE.ANON_KEY
    },
    // Configuration JSONBin (fallback)
    JSONBIN: {
      ...DATABASE_CONFIG.JSONBIN,
      API_KEY: process.env.REACT_APP_JSONBIN_API_KEY || DATABASE_CONFIG.JSONBIN.API_KEY,
      BIN_ID: process.env.REACT_APP_JSONBIN_BIN_ID || DATABASE_CONFIG.JSONBIN.BIN_ID
    }
  };
};
