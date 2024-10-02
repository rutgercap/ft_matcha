import runMigrations, { MIGRATIONS_PATH } from '$lib/database/database';
import type { UserRepository as UserRepositoryType } from '$lib/userRepository';
import path from 'path';
import { UserRepository } from '$lib/userRepository';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import temp from 'temp';
import { it } from 'vitest';

interface MyFixtures {
	db: DatabaseType;
	userRepository: UserRepositoryType;
}

export const itWithFixtures = it.extend<MyFixtures>({
	db: async ({}, use) => {
		const tempMigrationsDir = temp.mkdirSync('migrations');
		const db = new Database(':memory:');
		await runMigrations(db, MIGRATIONS_PATH, path.join(tempMigrationsDir, 'migrations.lock'), true);
		use(db);
		temp.cleanupSync();
	},
	userRepository: ({ db }, use) => {
		return use(new UserRepository(db));
	}
});
