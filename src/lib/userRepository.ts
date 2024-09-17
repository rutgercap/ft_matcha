import { Database } from 'sqlite3';
import type User from './domain/user';

class UserRepository {
	constructor(private db: Database) {}

	public userById(id: number): Promise<User | null> {
		return new Promise((resolve, reject) => {
			this.db.get<User>('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (!row) {
						resolve(null);
					}
					resolve(row);
				}
			});
		});
	}

	public createUser(user: User): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('INSERT INTO users (id, email) VALUES (?, ?)', [user.id, user.email], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

export class NotFoundError extends Error {
	constructor(
		public entity: string,
		public name: string
	) {
		super(`${entity} not found: ${name}`);
	}
}

export default UserRepository;
