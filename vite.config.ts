import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
   plugins: [
      react(),
      tailwindcss(),
      electron([
         {
            entry: 'electron/main.ts',
         },
         {
            entry: 'electron/preload.ts',
            onstart({ reload }) {
               reload();
            },
            vite: {
               build: {
                  rollupOptions: {
                     output: {
                        format: 'es',
                        entryFileNames: 'preload.mjs',
                     },
                  },
               },
            },
         },
      ]),
   ],
   base: './',
   build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
         input: {
            main: path.resolve(__dirname, 'index.html'),
         },
      },
   },
   server: {
      port: 5173,
   },
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },
});
