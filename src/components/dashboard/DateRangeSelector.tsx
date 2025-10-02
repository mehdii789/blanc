import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Clock, Filter } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface DateRangeSelectorProps {
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ className = '' }) => {
  const { dateRange, setDateRange } = useDatabase();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [tempRange, setTempRange] = useState(dateRange);

  // Synchroniser tempRange avec dateRange quand il change
  useEffect(() => {
    setTempRange(dateRange);
  }, [dateRange]);

  const presetRanges = [
    {
      label: 'Aujourd\'hui',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        return { start, end };
      }
    },
    {
      label: 'Cette semaine',
      getValue: () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    },
    {
      label: 'Ce mois',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
      }
    },
    {
      label: 'Mois dernier',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        return { start, end };
      }
    },
    {
      label: 'Cette année',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
    }
  ];

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const endStr = end.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (startStr === endStr) {
      return startStr;
    }
    
    return `${startStr} - ${endStr}`;
  };

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const newRange = preset.getValue();
    setDateRange(newRange);
    setIsOpen(false);
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      if (field === 'start') {
        date.setHours(0, 0, 0, 0);
      } else {
        date.setHours(23, 59, 59, 999);
      }
      setTempRange(prev => ({ ...prev, [field]: date }));
    }
  };

  const applyCustomRange = () => {
    if (tempRange.start <= tempRange.end) {
      setDateRange(tempRange);
      setIsCustomOpen(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCustomOpen(false);
      }
    };

    if (isOpen || isCustomOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isCustomOpen]);

  // Déterminer le preset actuel


  return (
    <div className={`relative flex gap-2 ${className}`} ref={dropdownRef}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-auto justify-between sm:justify-start"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
            {formatDateRange(dateRange.start, dateRange.end)}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Bouton période personnalisée */}
      <button
        onClick={() => setIsCustomOpen(!isCustomOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex-shrink-0"
      >
        <Filter className="w-4 h-4" />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Personnalisée</span>
      </button>

      {/* Dropdown des périodes prédéfinies */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 sm:p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Périodes prédéfinies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left w-full"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown de la période personnalisée */}
      {isCustomOpen && (
        <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 sm:p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Période personnalisée
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de début</label>
                <input
                  type="date"
                  value={formatDateForInput(tempRange.start)}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={formatDateForInput(tempRange.end)}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
              
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={() => setIsCustomOpen(false)}
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors order-2 sm:order-1"
              >
                Annuler
              </button>
              <button
                onClick={applyCustomRange}
                className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors order-1 sm:order-2"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
