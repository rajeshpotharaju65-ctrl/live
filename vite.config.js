import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),   // auto-generates self-signed cert → getUserMedia works everywhere
  ],
  server: {
    port: 5173,
    host: true,   // accessible on your LAN: https://192.168.x.x:5173
    https: true,
  },
})
