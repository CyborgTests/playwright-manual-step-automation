import type { Config } from 'tailwindcss';
import { heroui } from "@heroui/theme"

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  plugins: [
    heroui({
      layout: {
        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
        radius: {
          small: '4px',
          medium: '6px',
          large: '8px',
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#2C5677',
            },
          },
        },
      },
    }),
  ],
};

export default config; 