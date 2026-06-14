import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        maritime: {
          navy: '#0f172a',
          blue: '#1d4ed8',
          teal: '#0891b2',
        }
      }
    },
  },
  plugins: [],
}

export default config
