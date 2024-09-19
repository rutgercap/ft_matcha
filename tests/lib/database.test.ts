import runMigrations, { MigrationError, MIGRATIONS_PATH } from '$lib/database';
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import temp from 'temp';
import path from 'path';
import Database from 'better-sqlite3';

describe('sqlite database', () => {
	it('should throw error for invalid migration file', async () => {
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
		const db = Database(':memory:');
		try {
			await runMigrations(db, tempDir);
			expect.unreachable();
		} catch (error) {
			expect(error).toBeInstanceOf(MigrationError);
		} finally {
			temp.cleanupSync();
		}
	});

	it('should run the current migrations without problem', async () => {
		const path = MIGRATIONS_PATH;
		const db = Database(':memory:');
		await runMigrations(db, path);
	});
});
