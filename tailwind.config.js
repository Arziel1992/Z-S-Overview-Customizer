/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{svelte,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				eve: {
					bg: "#06080b",
					panel: "#10141d",
					border: "#1b2230",
					accent: "#2a5eb2",
					accentHover: "#3c7be6",
					textMuted: "#7c8fa6",
					standingPurple: "#bf00ff",
					standingGreen: "#00ff00",
					standingRed: "#ff3333",
					standingBlue: "#33ccff",
				},
			},
			fontFamily: {
				sans: ['"Inter"', "sans-serif"],
				mono: ['"JetBrains Mono"', "monospace"],
			},
		},
	},
	plugins: [],
};
