import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, ChevronDown } from 'lucide-react';

type PeriodType = 'month' | 'week';

interface PeriodSelectorProps {
  onPeriodChange: (startDate: Date, endDate: Date) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ onPeriodChange }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthYearRef = useRef<HTMLDivElement>(null);
  
  // Gérer le clic en dehors du sélecteur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthYearRef.current && !monthYearRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Générer la liste des 10 dernières et 10 prochaines années
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  // Noms des mois
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calculer les dates de début et de fin de la période
  const calculatePeriod = (date: Date, type: PeriodType) => {
    const start = new Date(date);
    const end = new Date(date);

    if (type === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Dernier jour du mois
      end.setHours(23, 59, 59, 999);
    } else {
      // Semaine commençant le lundi
      const day = start.getDay() || 7; // Convertir dimanche (0) en 7
      start.setDate(start.getDate() - (day - 1));
      start.setHours(0, 0, 0, 0);
      
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  // Mettre à jour la période quand la date ou le type change
  useEffect(() => {
    const { start, end } = calculatePeriod(currentDate, periodType);
    onPeriodChange(start, end);
  }, [currentDate, periodType, onPeriodChange]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = (start: Date, end: Date, type: PeriodType) => {
    if (type === 'month') {
      return {
        month: start.toLocaleDateString('fr-FR', { month: 'long' }),
        year: start.getFullYear().toString()
      };
    } else {
      const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return { display: `${startStr} - ${endStr}` };
    }
  };
  
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };
  
  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };
  
  const toggleMonthPicker = () => {
    setShowMonthPicker(!showMonthPicker);
    setShowYearPicker(false);
  };
  
  const toggleYearPicker = () => {
    setShowYearPicker(!showYearPicker);
    setShowMonthPicker(false);
  };

  const { start, end } = calculatePeriod(currentDate, periodType);
  const dateRange = formatDateRange(start, end, periodType);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriodType('month')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            periodType === 'month' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>Mois</span>
          </div>
        </button>
        <button
          onClick={() => setPeriodType('week')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            periodType === 'week' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <CalendarDays size={16} />
            <span>Semaine</span>
          </div>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
          title="Période précédente"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center relative" ref={monthYearRef}>
          <div className="flex items-center gap-1">
            {periodType === 'month' ? (
              <>
                <button 
                  onClick={toggleMonthPicker}
                  className="font-medium text-gray-800 hover:bg-gray-100 px-2 py-1 rounded flex items-center"
                >
                  {dateRange.month}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                <button 
                  onClick={toggleYearPicker}
                  className="font-medium text-gray-800 hover:bg-gray-100 px-2 py-1 rounded flex items-center"
                >
                  {dateRange.year}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {/* Sélecteur de mois */}
                {showMonthPicker && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 grid grid-cols-3 gap-1 w-48">
                    {monthNames.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`text-sm p-1 rounded hover:bg-blue-50 ${
                          currentDate.getMonth() === index ? 'bg-blue-100 font-medium' : ''
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Sélecteur d'année */}
                {showYearPicker && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 grid grid-cols-3 gap-1 w-32 max-h-48 overflow-y-auto">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`text-sm p-1 rounded hover:bg-blue-50 ${
                          currentDate.getFullYear() === year ? 'bg-blue-100 font-medium' : ''
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span className="font-medium text-gray-800">
                {dateRange.display}
              </span>
            )}
          </div>
          
          <button
            onClick={handleToday}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline block w-full mt-1"
          >
            Aujourd'hui
          </button>
        </div>
        
        <button
          onClick={handleNext}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
          title="Période suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
