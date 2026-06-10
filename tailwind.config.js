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
				// Fixed, game-accurate EVE overview chrome (dark in every theme, but a
				// softened space-blue rather than pure black)
				eve: {
					bg: "#0c1018",
					panel: "#11161f",
					panel2: "#171d28",
					header: "#10141c",
					border: "#283242",
					accent: "#3aa0ff",
					text: "#c8d4e3",
					muted: "#8295ac",
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
