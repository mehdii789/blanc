import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SupabaseAlert } from '../common/SupabaseAlert';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

import { useApp } from '../../hooks/useApp';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeView } = useApp();

  // Rafraîchissement automatique global
  useAutoRefresh({
    interval: 30000, // 30 secondes
    enabled: true,
    onRefresh: () => {
      console.log('🔄 Rafraîchissement automatique global effectué');
    }
  });

  // Fermer le menu mobile quand la vue change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeView]);

  // Désactiver le défilement du corps quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // La barre de navigation mobile a été désactivée pour gagner de l'espace

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      <SupabaseAlert />
      <div className="flex flex-1 bg-gray-50 relative">
      {/* Overlay pour mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Version Desktop */}
      <div className={`fixed md:relative z-50 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } transition-transform duration-300 ease-in-out w-64 h-full bg-white border-r border-gray-200 overflow-y-auto`}>
        <Sidebar />
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto bg-white md:m-4 md:rounded-lg md:shadow-sm">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Barre de navigation mobile désactivée */}
      {/* {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
          <div className="flex justify-around items-center h-16">
            {mobileNavItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view as any)}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  activeView === item.view ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className={`p-1.5 rounded-full ${activeView === item.view ? 'bg-blue-100' : ''}`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    size: 22,
                    className: activeView === item.view ? 'text-blue-600' : 'text-gray-500',
                  })}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )} */}
      </div>
    </div>
  );
};