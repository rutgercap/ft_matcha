import type { JsonSerializable } from '$lib/types/jsonSerializable';
import { io, type Socket } from 'socket.io-client';

let _instance: ServerSocket | null = null;

export class ServerSocket {
	private socket: Socket;

	constructor(url: string) {
		this.socket = io(url, {
			auth: {
				token: 'server'
			}
		});
		this.socket.on('connect', () => {
			console.log('Connected to server');
		});
		this.socket.on('disconnect', (reason, details) => {
			console.log('Disconnected from server', reason, details);
		});
		this.socket.on('connect_error', (error) => {
			if (this.socket.active) {
				// temporary failure, the socket will automatically try to reconnect
			} else {
				// the connection was denied by the server
				// in that case, `socket.connect()` must be manually called in order to reconnect
				console.log('error: ' + error.message);
			}
		});
	}

	public sendMessageToUser(toUserId: string, eventName: string, content: JsonSerializable) {
		this.socket.emit('redirect', { to: toUserId, eventName, content });
	}
}

export function getServerSocket(url: string): ServerSocket {
	if (!_instance) {
		_instance = new ServerSocket(url);
	}
	return _instance!;
}
