import { describe } from 'vitest';
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
	itWithFixtures('Should not be able to connect without session', async ({ httpServer }) => {
		const port = (httpServer.address() as AddressInfo).port;
		const socket = io(`http://localhost:${port}`);
		socket.disconnect();
	});
});
