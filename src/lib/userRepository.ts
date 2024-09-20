import type { Database } from 'better-sqlite3';
import type User from './domain/user';
import type { ProfileInfo } from './domain/user';
import { v4 as uuidv4 } from 'uuid';

class UserRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'UserRepositoryError';
		this.exception = exception;
	}
}

type NewUser = Omit<User, 'id'>;

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

	public createUser(user: NewUser): Promise<User> {
		return new Promise((resolve, reject) => {
			try {
				const id = uuidv4();
				const result = this.db
					.prepare<
						[string, string],
						User
					>('INSERT INTO users (id, email) VALUES (?, ?) RETURNING *;')
					.get(id, user.email);
				if (result !== undefined) {
					resolve(result);
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${user.email}`, null));
			} catch (e) {
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
	}
}

export { UserRepository, UserRepositoryError };
