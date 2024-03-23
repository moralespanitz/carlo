import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import hotReloadExtension from 'hot-reload-extension-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),hotReloadExtension({
    log: true,
    backgroundPath: 'src/main.tsx',
  })],
})
