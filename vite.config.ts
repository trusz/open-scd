import { defineConfig } from 'vite'
import { hmrPlugin, presets } from 'vite-plugin-web-components-hmr'


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
  plugins: [
    hmrPlugin({
      include: ['./src/**/*'],
      presets: [presets.lit],
    }),
  ],
})
