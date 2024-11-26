import type { Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export type Notification = {
	type: string;
	message: string;
};

export class NotificationClient {
	private _notifications: Notification[] = [];
	private emitter = new EventEmitter();

	constructor(private client: Socket) {
		this.onNotification();
		this.onConnectionError();
	}

	private onNotification() {
		this.client.on('notification', (arg: Notification) => {
			this._notifications.push(arg);
			this.emitter.emit('notification', arg);
		});
	}

	private onConnectionError() {
		this.client.on('connect_error', (error) => {
			console.error('Connection error', error);
			throw new Error('Connection error');
		});
	}

	public notifications(): Notification[] {
		return this._notifications;
	}

	public subscribe(callback: (notification: Notification) => void) {
		this.emitter.on('notification', callback);
	}

	public unsubscribe(callback: (notification: Notification) => void) {
		this.emitter.off('notification', callback);
	}
}
