import type { NotificationType } from '$lib/notificationClient';
import type { WebsocketServer } from './websocketServer';


export class NotificationService {
	socketServer: WebsocketServer;

	constructor(socketServer: WebsocketServer) {
		this.socketServer = socketServer;
	}

	public sendNotification(userId: string, type: NotificationType, from: string) {
		this.socketServer.sendMessageToUser(userId, 'notification', { type, from });
	}
}
