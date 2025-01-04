import { describe, expect } from 'vitest';
import { itWithFixtures } from '../../fixtures';

describe('chatRepository', () => {
	itWithFixtures('Can create and return chats', async ({ chatRepository, savedUserFactory }) => {
		const users = await savedUserFactory(2);

		await chatRepository.createChat(users[0].id, users[1].id);

		let chats = await chatRepository.chatsForUser(users[0].id);
		expect(chats).toEqual([
			{
				id: 1,
				userOne: users[0].id,
				userTwo: users[1].id
			}
		]);
		chats = await chatRepository.chatsForUser(users[1].id);
		expect(chats).toEqual([
			{
				id: 1,
				userOne: users[0].id,
				userTwo: users[1].id
			}
		]);
	});

	itWithFixtures(
		'Chatpreview returns latest message',
		async ({ chatRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2);
			const id = await chatRepository.createChat(users[0].id, users[1].id);
			await chatRepository.saveMessage(id, users[0].id, 'send nudes');
			await chatRepository.saveMessage(id, users[0].id, 'send more nudes');

			let chats = await chatRepository.chatsForUser(users[0].id);
			let latest = chats[0];
			console.log(latest);
			expect(latest.lastMessage?.message).toEqual('send more nudes');
			chats = await chatRepository.chatsForUser(users[1].id);
			latest = chats[0];
			expect(latest.lastMessage?.message).toEqual('send more nudes');
		}
	);

	itWithFixtures('Can save a message to a chat', async ({ chatRepository, savedUserFactory }) => {
		const users = await savedUserFactory(2);
		const chatId = await chatRepository.createChat(users[0].id, users[1].id);

		await chatRepository.saveMessage(chatId, users[0].id, 'send nudes');
		const chat = await chatRepository.chat(chatId);

		expect(chat.messages).toEqual([
			{
				id: 1,
				senderId: users[0].id,
				message: 'send nudes',
				sentAt: expect.any(Date)
			}
		]);
	});
});
