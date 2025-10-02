import React, { useState } from 'react';
import { Database, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupabaseAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Vérifier si l'alerte a déjà été fermée
    return !localStorage.getItem('supabase-alert-dismissed');
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('supabase-alert-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">🎉 Monitoring Supabase Activé !</p>
            <p className="text-sm opacity-90">
              Surveillez vos performances de base de données en temps réel
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/supabase-monitoring"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Voir le monitoring
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
