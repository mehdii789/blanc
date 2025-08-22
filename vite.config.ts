import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  
  // Optimisation des dépendances
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  // Configuration des résolutions d'import
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // Configuration du serveur de développement
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  
  // Configuration pour le routage SPA
  preview: {
    port: 3000,
    strictPort: true,
  },
});
