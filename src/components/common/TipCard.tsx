import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface TipCardProps {
  title: string;
  tips: string[];
  className?: string;
}

export const TipCard: React.FC<TipCardProps> = ({ title, tips, className = '' }) => {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <LightBulbIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            {title}
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
