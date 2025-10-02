import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SuccessMessageProps {
  message: string;
  show: boolean;
  onHide: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  show,
  onHide,
  autoHide = true,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Attendre la fin de l'animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, duration, onHide]);

  if (!show && !isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              Configuration sauvegardée !
            </p>
            <p className="text-sm text-green-700 mt-1">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onHide, 300);
            }}
            className="text-green-400 hover:text-green-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
