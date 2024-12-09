import type { Database } from 'better-sqlite3';
import type { Chat, ChatPreview, Message } from '$lib/domain/chat';
import { parse } from 'date-fns';
import type { NotificationService } from './notificationService';
import { SqliteError } from 'better-sqlite3';
import type { ToSnakeCase } from '$lib/types/snakeCase';
import _ from 'lodash';

export class ChatRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'UserRepositoryError';
		this.exception = exception;
	}
}

export class ChatRepository {
	constructor(
		private db: Database,
		private notificationService: NotificationService
	) {}

	public async createChat(userOneId: string, userTwoId: string): Promise<number> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<[string, string], { id: number }>(
						`INSERT INTO chat (user_id_1, user_id_2)
						VALUES (?, ?)
						RETURNING id`
					)
					.get(userOneId, userTwoId);
				resolve(result!.id);
			} catch (e) {
				if (e instanceof SqliteError) {
					if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
						const regex = /users\.(.*)/;
						const match = e.message.match(regex);
						if (!match) {
							reject(
								new ChatRepositoryError(
									`Something went wrong creating chat for users: ${userOneId} and ${userTwoId}`,
									e
								)
							);
						}
						reject(
							new ChatRepositoryError(`Duplicate entry for users: ${userOneId} and ${userTwoId}`, e)
						);
					}
				}
				reject(
					new ChatRepositoryError(
						`Something went wrong creating chat for users: ${userOneId} and ${userTwoId}`,
						e
					)
				);
			}
		});
	}

	public async chatsForUser(userId: string): Promise<ChatPreview[]> {
		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction((userId) => {
					const chats = this.db
						.prepare<[string, string], { id: number; user_id_1: string; user_id_2: string }>(
							`SELECT id, user_id_1, user_id_2 
							FROM chat
							WHERE user_id_1 = ? OR user_id_2 = ?`
						)
						.all(userId, userId);
					const mapped: ChatPreview[] = chats
						.map((chat) => {
							return {
								id: chat.id,
								userOne: chat.user_id_1,
								userTwo: chat.user_id_2
							};
						})
						.map((chat) => {
							const snakeCaseMessage = this.db
								.prepare<
									[number],
									{ id: number; message: string; sender: string; sent_at: string }
								>(
									`SELECT id, sender_id, message, sent_at
							FROM messages
							WHERE chat_id = ?
							ORDER BY sent_at DESC`
								)
								.get(chat.id);
							if (!snakeCaseMessage) {
								return chat;
							}
							const date = parse(snakeCaseMessage.sent_at, 'yyyy-MM-dd HH:mm:ss', new Date());
							const lastMessage = {
								..._.mapKeys(snakeCaseMessage, (value, key) => _.camelCase(key)),
								sentAt: date
							} as unknown as Message;
							return {
								...chat,
								lastMessage
							};
						});
					resolve(mapped);
				});
				transaction(userId);
			} catch {
				reject(
					new ChatRepositoryError(`Something went wrong fetching chats for user: ${userId}`, null)
				);
			}
		});
	}

	public async saveMessage(chatId: number, userId: string, message: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.prepare<
						[number, string, string],
						{ id: number; user_id_1: string; user_id_2: string; created_at: string }
					>(
						`INSERT INTO messages (chat_id, sender_id, message)
						VALUES (?, ?, ?)`
					)
					.run(chatId, userId, message);
				resolve();
			} catch {
				reject(
					new ChatRepositoryError(`Something went wrong fetching chats for user: ${userId}`, null)
				);
			}
		});
	}

	public async chat(chatId: number): Promise<Chat> {
		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction((chatId) => {
					const snakeCaseChat = this.db
						.prepare<[number], { id: number; user_id_1: string; user_id_2: string }>(
							`SELECT id, user_id_1, user_id_2
							FROM chat
							WHERE id = ?`
						)
						.get(chatId);
					const chat = _.mapKeys(snakeCaseChat, (value, key) => {
						_.camelCase(key);
					}) as unknown as Chat;
					if (!snakeCaseChat) {
						reject(new ChatRepositoryError(`No chat found for id: ${chatId}`, null));
					}
					const snakeCaseMessages = this.db
						.prepare<[number], { id: number; message: string; sender: string; sent_at: string }>(
							`SELECT id, sender_id, message, sent_at
							FROM messages
							WHERE chat_id = ?
							ORDER BY sent_at DESC`
						)
						.all(chatId);
					const messages = snakeCaseMessages.map((message) => {
						const date = parse(message.sent_at, 'yyyy-MM-dd HH:mm:ss', new Date());
						return {
							..._.mapKeys(message, (value, key) => _.camelCase(key)),
							sentAt: date
						};
					}) as unknown as Message[];
					resolve({
						...chat,
						messages
					});
				});
				transaction(chatId);
			} catch (e) {
				console.error(e);
				reject(new ChatRepositoryError(`Something went wrong fetching chat: ${chatId}`, null));
			}
		});
	}
}
