import runMigrations, { MIGRATIONS_PATH } from '$lib/database';
import type { UserRepository as UserRepositoryType } from '$lib/userRepository';
import { UserRepository } from '$lib/userRepository';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { it } from 'vitest';

interface MyFixtures {
	db: DatabaseType;
	userRepository: UserRepositoryType;
}

export const itWithFixtures = it.extend<MyFixtures>({
	db: async ({}, use) => {
		const db = new Database(':memory:');
		await runMigrations(db, MIGRATIONS_PATH);
		return use(Database(':memory:'));
	},
	userRepository: ({ db }, use) => {
		return use(new UserRepository(db));
	}, 
});
