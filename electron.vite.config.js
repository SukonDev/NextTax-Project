import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/main/main.js')
                }
            }
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/main/preload.js')
                }
            }
        }
    },
    renderer: {
        root: resolve(__dirname, 'src/renderer'),
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html')
                }
            }
        },
        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    autoprefixer
                ]
            }
        }
    }
})
