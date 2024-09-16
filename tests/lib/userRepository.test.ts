import UserRepository from '$lib/userRepository';
import runMigrations from '$lib/database';
import { describe, it, beforeEach, expect } from 'vitest';
import sqlite3 from 'sqlite3';
import { faker } from '@faker-js/faker';

describe('UserRepository', () => {
	let userRepository: UserRepository;

	beforeEach(() => {
		const db = new sqlite3.Database(':memory:');
		runMigrations(db);
		userRepository = new UserRepository(db);
	});

	it('should be able to create a new user', async () => {
		const user = { id: faker.number.int(), email: faker.internet.email() };

		await userRepository.createUser(user);
		const found = await userRepository.getUserById(user.id);

		expect(found).toStrictEqual(user);
	});

	it('should return null if user does not exist', async () => {
		const response = await userRepository.getUserById(10);

		expect(response).toBeNull();
	});
});
