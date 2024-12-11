import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { Server, type Socket as ServerSocket } from 'socket.io';
import type { Lucia } from 'lucia';
import { lucia } from './src/lib/auth';
import type { JsonSerializable } from '$lib/types/jsonSerializable';
import { ChatService } from './src/lib/server/chatService';
import { ChatRepository } from './src/lib/server/chatRepository';
import { getDb } from './src/lib/database/database';

export class WebsocketServer {
	public id: number;
	private svelteKitServerSocket: ServerSocket | null = null;
	private connections: Map<string, ServerSocket> = new Map();
	// userId to socket
	private sessionTokenToUserId: Map<string, string> = new Map();

	constructor(
		private server: Server,
		private lucia: Lucia,
		private chatService: ChatService
	) {
		this.authMiddleWare();
		this.id = Math.floor(Math.random() * 1000000);
	}

	private authMiddleWare() {
		this.server.use(async (socket, next) => {
			const token = socket.handshake.auth.token;
			if (token === 'server') {
				return next();
			}
			if (!token) {
				return next(new Error('Authentication error'));
			}
			const { session } = await this.lucia.validateSession(token);
			if (!session) {
				return next(new Error('Authentication error'));
			}
			return next();
		});

		this.server.on('connection', async (socket) => {
			const token = socket.handshake.auth.token;
			if (token === 'server') {
				this.setupServerSocket(socket);
				return;
			}
			if (!token) {
				return;
			}
			const { session, user } = await this.lucia.validateSession(token);
			if (!session) {
				return;
			}
			console.log('connect: ' + user.id);
			this.connections.set(user.id, socket);
			this.sessionTokenToUserId.set(token, user.id);
			socket.on('disconnect', () => {
				const token = socket.handshake.auth.token;
				const userId = this.sessionTokenToUserId.get(token);
				console.log('disconnect: ' + userId);
				if (userId) {
					this.connections.delete(userId);
					this.sessionTokenToUserId.delete(token);
				}
			});
			socket.on('fetchChats', async () => {
				const chats = await this.chatService.chatsForUser(user.id);
				socket.emit('fetchChatsResponse', chats);
			});
		});
	}

	private setupServerSocket(socket: ServerSocket) {
		this.svelteKitServerSocket = socket;
		socket.on('disconnect', () => {
			this.svelteKitServerSocket = null;
		});
		socket.on('redirect', ({ to, eventName, content }) => {
			this.sendMessageToUser(to, eventName, content);
		});
		this.svelteKitServerSocket.emit('connected', { id: this.id });
	}

	public sendMessageToUser(id: string, eventName: string, content: JsonSerializable) {
		const connection = this.connections.get(id);
		if (!connection) {
			return;
		}
		const token = connection.handshake.auth.token as string;
		this.lucia
			.validateSession(token)
			.then(({ session }) => {
				if (!session) {
					this.connections.delete(id);
					return;
				}
				connection.emit(eventName, content);
			})
			.catch((error) => {
				console.error('Error validating session:', error);
			});
	}
}

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) {
			return;
		}
		const io = new Server(server.httpServer);
		const db = getDb();
		const chatRepository = new ChatRepository(db);
		const chatService = new ChatService(chatRepository);
		// need to keep this as a variable to prevent it from being garbage collected
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dontDelete = new WebsocketServer(io, lucia, chatService);
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}']
	}
});
