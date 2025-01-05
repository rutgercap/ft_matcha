import type { NotificationClient } from '$lib/notificationClient';
import { writable } from 'svelte/store';

interface NotificationState {
	client: NotificationClient | null;
	subscription: any | null; // Replace 'any' with your subscription type
}

export const notificationClientStore = writable<NotificationState>({
	client: null,
	subscription: null
});
