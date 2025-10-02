import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  title: string;
  content: string;
  example?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content, example }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        type="button"
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à côté */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-w-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{content}</p>
              
              {example && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Exemple :</strong> {example}
                  </p>
                </div>
              )}
              
              {/* Flèche */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
