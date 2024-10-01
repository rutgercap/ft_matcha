import { DuplicateEntryError } from '$lib/userRepository';
import { describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { generateIdFromEntropySize } from 'lucia';
import { itWithFixtures } from '../fixtures';

describe('UserRepository', () => {
	itWithFixtures('should be able to create a new user', async ({ userRepository }) => {
		const userId = generateIdFromEntropySize(10);
		const password = faker.internet.password();
		const user = { id: userId, email: faker.internet.email(), username: faker.internet.userName() };

		const response = await userRepository.createUser(user, password);
		const found = await userRepository.user(response.id);

		expect(found).toMatchObject(user);
	});

	itWithFixtures('Should be able to fetch user by username', async ({ userRepository }) => {
		const userId = generateIdFromEntropySize(10);
		const password = faker.internet.password();
		const user = { id: userId, email: faker.internet.email(), username: faker.internet.userName() };
		await userRepository.createUser(user, password);

		const found = await userRepository.userByUsername(user.username);

		expect(found).toMatchObject(user);
	});

	itWithFixtures('should return null if user does not exist', async ({ userRepository }) => {
		const response = await userRepository.user(faker.string.uuid());

		expect(response).toBeNull();
	});

	itWithFixtures(
		'should return DuplicateEntryError if username taken',
		async ({ userRepository }) => {
			const userName = faker.internet.userName();
			const password = faker.internet.password();
			const userOne = {
				id: generateIdFromEntropySize(10),
				email: faker.internet.email(),
				username: userName
			};
			const userTwo = {
				id: generateIdFromEntropySize(10),
				email: faker.internet.email(),
				username: userName
			};
			await userRepository.createUser(userOne, password);

			try {
				await userRepository.createUser(userTwo, password);
			} catch (e) {
				expect(e).toBeInstanceOf(DuplicateEntryError);
				expect((e as DuplicateEntryError).entity).toBe('username');
			}
		}
	);
});
