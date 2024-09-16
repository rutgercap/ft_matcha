import type { Database } from 'sqlite3';
import fs from 'fs';

async function runMigrations(db: Database): Promise<void> {
	const migrationsFolder = 'migrations';
	const migrationFiles = fs.readdirSync(migrationsFolder).sort();
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			migrationFiles.forEach(async (file) => {
				const migrationPath = `${migrationsFolder}/${file}`;
				const sql = fs.readFileSync(migrationPath, 'utf8');
				db.run(sql, (err) => {
					if (err) {
						reject(err);
					}
				});
			});
		});
		resolve();
	});
}

export default runMigrations;
