import { beforeEach, describe, expect } from 'vitest';
import { DEFAULT_PASSWORD, itWithFixtures } from '../fixtures';
import { getConnectedUser, waitUntilConnected } from './server/notificationService.test';
import type { AddressInfo } from 'net';
import { io } from 'socket.io-client';
import { ChatClient } from '$lib/chatClient';

describe('chatClient', () => {
	itWithFixtures(
		'should fetch chats',
		async ({ httpServer, savedUserFactory, chatRepository, authService, notificationService }) => {
			const [user, other] = await savedUserFactory(2);
			const chatId = await chatRepository.createChat(user.id, other.id);
			const token = await authService.signIn(user.username, DEFAULT_PASSWORD);
			const port = (httpServer.address() as AddressInfo).port;
			const socket = io(`http://localhost:${port}`, {
				auth: {
					token: token.value
				}
			});
			const chatClient = new ChatClient(socket);
			socket.emit('fetchChats');

			while (chatClient.loading) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			const chats = chatClient.chatPreviews();

			expect(chats).toEqual([{ id: chatId, userOne: user.id, userTwo: other.id, messages: [] }]);
		}
	);
});
