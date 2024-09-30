import type { Database } from 'better-sqlite3';
import { SqliteError } from 'better-sqlite3';
import type { User } from './domain/user';
import type { ProfileInfo } from './domain/user';

class UserRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'UserRepositoryError';
		this.exception = exception;
	}
}

class DuplicateEntryError extends UserRepositoryError {
	constructor(message: string) {
		super(message, null);
		this.name = 'DuplicateEntryError';
	}
}

class UserRepository {
	constructor(private db: Database) {}

	async userProfile(id: string): Promise<ProfileInfo | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, ProfileInfo>(
						`
						SELECT 
									profiles.user_id, 
									profiles.gender, 
									profiles.sex_preference, 
									profiles.biography, 
									GROUP_CONCAT(DISTINCT pictures.url) AS pictures, 
									GROUP_CONCAT(DISTINCT tags.tag) AS tags
								FROM 
									profiles
								INNER JOIN 
									pictures ON profiles.user_id = pictures.user_id
								INNER JOIN 
									tags ON profiles.user_id = tags.user_id
								WHERE 
									profiles.user_id = ? 
								GROUP BY 
									profiles.user_id;
				`
					)
					.get(id);
				resolve(result ? result : null);
			} catch (e) {
				reject(
					new UserRepositoryError('Something went wrong fetching user profile for id: ' + id, e)
				);
			}
		});
	}

	setProfile(id: string, profileTest: ProfileInfo) {
		id += 1;
		profileTest.biography += ' ';
		throw new Error('Method not implemented.');
	}

	public user(id: string): Promise<User | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db.prepare<string, User>('SELECT * FROM users WHERE id = ?').get(id);
				resolve(result ? result : null);
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong fetching user for id: ' + id, e));
			}
		});
	}

	public createUser(user: User, passwordHash: string): Promise<User> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						[string, string, string, string],
						User
					>('INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?) RETURNING *;')
					.get(user.id, user.email, user.username, passwordHash);
				if (result !== undefined) {
					resolve(result);
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${user.email}`, null));
			} catch (e) {
				if (e instanceof SqliteError) {
					console.log('e.code', e.code);
					if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
						reject(new DuplicateEntryError(`Duplicate entry for user: ${user.email}`));
					}
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
	}
}

export { UserRepository, UserRepositoryError, DuplicateEntryError };
