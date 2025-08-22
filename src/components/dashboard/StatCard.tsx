import React from 'react';

interface TendanceProps {
  type: 'positive' | 'negative';
  valeur: string;
}

interface StatCardProps {
  titre: string;
  valeur: string;
  description: string;
  icone: React.ReactNode;
  iconeBg: string;
  couleurTexte: string;
  couleurFond?: string;
  bordure?: string;
  tendance?: TendanceProps;
}

export const StatCard: React.FC<StatCardProps> = ({
  titre,
  valeur,
  description,
  icone,
  iconeBg,
  couleurTexte,
  couleurFond = 'bg-white',
  bordure = 'border border-gray-200',
  tendance
}) => {
  // Vérifier si la couleur de fond est une classe Tailwind ou une couleur personnalisée
  const isCustomColor = couleurFond.startsWith('#');
  const bgClass = isCustomColor ? '' : couleurFond;
  
  return (
    <div 
      className={`relative h-full p-4 sm:p-5 rounded-xl ${bordure} ${bgClass} shadow-sm hover:shadow-md transition-all duration-200`}
      style={isCustomColor ? { backgroundColor: couleurFond } : {}}
    >
      {/* Icône */}
      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${iconeBg} mb-3 sm:mb-4 flex-shrink-0`}>
        {icone}
      </div>
      
      {/* Contenu principal */}
      <div className="space-y-1 sm:space-y-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">{titre}</h3>
        <p className={`text-xl sm:text-2xl font-bold ${couleurTexte} truncate`}>{valeur}</p>
        
        {/* Description avec tendance */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className="text-xs text-gray-500 flex-1 truncate">{description}</p>
          {tendance && (
            <div className={`flex items-center text-xs font-medium flex-shrink-0 ${
              tendance.type === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {tendance.type === 'positive' ? (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              )}
              <span className="truncate">{tendance.valeur}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};