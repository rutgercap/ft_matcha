import type { NotificationClient } from '$lib/notificationClient';
import { writable } from 'svelte/store';

export const notificationClientStore = writable<NotificationClient | null>(null);
