import React, { ReactNode, isValidElement } from 'react';

interface StatCardProps {
  titre: string;
  valeur: string | number;
  icone: ReactNode;
  iconeBg: string;
  couleurTexte: string;
  bgColor: string;
  borderColor?: string;
  tendance?: {
    valeur: number;
    estPositif: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  titre,
  valeur,
  icone,
  iconeBg,
  couleurTexte,
  borderColor = 'border-gray-200',
  bgColor = 'bg-white',
  tendance
}) => {
  // Couleur de la bordure basée sur la couleur de la bordure fournie
  const borderColorClass = borderColor || 'border-gray-200';
  
  // Vérifier si bgColor est une classe Tailwind ou une couleur personnalisée
  const isCustomColor = bgColor.startsWith('#');
  const bgClass = isCustomColor ? '' : bgColor;
  const bgStyle = isCustomColor ? { backgroundColor: bgColor } : {};
  
  return (
    <div 
      className={`relative h-full p-5 rounded-lg border-l-4 ${borderColorClass} ${bgClass} shadow-sm hover:shadow-md transition-shadow duration-200`} 
      style={bgStyle}
    >
      <div className="relative z-10 h-full stat-card">
        <div className="flex items-start justify-between h-full">
          <div className="pr-2 flex-1">
            <h3>{titre}</h3>
            <p className={`value ${couleurTexte}`}>
              {valeur}
            </p>
            
            {tendance && (
              <div className="flex items-center mt-1">
                <span 
                  className={`inline-flex items-center text-sm ${
                    tendance.estPositif 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}
                >
                  {tendance.estPositif ? (
                    <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{tendance.valeur}%</span>
                </span>
              </div>
            )}
          </div>
          
          <div className={`${iconeBg} w-10 h-10 flex items-center justify-center`}>
            {isValidElement(icone) && React.cloneElement(icone as React.ReactElement, { 
              size: 20,
              className: 'opacity-80' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};