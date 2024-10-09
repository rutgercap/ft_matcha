import runMigrations, { MIGRATIONS_PATH } from '$lib/database/database';
import type { UserRepository as UserRepositoryType } from '$lib/userRepository';
import path from 'path';
import { UserRepository } from '$lib/userRepository';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import temp from 'temp';
import { it } from 'vitest';
import type { ImageRepository as ImageRepositoryType } from '$lib/imageRepository';
import { ImageRepository } from '$lib/imageRepository';
import type { User } from 'lucia';
import { anyUser } from './testHelpers';

interface MyFixtures {
	db: DatabaseType;
	userRepository: UserRepositoryType;
	imageRepository: ImageRepositoryType;
	savedUser: User;
}

export const itWithFixtures = it.extend<MyFixtures>({
	db: async ({}, use) => {
		const tempMigrationsDir = temp.mkdirSync('migrations');
		const db = new Database(':memory:');
		await runMigrations(db, MIGRATIONS_PATH, path.join(tempMigrationsDir, 'migrations.lock'), true);
		await use(db);
		temp.cleanupSync();
	},
	userRepository: async ({ db }, use) => {
		await use(new UserRepository(db));
	},
	imageRepository: async ({ db }, use) => {
		const tempMigrationsDir = temp.mkdirSync('migrations');
		await use(new ImageRepository(tempMigrationsDir, db));
		temp.cleanupSync();
	},
	savedUser: async ({ userRepository }, use) => {
		const user = anyUser();
		await userRepository.createUser(user, 'password');
		await use(user);
	}
});
