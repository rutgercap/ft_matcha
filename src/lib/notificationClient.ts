import type { Socket } from 'socket.io-client';
import type { ToastWithoutId } from './toast/toastStore';

export type NotificationType = 'LIKE' | 'MATCH' | 'UNMATCH' | 'UNLIKE';
export type Notification = {
	type: string;
	from: NotificationType;
};

export function notificationToToast(notification: Notification): ToastWithoutId {
	switch (notification.type) {
		case 'LIKE':
			return { message: `User ${notification.from} liked you`, type: 'info' };
		case 'MATCH':
			return { message: `You matched with user ${notification.from}`, type: 'info' };
		case 'UNMATCH':
			return { message: `Your match with ${notification.from} is over`, type: 'info' };
		case 'UNLIKE':
			return { message: `You unliked ${notification.from}`, type: 'info' };
		default:
			return { message: `This notification should not show`, type: 'info' };
	}
}

export class NotificationClient {
	private _notifications: Notification[] = [];
	private listeners: Map<number, (data: Notification) => void> = new Map();
	private nextListenerId: number = 1;

	constructor(private client: Socket) {
		this.onNotification();
		this.onConnectionError();
	}

	private onNotification() {
		this.client.on('notification', (arg: Notification) => {
			this._notifications.push(arg);
			this.listeners.forEach((listener) => listener(arg));
		});
	}

	private onConnectionError() {
		this.client.on('connect_error', (error) => {
			console.error('connection error: ' + error);
		});
	}

	public notifications(): Notification[] {
		return this._notifications;
	}

	public subscribe(callback: (notification: Notification) => void): number {
		const id = this.nextListenerId++;
		this.listeners.set(id, callback);
		return id;
	}

	public unsubscribe(id: number) {
		this.listeners.delete(id);
	}
}
