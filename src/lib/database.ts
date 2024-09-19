import fs from 'fs';
import Database from 'better-sqlite3';

export class MigrationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MigrationError';
	}
}

export const MIGRATIONS_PATH = 'migrations';

async function runMigrations(db: Database.Database, path: string): Promise<void> {
	try {
		const migrationFiles = fs.readdirSync(path).filter((file) => file.endsWith('.sql'));
		for (const file of migrationFiles) {
			const migration = fs.readFileSync(`${path}/${file}`, 'utf-8');
			db.exec(migration);
		}
	} catch (e) {
		throw new MigrationError('Migration failed: ' + String(e));
	}
}

export default runMigrations;
