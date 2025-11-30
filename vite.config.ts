import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // A linha loadEnv pode ficar, mas já não é crítica para a API Key
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
      // APAGA ESTA PARTE DO DEFINE:
      // define: {
      //   'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});