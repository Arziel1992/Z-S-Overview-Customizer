/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{svelte,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Theme-aware app shell palette (driven by CSS vars, see tailwind.css)
				app: {
					bg: "rgb(var(--bg) / <alpha-value>)",
					panel: "rgb(var(--panel) / <alpha-value>)",
					panel2: "rgb(var(--panel-2) / <alpha-value>)",
					border: "rgb(var(--border) / <alpha-value>)",
					text: "rgb(var(--text) / <alpha-value>)",
					muted: "rgb(var(--text-muted) / <alpha-value>)",
					accent: "rgb(var(--accent) / <alpha-value>)",
					accentHover: "rgb(var(--accent-hover) / <alpha-value>)",
				},
				// Fixed, game-accurate EVE overview chrome (dark in every theme)
				eve: {
					bg: "#06080b",
					panel: "#0a0d13",
					panel2: "#111621",
					header: "#0b0e14",
					border: "#1b2230",
					accent: "#00d2ff",
					text: "#c8d4e3",
					muted: "#7c8fa6",
				},
			},
			fontFamily: {
				sans: ['"Inter"', "system-ui", "sans-serif"],
				mono: ['"JetBrains Mono"', "monospace"],
			},
		},
	},
	plugins: [],
};
