/**
 * Application entry point: mounts the Svelte 5 root component onto
 * document.body and pulls in the global stylesheet (Tailwind layers + theme
 * tokens + shared animations).
 */

// Fonts are self-hosted (bundled) — no CDN request, no visitor IP leaves the
// origin (GDPR: LG München I 3 O 17493/20 outlawed Google-hosted fonts).
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { mount } from "svelte";
import App from "./App.svelte";
import "$assets/tailwind.css";

const app = mount(App, {
	target: document.body,
});

export default app;
