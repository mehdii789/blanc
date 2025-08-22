import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Vérifie si l'élément root existe avant de tenter le rendu
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément avec l'ID 'root' est introuvable dans le DOM.");
}

// Rendu de l'application
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
