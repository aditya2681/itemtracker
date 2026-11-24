import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ plugins: [react(), tailwindcss(), VitePWA({ registerType: 'prompt', manifest: { name: 'Purchase & Rate', short_name: 'Purchase Rate', description: 'Purchase bills and supplier price history', theme_color: '#116d68', background_color: '#f5f8f8', display: 'standalone', icons: [{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'}] } })], base: process.env.VITE_BASE_PATH || '/' });
