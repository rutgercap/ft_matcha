import { describe, expect } from 'vitest';
import { DEFAULT_PASSWORD, itWithFixtures } from '../fixtures';
import { getConnectedUser } from './server/notificationService.test';
import type { AddressInfo } from 'net';
import { io } from 'socket.io-client';
import { ChatClient } from '$lib/chatClient';

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
			const chats = chatClient.chatPreviews();

			expect(chats).toEqual([chat]);
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

			const chatId = await chatClient.createChat(other.id);

			chats = chatClient.chatPreviews();
			expect(chats).toEqual([{ id: chatId, userOne: user.id, userTwo: other.id, messages: [] }]);
		}
	);
});
