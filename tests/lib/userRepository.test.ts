import {UserRepository} from '$lib/userRepository';
import runMigrations, { MIGRATIONS_PATH } from '$lib/database';
import { describe, it, beforeEach, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import Database from 'better-sqlite3';

describe('UserRepository', () => {
	let userRepository: UserRepository;

	beforeEach(() => {
		const db = Database(':memory:');
		runMigrations(db, MIGRATIONS_PATH);
		userRepository = new UserRepository(db);
	});

	it('should be able to create a new user', async () => {
		const user = { email: faker.internet.email() };

		const response = await userRepository.createUser(user);
		const found = await userRepository.user(response.id);

		expect(found).toMatchObject(user);
	});

	it('should return null if user does not exist', async () => {
		const response = await userRepository.user(faker.string.uuid());

		expect(response).toBeNull();
	});
});
