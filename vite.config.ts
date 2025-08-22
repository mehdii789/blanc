import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  // Configuration pour le routage SPA
  // Cette option permet de servir index.html pour les routes inconnues
  // ce qui permet le rafraîchissement sur n'importe quelle route
  // sans obtenir d'erreur 404
  base: '/',
  // Configuration pour le routage SPA en développement
  // Redirige toutes les requêtes vers index.html
  // pour gérer le rafraîchissement des pages
  // dans une application à page unique (SPA)
  // Cette configuration est particulièrement importante
  // pour le développement avec Vite et React Router
  build: {
    outDir: 'dist',
    // Configuration pour le routage SPA en production
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
