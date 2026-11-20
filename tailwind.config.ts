import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
	extend: {
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
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
			},
			landing: {
				// RGB triplets live in src/globals.css (dark by default, light under data-theme="light").
				steel: 'rgb(var(--landing-steel) / <alpha-value>)',
				'steel-2': 'rgb(var(--landing-steel-2) / <alpha-value>)',
				'steel-3': 'rgb(var(--landing-steel-3) / <alpha-value>)',
				'steel-4': 'rgb(var(--landing-steel-4) / <alpha-value>)',
				fog: 'rgb(var(--landing-fog) / <alpha-value>)',
				sky: 'rgb(var(--landing-sky) / <alpha-value>)',
				'sky-deep': 'rgb(var(--landing-sky-deep) / <alpha-value>)',
				'sky-soft': 'rgb(var(--landing-sky) / 0.14)',
				line: 'rgb(var(--landing-fog) / 0.10)',
				email: 'rgb(var(--landing-email) / <alpha-value>)',
				whatsapp: 'rgb(var(--landing-whatsapp) / <alpha-value>)',
				sms: 'rgb(var(--landing-sms) / <alpha-value>)',
				voice: 'rgb(var(--landing-voice) / <alpha-value>)',
				violet: 'rgb(var(--landing-violet) / <alpha-value>)',
			},
			// Design system text and accent colours (src/globals.css, DESIGN-SYSTEM.md).
			tb: {
				ink: 'rgb(var(--tb-ink) / <alpha-value>)',
				'ink-2': 'rgb(var(--tb-ink-2) / <alpha-value>)',
				'ink-3': 'rgb(var(--tb-ink-3) / <alpha-value>)',
				accent: 'rgb(var(--tb-accent) / <alpha-value>)',
			},
		},
		fontFamily: {
			'landing-display': ['"Red Hat Display"', 'system-ui', 'sans-serif'],
			'landing-sans': ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
			'landing-mono': ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
				'landing-travel-h': { from: { left: '0' }, to: { left: '100%' } },
				'landing-travel-v': { from: { top: '0' }, to: { top: '100%' } },
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
				'landing-travel-h': 'landing-travel-h 2.2s linear infinite',
				'landing-travel-v': 'landing-travel-v 2.2s linear infinite',
		}
	}
  },
  plugins: [animate],
} satisfies Config;
