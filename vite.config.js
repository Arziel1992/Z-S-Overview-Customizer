import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// Standard ES module workaround to define paths robustly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, "./src/lib"),
			$assets: path.resolve(__dirname, "./src/assets"),
		},
	},
	server: {
		port: 3000,
	},
});
