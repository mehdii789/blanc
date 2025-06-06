import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Vérifie si l'élément root existe avant de tenter le rendu
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément avec l'ID 'root' est introuvable dans le DOM.");
}

// Affiche un message de chargement
rootElement.innerHTML = '<div style="padding: 20px; font-family: Arial, sans-serif;">Chargement de l\'application...</div>';

// Rendu de l'application
const root = createRoot(rootElement);

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Erreur lors du rendu de l\'application:', error);
  const errorMessage = `
    <div style="padding: 20px; font-family: Arial, sans-serif; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
      <h2>Erreur de chargement de l'application</h2>
      <p>Une erreur est survenue lors du chargement de l'application. Veuillez rafraîchir la page ou réessayer plus tard.</p>
      <p>Détails de l'erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
      <p>URL actuelle: ${window.location.href}</p>
    </div>
  `;
  rootElement.innerHTML = errorMessage;
}
