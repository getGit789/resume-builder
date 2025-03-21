import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        'open-sans': ['var(--font-open-sans)'],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			'accent-red': {
  				DEFAULT: 'hsl(var(--accent-red))',
  				foreground: 'hsl(var(--accent-red-foreground))'
  			},
  			gray: {
  				'100': 'hsl(var(--gray-100))',
  				'200': 'hsl(var(--gray-200))',
  				'300': 'hsl(var(--gray-300))',
  				'400': 'hsl(var(--gray-400))',
  				'500': 'hsl(var(--gray-500))',
  				'600': 'hsl(var(--gray-600))',
  				'700': 'hsl(var(--gray-700))',
  				'800': 'hsl(var(--gray-800))',
  				'900': 'hsl(var(--gray-900))',
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			fadeIn: {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			slideUp: {
  				from: { transform: 'translateY(20px)', opacity: '0' },
  				to: { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideInLeft: {
  				from: { transform: 'translateX(-20px)', opacity: '0' },
  				to: { transform: 'translateX(0)', opacity: '1' }
  			},
  			slideInRight: {
  				from: { transform: 'translateX(20px)', opacity: '0' },
  				to: { transform: 'translateX(0)', opacity: '1' }
  			},
  			'highlight-section': {
  				'0%': { width: '0%', opacity: '0' },
  				'50%': { opacity: '1' },
  				'100%': { width: '100%', opacity: '1' }
  			},
  			'pulse-soft': {
  				'0%, 100%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.02)' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			},
        'border-trace': {
          '0%': { backgroundPosition: '0% 0%', opacity: '0.6' },
          '15%': { opacity: '0.9' },
          '25%': { backgroundPosition: '100% 0%', opacity: '0.8' },
          '40%': { opacity: '0.9' },
          '50%': { backgroundPosition: '100% 100%', opacity: '0.7' },
          '65%': { opacity: '0.9' },
          '75%': { backgroundPosition: '0% 100%', opacity: '0.8' },
          '90%': { opacity: '0.9' },
          '100%': { backgroundPosition: '0% 0%', opacity: '0.6' }
        },
        'section-highlight': {
          '0%, 33%': { opacity: '0.1' },
          '16%': { opacity: '0.7' },
          '100%': { opacity: '0.1' }
        },
        'ink-drop': {
          '0%': { 
            transform: 'scale(0) translateY(-10px)', 
            opacity: '0'
          },
          '20%': { 
            transform: 'scale(1.2) translateY(0)', 
            opacity: '0.8'
          },
          '70%': { 
            transform: 'scale(0.8) translateY(5px)', 
            opacity: '0.6'
          },
          '100%': { 
            transform: 'scale(0) translateY(15px)', 
            opacity: '0'
          }
        },
        'writing': {
          '0%': { width: '0%' },
          '20%': { width: '100%' },
          '40%': { width: '100%' },
          '60%': { width: '0%' },
          '100%': { width: '0%' }
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fadeIn 0.6s ease-in-out forwards',
  			'slide-up': 'slideUp 0.5s ease-out forwards',
  			'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
  			'slide-in-right': 'slideInRight 0.5s ease-out forwards',
  			'highlight-section': 'highlight-section 0.5s ease-out forwards',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
        'border-trace': 'border-trace 4s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite',
        'section-highlight-1': 'section-highlight 6s ease-in-out infinite',
        'section-highlight-2': 'section-highlight 6s ease-in-out infinite 2s',
        'section-highlight-3': 'section-highlight 6s ease-in-out infinite 4s',
        'ink-drop': 'ink-drop 2s ease-in-out forwards',
        'writing': 'writing 5s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
