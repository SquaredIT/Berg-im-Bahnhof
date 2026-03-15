import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        innenmalerei: resolve(__dirname, 'pages/innenmalerei.html'),
        aussenfassaden: resolve(__dirname, 'pages/aussenfassaden.html'),
        bodenbelaege: resolve(__dirname, 'pages/bodenbelaege.html'),
        waermedaemmung: resolve(__dirname, 'pages/waermedaemmung.html'),
        farbberatung: resolve(__dirname, 'pages/farbberatung.html'),
        impressum: resolve(__dirname, 'pages/impressum.html'),
        datenschutz: resolve(__dirname, 'pages/datenschutz.html'),
      },
    },
  },
})
