import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tanan: {
          page:    '#f5ede3',
          surface: '#faf7f4',
          card:    '#ffffff',
          sidebar: '#2a1205',
          border:  '#e5d5c0',
          'border-mid': '#cdb898',
          brown: {
            900: '#1a0900',
            800: '#2a1205',
            700: '#3d1c08',
            600: '#5c2c0e',
            500: '#7a4018',
            400: '#a05c28',
            300: '#c47840',
            200: '#daa870',
            100: '#edd8b8',
            50:  '#f8f0e4',
          },
          gold:        '#b8832a',
          'gold-light': '#d4a04e',
          'gold-dark':  '#8a6010',
          text: {
            primary:   '#1a0900',
            secondary: '#5c3c1e',
            muted:     '#9a7050',
            hint:      '#c4a07a',
          },
        },
      },
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
