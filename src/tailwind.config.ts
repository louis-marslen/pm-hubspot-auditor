import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0f',
          900: '#111118',
          850: '#18181f',
          800: '#222230',
          700: '#2e2e3a',
          600: '#3f3f4d',
          500: '#63637a',
          400: '#8b8ba3',
          300: '#acacc0',
          200: '#d1d1e0',
          100: '#ececf4',
          50: '#f8f8fc',
        },
        brand: {
          950: '#1c0a04',
          900: '#431407',
          600: '#ea580c',
          500: '#f97316',
          400: '#fb923c',
          300: '#fdba74',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        'caption': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        'content': '1120px',
        'form': '400px',
      },
      boxShadow: {
        'lg': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
