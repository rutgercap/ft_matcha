import { afterEach, describe } from 'vitest';
import { io, type Socket as ClientSocket } from 'socket.io-client';
import { type Socket as ServerSocket } from 'socket.io';
import { itWithFixtures } from '../../fixtures';
import type { AddressInfo } from 'net';

function waitFor(socket: ServerSocket | ClientSocket, event: string): Promise<unknown> {
	return new Promise((resolve) => {
		socket.once(event, resolve);
	});
}

async function waitUntilConnected(socket: ClientSocket) {
	return waitFor(socket, 'connect');
}

describe('WebsocketServer', () => {
	let socket: ClientSocket | null = null;

	afterEach(() => {
		socket?.disconnect();
		socket = null;
	});

	// Dont remove websocket since we need to set it up
	itWithFixtures(
		'Should not be able to connect without session',
		async ({ httpServer, websocketServer }) => {
			const port = (httpServer.address() as AddressInfo).port;
			socket = io(`http://localhost:${port}`);

			await new Promise((resolve, reject) => {
				socket!.on('connect_error', (error) => resolve(null));
				socket!.on('connect', () =>
					reject(new Error('Expected connect_error but connected successfully'))
				);
			});
		}
	);

	// Dont remove websocket since we need to set it up
	itWithFixtures.skip(
		'Should be able to connect without session',
		async ({ httpServer, websocketServer }) => {
			const port = (httpServer.address() as AddressInfo).port;
			socket = io(`http://localhost:${port}`, {
				auth: {
					token: 'abc'
				}
			});
			await new Promise((resolve, reject) => {
				socket!.on('connect_error', (error) =>
					reject(new Error('Expected connect_error but connected successfully'))
				);
				socket!.on('connect', () => resolve(null));
			});
		}
	);
});
