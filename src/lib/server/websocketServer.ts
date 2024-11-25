import type { JsonSerializable } from '$lib/types/jsonSerializable';
import { createServer, type Server as HttpServer } from 'http';
import { Server, type Socket as ServerSocket } from 'socket.io';

let server: WebsocketServer | null = null;

export class WebsocketServer {
	private _server: Server;
	private connections: Map<string, ServerSocket> = new Map();
	currentId = 0;

	constructor(server: Server) {
		this._server = server;
		this.authMiddleWare();
		this.saveConnections();
	}

	private authMiddleWare() {
		this._server.use((socket, next) => {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error('Authentication error'));
			}
			console.log('token', token);
			next();
		});
	}

	private saveConnections() {
		this._server.on('connection', (socket) => {
			this.connections.set(this.currentId.toString(), socket);
			socket.on('disconnect', () => {
				this.connections.delete(this.currentId.toString());
			});
			this.currentId++;
		});
	}

	public sendMessageToUser(id: string, eventName: string, content: JsonSerializable) {
		this.connections.get(id)?.emit(eventName, content);
	}
}

export function websocketServer(httpServer?: HttpServer): WebsocketServer {
	if (server) {
		return server;
	}
	const _httpServer = httpServer ?? createServer();
	const io = new Server(_httpServer);
	server = new WebsocketServer(io);
	return server;
}
