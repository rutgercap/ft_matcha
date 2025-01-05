import type { ChatClient } from '$lib/chatClient';
import { writable } from 'svelte/store';

export const chatClientStore = writable<ChatClient | null>(null);
