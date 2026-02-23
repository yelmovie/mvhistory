import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  server: {
    // Note: Do NOT set Content-Type here — it overrides ALL responses including .tsx and .css files,
    // which breaks font loading and module execution. Vite handles Content-Type per file type correctly.
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // /utils 절대 경로 임포트를 로컬 utils 폴더로 연결
      '/utils': path.resolve(__dirname, './utils'),
    },
  },

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어 분리
          'vendor-react': ['react', 'react-dom'],
          // 애니메이션 라이브러리 분리
          'vendor-motion': ['motion/react'],
          // Lucide 아이콘 분리
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
