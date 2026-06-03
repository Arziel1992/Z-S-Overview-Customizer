import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	// Enables seamless TypeScript, PostCSS, and Tailwind compilation
	preprocess: vitePreprocess(),
};
