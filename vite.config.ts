import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const PATH = "https://voyp89.amocrm.ru/";  

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/v4': {
        target: PATH,
        changeOrigin: true,
      },
    },
  },
})
