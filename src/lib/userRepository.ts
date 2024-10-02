import type { Database } from 'better-sqlite3';
import { SqliteError } from 'better-sqlite3';
import type { User } from './domain/user';
import type { ProfileInfo } from './domain/user';
import { hash } from '@node-rs/argon2';
import _ from 'lodash';


type UserWithPassword = User & { password_hash: string };

type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type ToSnakeCase<T> = {
  [K in keyof T as SnakeCase<string & K>]: T[K];
};


class UserRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'UserRepositoryError';
		this.exception = exception;
	}
}

class DuplicateEntryError extends UserRepositoryError {
	entity: string;

	constructor(message: string, entity: string) {
		super(message, null);
		this.name = 'DuplicateEntryError';
		this.entity = entity;
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

	peronsalInfoFor(id: string): Promise<ProfileInfo | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, ToSnakeCase<ProfileInfo>>('SELECT * FROM profile_info WHERE user_id = ?')
					.get(id);
				if (!result) {
					resolve(null);
				} else {
					const camelCaseObject = _.mapKeys(result, (value, key) => _.camelCase(key));
					resolve(camelCaseObject as ProfileInfo);
				}
			} catch (e) {
				reject(
					new UserRepositoryError('Something went wrong fetching user for username: ' + id, e)
				);
			}
		});
	}

	async upsertPersonalInfo(id: string, profileTest: ProfileInfo): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.prepare<
						[string, string, string, string, string, string]
					>(`
						INSERT INTO profile_info (user_id, first_name, last_name, gender, sexual_preference, biography) 
						VALUES (?, ?, ?, ?, ?, ?) 
						ON CONFLICT(user_id) DO UPDATE SET 
    					first_name=excluded.first_name,
    					last_name=excluded.last_name,
    					gender=excluded.gender,
    					sexual_preference=excluded.sexual_preference,
    					biography=excluded.biography;`)
					.run(
						id,
						profileTest.firstName,
						profileTest.lastName,
						profileTest.gender.toString(),
						profileTest.sexualPreference.toString(),
						profileTest.biography
					);
				resolve();
			} catch (e) {
				if (e instanceof SqliteError) {
					console.log(e);
					reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
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
						const regex = /users\.(.*)/;
						const match = e.message.match(regex);
						if (!match) {
							reject(new UserRepositoryError(`Duplicate entry for user: ${user.email}`, 'unkown'));
						}
						reject(
							new DuplicateEntryError(
								`Duplicate entry for user: ${user.email}`,
								(match as RegExpMatchArray)[1]
							)
						);
					}
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
	}
}

export { UserRepository, UserRepositoryError, DuplicateEntryError };
export type { UserWithPassword };
