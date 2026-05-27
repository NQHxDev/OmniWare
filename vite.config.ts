import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
   define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
   },
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
