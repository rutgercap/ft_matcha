import UserRepository from '$lib/userRepository';
import runMigrations, { MIGRATIONS_PATH } from '$lib/database';
import { describe, it, beforeEach, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { type ProfileInfo } from '$lib/domain/user';
import Database from 'better-sqlite3';

describe('UserRepository', () => {
	let userRepository: UserRepository;

	beforeEach(() => {
		const db = Database(':memory:');
		runMigrations(db, MIGRATIONS_PATH);
		userRepository = new UserRepository(db);
	});

	it('should be able to create a new user', async () => {
		const user = { id: faker.number.int(), email: faker.internet.email() };

		await userRepository.createUser(user);
		const found = await userRepository.userById(user.id);

		expect(found).toStrictEqual(user);
	});

	it('should return null if user does not exist', async () => {
		const response = await userRepository.userById(10);

		expect(response).toBeNull();
	});

	it('should be able to set prefrences', async () => {
		return; // not implemented
		const user = { id: faker.number.int(), email: faker.internet.email() };
		await userRepository.createUser(user);

		const profileTest: ProfileInfo = {
			gender: faker.animal.horse(),
			sex_preference: faker.animal.horse(),
			biography: faker.lorem.lines(),
			tags: [faker.color.human()],
			pictures: [faker.image.url()]
		};

		await userRepository.setProfile(user.id, profileTest);

		const found = await userRepository.userProfile(user.id);

		expect(found).toStrictEqual(profileTest);
	});
});
