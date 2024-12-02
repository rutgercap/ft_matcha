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
		//	console.log('Connected to server');
		});
		this.socket.on('disconnect', () => {
		//	console.log('Disconnected from server');
		});
		this.socket.on('connect_error', (error) => {
		//	console.log('Error connecting to websocketServer: ' + error.message);
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
