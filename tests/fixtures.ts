import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { it } from 'vitest';

interface MyFixtures {
	db: DatabaseType;
}

export const itWithFixtures = it.extend<MyFixtures>({
	db: ({}, use) => {
		return use(Database(':memory:'));
	}
});
