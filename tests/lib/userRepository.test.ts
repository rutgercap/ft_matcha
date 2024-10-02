import { DuplicateEntryError } from '$lib/userRepository';
import { describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { generateIdFromEntropySize } from 'lucia';
import { itWithFixtures } from '../fixtures';
import { Gender, SexualPreference, type ProfileInfo, type User } from '$lib/domain/user';

function anyUser(): User {
	const userId = generateIdFromEntropySize(10);
	return { id: userId, email: faker.internet.email(), username: faker.internet.userName() };
}

function anyUserProfile(): ProfileInfo {
	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		gender: faker.helpers.arrayElement(Object.values(Gender)),
		sexualPreference: faker.helpers.arrayElement(Object.values(SexualPreference)),
		biography: faker.lorem.paragraph({ min: 1, max: 25 })
	};
}

describe('UserRepository', () => {
	itWithFixtures('should be able to create a new user', async ({ userRepository }) => {
		const password = faker.internet.password();
		const user = anyUser();

		const response = await userRepository.createUser(user, password);
		const found = await userRepository.user(response.id);

		expect(found).toMatchObject(user);
	});

	itWithFixtures('should be able to set user profile', async ({ userRepository }) => {
		const userProfile = anyUserProfile();
		const user = anyUser();
		await userRepository.createUser(user, faker.internet.password());

		await userRepository.upsertPersonalInfo(user.id, userProfile);

		const found = await userRepository.peronsalInfoFor(user.id);
		expect(found).toMatchObject(userProfile);
	});

	itWithFixtures('should be able to update user profile', async ({ userRepository }) => {
		let userProfile = anyUserProfile();
		const user = anyUser();
		await userRepository.createUser(user, faker.internet.password());
		await userRepository.upsertPersonalInfo(user.id, userProfile);

		userProfile.biography = "I am a new person";
		await userRepository.upsertPersonalInfo(user.id, userProfile);

		const found = await userRepository.peronsalInfoFor(user.id);
		expect(found).toMatchObject(userProfile);
	});

	itWithFixtures('Should be able to fetch user by username', async ({ userRepository }) => {
		const password = faker.internet.password();
		const user = anyUser();
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
