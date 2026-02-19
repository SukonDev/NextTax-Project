/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/renderer/**/*.{html,js,vue}",
    ],
    theme: {
        extend: {
            colors: {
                // Windows 11 Color Palette
                accent: {
                    DEFAULT: '#0078D4',
                    hover: '#106EBE',
                    pressed: '#005A9E'
                },
                surface: {
                    primary: '#F3F3F3',
                    secondary: '#EBEBEB',
                    tertiary: '#F9F9F9',
                    'card': '#FFFFFF'
                },
                dark: {
                    primary: '#202020',
                    secondary: '#2C2C2C',
                    tertiary: '#1C1C1C',
                    'card': '#2B2B2B'
                },
                text: {
                    primary: '#1C1C1C',
                    secondary: '#605E5C',
                    tertiary: '#8A8886',
                    'dark-primary': '#FFFFFF',
                    'dark-secondary': '#E1E1E1',
                    'dark-tertiary': '#B3B3B3'
                }
            },
            fontFamily: {
                sans: ['Inter', 'Segoe UI Variable', 'system-ui', 'sans-serif']
            },
            borderRadius: {
                'win': '8px',
                'win-lg': '12px'
            },
            boxShadow: {
                'win': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'win-lg': '0 8px 16px rgba(0, 0, 0, 0.12)',
                'win-hover': '0 4px 12px rgba(0, 0, 0, 0.1)'
            },
            backdropBlur: {
                'mica': '80px',
                'acrylic': '30px'
            }
        },
    },
    plugins: [],
}
