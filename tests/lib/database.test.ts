import runMigrations, { MigrationError, MIGRATIONS_PATH } from '$lib/database';
import { describe, expect } from 'vitest';
import fs from 'fs';
import temp from 'temp';
import path from 'path';
import { itWithFixtures } from '../fixtures';
import Database from 'better-sqlite3';

describe('sqlite database', () => {
	itWithFixtures('should throw error for invalid migration file', async () => {
		const db = new Database(':memory:');
		const tempDir = temp.mkdirSync('migration-test');
		const migrationPath = path.join(tempDir, '100_invalid_sql.sql');
		fs.writeFileSync(
			migrationPath,
			`
			CREATE TABLE profiles (
			user_id INTEGER FOREIGN KEY user.id,
			gender TEXT NOT NULL,
			sex_preference TEXT NOT NULL,
			biography TEXT NOT NULL
			);
			`
		);
		try {
			await runMigrations(db, tempDir);
			expect.unreachable();
		} catch (error) {
			expect(error).toBeInstanceOf(MigrationError);
		} finally {
			temp.cleanupSync();
		}
	});

	itWithFixtures('should run the current migrations without problem', async () => {
		const db = new Database(':memory:');
		const path = MIGRATIONS_PATH;
		await runMigrations(db, path);
	});
});
