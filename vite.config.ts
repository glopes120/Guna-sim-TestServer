import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Recriar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Carrega variáveis de ambiente se necessário
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: 'localhost',
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 3000,
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});