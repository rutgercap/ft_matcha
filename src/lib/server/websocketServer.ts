import type { JsonSerializable } from '$lib/types/jsonSerializable';
import { createServer, type Server as HttpServer } from 'http';
import { Server, type Socket as ServerSocket } from 'socket.io';
import type { Lucia } from 'lucia';
// need relative import for vite
import { lucia } from '../auth';

let server: WebsocketServer | null = null;

export class WebsocketServer {
	// userId to socket
	private connections: Map<string, ServerSocket> = new Map();
	private sessionTokenToUserId: Map<string, string> = new Map();
	currentId = 0;

	constructor(
		private server: Server,
		private lucia: Lucia
	) {
		this.authMiddleWare();
		this.removeDisconnectedUser();
	}

	private authMiddleWare() {
		this.server.use(async (socket, next) => {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error('Authentication error'));
			}
			const { session, user } = await this.lucia.validateSession(token);
			if (!session) {
				return next(new Error('Authentication error'));
			}
			this.connections.set(user.id, socket);
			this.sessionTokenToUserId.set(token, user.id);
			next();
		});
	}

	private removeDisconnectedUser() {
		this.server.on('disconnect', (socket) => {
			const id = socket.handshake.auth.id;
			const userId = this.sessionTokenToUserId.get(id);
			if (userId) {
				this.connections.delete(userId);
			}
			this.sessionTokenToUserId.delete(id);
		});
	}

	public sendMessageToUser(id: string, eventName: string, content: JsonSerializable) {
		const connection = this.connections.get(id);
		if (!connection) {
			return;
		}
		const token = connection.handshake.auth.token as string;
		this.lucia.validateSession(token).then(({ session }) => {
			if (!session) {
				this.connections.delete(id);
				return;
			}
			connection.emit(eventName, content);
		});
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
