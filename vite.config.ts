import { sveltekit } from '@sveltejs/kit/vite';
import { websocketServer } from './src/lib/server/websocketServer';
import { defineConfig, type ViteDevServer } from 'vite';
import type { Server as HttpServer } from 'http';

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) {
			return;
		}
		// need to keep this as a variable to prevent it from being garbage collected
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dontDelete = websocketServer(server.httpServer as HttpServer);
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}']
	}
});
