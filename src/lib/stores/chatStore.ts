import type { Chat } from '$lib/domain/chat';
import { writable } from 'svelte/store';

export const chatStore = writable<Map<number, Chat>>(new Map());
