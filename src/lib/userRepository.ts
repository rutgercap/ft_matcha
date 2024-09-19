import type { Database } from 'better-sqlite3';
import type User from './domain/user';
import type { ProfileInfo } from './domain/user';

class UserRepositoryError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserRepositoryError';
	}
}

class UserRepository {
	constructor(private db: Database) {}

	async userProfile(id: number) {
		try {
			const result = await this.db
				.prepare<number, ProfileInfo>(
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
			return result;
		} catch (e) {
			throw new UserRepositoryError('Something went wrong fetching user profile for id: ' + id);
		}
	}

	setProfile(id: number, profileTest: ProfileInfo) {
		throw new Error('Method not implemented.');
	}

	public userById(id: number): Promise<User | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db.prepare<number, User>('SELECT * FROM users WHERE id = ?').get(id);
				resolve(result ? result : null);
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong fetching user for id: ' + id));
			}
		});
	}

	public createUser(user: User): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.db
					.prepare<[number, string], User>('INSERT INTO users (id, email) VALUES (?, ?)')
					.run(user.id, user.email);
				resolve();
			} catch (e) {
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`));
			}
		});
	}
}

export default UserRepository;
