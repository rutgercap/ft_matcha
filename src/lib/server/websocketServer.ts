import type { JsonSerializable } from '$lib/types/jsonSerializable';
import { createServer, type Server as HttpServer } from 'http';
import { Server, type Socket as ServerSocket } from 'socket.io';
import type { Lucia } from 'lucia';
// need relative import for vite
import { lucia } from '../auth';

let server: WebsocketServer | null = null;

export class WebsocketServer {
	private connections: Map<string, ServerSocket> = new Map();
	currentId = 0;

	constructor(private server: Server, private lucia: Lucia) {
		this.authMiddleWare();
	}

	private authMiddleWare() {
		this.server.use(async (socket, next) => {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error('Authentication error'));
			}
			const {session, user }= await this.lucia.validateSession(token)
			if (!session) {
				return next(new Error('Authentication error'));
			}
			this.connections.set(user.id, socket);
			next();
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
	server = new WebsocketServer(io, lucia);
	return server;
}
