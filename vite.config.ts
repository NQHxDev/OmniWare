import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
   build: {
      rollupOptions: {
         external: ['better-sqlite3'],
      },
   },
   plugins: [
      react(),
      tailwindcss(),
      electron({
         main: {
            entry: 'electron/main.ts',
         },
         preload: {
            input: path.join(__dirname, 'electron/preload.ts'),
         },
      }),
   ],
});
