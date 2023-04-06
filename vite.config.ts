import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/open-scd.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
})
