import type { Socket } from 'socket.io-client';

export type NotificationType = 'LIKE' | 'MATCH' | 'UNMATCH' | 'UNLIKE';
export type Notification = {
	type: string;
	from: NotificationType;
};

export class NotificationClient {
	private _notifications: Notification[] = [];
	private listeners: { [event: string]: Array<(data: any) => void> } = {};

	constructor(private client: Socket) {
		this.onNotification();
		this.onConnectionError();
	}

	private onNotification() {
		this.client.on('notification', (arg: Notification) => {
			this._notifications.push(arg);
			this.emit('notification', arg);
		});
	}

	private onConnectionError() {
		this.client.on('connect_error', (error) => {
			console.error(error);
		});
	}

	public notifications(): Notification[] {
		return this._notifications;
	}

	public subscribe(callback: (notification: Notification) => void) {
		this.on('notification', callback);
	}

	public unsubscribe(callback: (notification: Notification) => void) {
		this.removeListener('notification', callback);
	}

	private on(event: string, callback: (data: any) => void) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(callback);
	}

	private emit(event: string, data: any) {
		const eventListeners = this.listeners[event] || [];
		eventListeners.forEach((listener) => listener(data));
	}

	private removeListener(event: string, callback: (data: any) => void) {
		if (this.listeners[event]) {
			this.listeners[event] = this.listeners[event].filter((listener) => listener !== callback);
		}
	}
}
