import type { Socket } from 'socket.io-client';
import type { Chat, ChatPreview, Message } from './domain/chat';

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
	private _chats: Map<number, Chat> = new Map();

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
			this._chats.get(arg.chatId)?.messages.push(arg.message);
		});
	}

	private async fetchChats() {
		this.client.emit('fetchChats');
		this.client.on('fetchChatsResponse', (response: Chat[]) => {
			this._chats = new Map(response.map((chat: Chat) => [chat.id, chat]));
			this.loading = false;
		});
	}

	private onConnectionError() {
		this.client.on('connect_error', (error) => {
			console.error('connection error: ' + error);
		});
	}

	public messages(chatId: number): Message[] {
		const chat = this._chats.get(chatId);
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
					this._chats.set(chat.id, chat);
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
		return Array.from(this._chats.values()).map((chat) => {
			const { messages, ...rest } = chat;
			return {
				...rest,
				lastMessage: chat.messages[chat.messages.length - 1]
			};
		});
	}

	public sendMessage(chatId: number, message: string) {
		this.client.emit('sendMessage', { userId: this.userId, chatId, message });
	}
}
