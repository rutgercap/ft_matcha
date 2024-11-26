import type { WebsocketServer } from './websocketServer';

export class NoticiationService {
	socketServer: WebsocketServer;

	constructor(socketServer: WebsocketServer) {
		this.socketServer = socketServer;
	}

	public sendNotification(userId: string, type: string, message: string) {
		this.socketServer.sendMessageToUser(userId, 'notification', { type, message });
	}
}
