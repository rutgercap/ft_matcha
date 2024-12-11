import type { Socket } from 'socket.io-client';
import type { Chat, ChatPreview, Message } from './domain/chat';

export class ChatClient {
	public loading = true;
	private _chats: Map<number, Chat> = new Map();
	private nextListenerId: number = 1;

	constructor(private client: Socket, private userId: string) {
		this.onMessage();
		this.onConnectionError();
		this.fetchChats();
	}

	private onMessage() {
		this.client.on('message', (arg: { id: number; message: Message }) => {
			this._chats.get(arg.id)?.messages.push(arg.message);
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
		return this._chats.get(chatId)?.messages || [];
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
				reject(e);
			}
		});
	}

	public chatPreviews(): ChatPreview[] {
		this.fetchChats();
		return Array.from(this._chats.values()).map((chat) => {
			return {
				...chat,
				lastMessage: chat.messages[chat.messages.length - 1]
			};
		});
	}
}
