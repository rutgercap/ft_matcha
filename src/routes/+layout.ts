import { io } from 'socket.io-client';
import type { LayoutLoad } from './$types';
import { NotificationClient } from '$lib/notificationClient';

export const load: LayoutLoad = ({ data, url }) => {
	let notificationClient: NotificationClient | null = null;
	if (data.session) {
		const websocketUrl = url.origin;
		const socket = io(websocketUrl, {
			auth: {
				token: data.session.id
			}
		});

		notificationClient = new NotificationClient(socket);
	}
	return {
		notificationClient,
		...data
	};
};
