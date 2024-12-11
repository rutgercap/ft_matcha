import { describe, expect } from 'vitest';
import { DEFAULT_PASSWORD, itWithFixtures } from '../fixtures';
import { getConnectedUser } from './server/notificationService.test';
import type { AddressInfo } from 'net';
import { io } from 'socket.io-client';
import { ChatClient } from '$lib/chatClient';
import type { Chat, ChatPreview } from '$lib/domain/chat';

function chatToPreview(chat: Chat): ChatPreview {
	return {
		id: chat.id,
		userOne: chat.userOne,
		userTwo: chat.userTwo,
		lastMessage: chat.messages[chat.messages.length - 1]
	};
}

function areChatPreviewsSame(a: ChatPreview, b: ChatPreview) {
	return (
		a.id === b.id &&
		(a.userOne === b.userOne || a.userOne === b.userTwo) &&
		(a.userTwo === b.userOne || a.userTwo === b.userTwo)
		&& a.lastMessage === b.lastMessage
	);
}

describe('chatClient', () => {
	// keep serversocket
	itWithFixtures(
		'should fetch chats that already exist',
		async ({ httpServer, savedUserFactory, chatRepository, authService, serverSocket }) => {
			const [user, other] = await savedUserFactory(2);
			const chat = await chatRepository.createChat(user.id, other.id);
			const token = await authService.signIn(user.username, DEFAULT_PASSWORD);
			const port = (httpServer.address() as AddressInfo).port;
			const socket = io(`http://localhost:${port}`, {
				auth: {
					token: token.value
				}
			});
			const chatClient = new ChatClient(socket, user.id);
			socket.emit('fetchChats');

			while (chatClient.loading) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			const found = chatClient.chatPreviews();

			expect(found).toEqual([chatToPreview(chat)]);
		}
	);

	// keep serversocket
	itWithFixtures(
		'should receive new chats',
		async ({ savedUserFactory, chatClient, clientSocket, lucia, serverSocket }) => {
			const [other] = await savedUserFactory(2);
			const user = await getConnectedUser(clientSocket, lucia);
			while (chatClient.loading) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			let chats = chatClient.chatPreviews();
			expect(chats).toEqual([]);

			const chat= await chatClient.createChat(other.id);

			chats = chatClient.chatPreviews();
			expect(chats.length).toBe(1);
			expect(areChatPreviewsSame(chats[0], { id: chat.id, userOne: user.id, userTwo: other.id }));
		}
	);
});
