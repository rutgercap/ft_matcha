import type { Database } from 'better-sqlite3';
import { SqliteError } from 'better-sqlite3';
import type { User } from './domain/user';
import type { ProfileInfo } from './domain/user';
import { hash } from '@node-rs/argon2';

type UserWithPassword = User & { password_hash: string };

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

	async userByUsername(username: string): Promise<UserWithPassword | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, UserWithPassword>('SELECT * FROM users WHERE username = ?')
					.get(username);
				resolve(result ? result : null);
			} catch (e) {
				reject(
					new UserRepositoryError('Something went wrong fetching user for username: ' + username, e)
				);
			}
		});
	}

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
				const result = this.db
					.prepare<string, UserWithPassword>('SELECT * FROM users WHERE id = ?')
					.get(id);
				if (!result) {
					resolve(null);
				}
				const { password_hash, ...userWithoutPassword } = result as UserWithPassword;
				resolve(userWithoutPassword);
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong fetching user for id: ' + id, e));
			}
		});
	}

	public async createUser(user: User, password: string): Promise<User> {
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						[string, string, string, string],
						UserWithPassword
					>('INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?) RETURNING *;')
					.get(user.id, user.email, user.username, passwordHash);
				if (result !== undefined) {
					const { password_hash, ...userWithoutPassword } = result;
					resolve(userWithoutPassword);
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${user.email}`, null));
			} catch (e) {
				if (e instanceof SqliteError) {
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
