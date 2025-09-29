import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This is for client-side access during development if needed,
      // but the Gemini API key should primarily be used on the backend.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      }
    },
    build: {
      // Output the built files to a folder that the backend can serve
      outDir: '../frontend',
      emptyOutDir: true,
    }
  }
})