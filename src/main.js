/**
 * Application entry point: mounts the Svelte 5 root component onto
 * document.body and pulls in the global stylesheet (Tailwind layers + theme
 * tokens + shared animations).
 */

import { mount } from "svelte";
import App from "./App.svelte";
import "$assets/tailwind.css";

const app = mount(App, {
	target: document.body,
});

export default app;
