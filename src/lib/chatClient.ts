import type { Socket } from 'socket.io-client';
import type { Chat, ChatPreview, Message } from './domain/chat';
import { writable, type Writable } from 'svelte/store';

class ChatClientError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'ChatClientError';
		this.exception = exception;
	}
}

export class ChatClient {
	public loading = true;
	public chats: Writable<Map<number, Chat>> = writable(new Map());

	constructor(
		private client: Socket,
		private userId: string
	) {
		this.onMessage();
		this.onConnectionError();
		this.fetchChats();
	}

	private onMessage() {
		this.client.on('message', (arg: { chatId: number; message: Message }) => {
			console.log('message', arg);
			this.chats.update((currentChats) => {
				const chat = currentChats.get(arg.chatId);
				if (chat) {
					chat.messages.push(arg.message);
				}
				return new Map(currentChats);
			});
		});
	}

	private async fetchChats() {
		this.client.emit('fetchChats');
		this.client.on('fetchChatsResponse', (response: Chat[]) => {
			this.chats.set(new Map(response.map((chat: Chat) => [chat.id, chat])));
			this.loading = false;
		});
	}

	private onConnectionError() {
		this.client.on('connect_error', (error) => {
			console.error('connection error: ' + error);
		});
	}

	public messages(chatId: number): Message[] {
		let chat: undefined | Chat;
		this.chats.subscribe((chats) => (chat = chats.get(chatId)));
		if (!chat) {
			return [];
		}
		return chat.messages;
	}

	public async createChat(chatPartnerId: string): Promise<Chat> {
		return new Promise((resolve, reject) => {
			try {
				this.client.emit('createChat', { chatPartnerId });
				this.client.timeout(3000).on('newChat', (chat: Chat) => {
					this.chats.update((currentChats) => {
						currentChats.set(chat.id, chat);
						return new Map(currentChats);
					});
					resolve(chat);
				});
			} catch (e) {
				console.log(e);
				reject(new ChatClientError('Something went wrong creating chat', e));
			}
		});
	}

	public chatPreviews(): ChatPreview[] {
		this.fetchChats();
		let previews: ChatPreview[] = [];
		this.chats.subscribe((chats) => {
			previews = Array.from(chats.values()).map((chat) => {
				const { messages, ...rest } = chat;
				return {
					...rest,
					lastMessage: chat.messages[chat.messages.length - 1]
				};
			});
		});
		return previews;
	}

	public sendMessage(chatId: number, message: string) {
		this.client.emit('sendMessage', { userId: this.userId, chatId, message });
	}
}
