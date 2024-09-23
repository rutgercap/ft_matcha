import type { Database } from 'better-sqlite3';
import type User from './domain/user';
import type { ProfileInfo } from './domain/user';
import * as fs from 'fs';
import * as path from 'path';


class UserRepositoryError extends Error {
	
	originalError : Error | null | unknown
    
	constructor(message: string, originalError: Error | null | unknown) {
        super(message);
        this.name = 'UserRepositoryError';
        this.originalError = originalError;
    }

    logError() {
        console.error(`${this.name}: ${this.message} | ${this.originalError}`);
		if (this.originalError)
			console.error('Original error:', this.originalError);

    }
}

class UserRepository {
	constructor(private db: Database) {}

	public async updateGender(userId: number, gender: string) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query = 'UPDATE profiles SET gender = ? WHERE user_id = ?';
				this.db.prepare<[string, number], ProfileInfo>(query)
				.run(gender, userId);
				resolve()
			} catch (e) {
				reject(new UserRepositoryError('something went wrong updating gender for id: ' + userId, e))
			}
		})
	}

	public async updateSexPreference(userId: number, sexPreference: string) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query = 'UPDATE profiles SET sex_preference = ? WHERE user_id = ?';
				this.db.prepare<[string, number], ProfileInfo>(query)
				.run(sexPreference, userId);
				resolve()
			} catch (e) {
				reject(new UserRepositoryError('something went wrong updating the sex preference for id:' + userId, e))
			}
		})
	}

	public async updateBiography(userId: number, biography: string) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query = 'UPDATE profiles SET biography = ? WHERE user_id = ?';
				this.db.prepare<[string, number], ProfileInfo>(query)
				.run(biography, userId);
				resolve()
			} catch (e) {
				reject(new UserRepositoryError('something went wrong updating the biography for id: ' + userId, e))
			}
		})
	}

	public async tryMaxPicture(userId: number) : Promise<number | undefined> {
		return new Promise((reject, resolve) => {
			try {
				let countQuery = 'SELECT COUNT(*) AS pictureCount FROM pictures WHERE user_id = ?;';
				const found = this.db.prepare<number, number>(countQuery)
				.get(userId)
				resolve(found)
				
			} catch (e) {
				throw new UserRepositoryError('something went wrong checking max picture for id: ' + userId, e)
			}

		})
	}

	public async deletePicture(userId:number, pictureId: number) : Promise<void>{
		return new Promise((resolve, reject) => {
			try {
				let query = 'DELETE FROM pictures WHERE picture_id = ?';
				this.db.prepare<number>(query)
				.run(pictureId);
				resolve()
			} catch (e) {
				reject(new UserRepositoryError('something went wrong deleting picture for id: ' + userId, e))
			}
		})
	}

	private setPictureFolder(pictureId: number | bigint): void {
		const pictureIdStr = pictureId.toString();
	
		const folderPath = './path_picture_test';
	
		const filePath = path.join(folderPath, `${pictureIdStr}.jpeg`);
	
		try {
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath, { recursive: true });
			}
	
			fs.writeFileSync(filePath, ''); // Empty string means an empty file
	
			console.log(`Empty file created at: ${filePath}`);
		} catch (error) {
			console.error('Error creating file:', error);
			throw new Error('Failed to save the picture file.');
		}
	}

	public async setPicture(userId: number) : Promise<number | bigint> {
		return new Promise((resolve, reject) => {
			// Step 1: Check the number of pictures for the user
			
			try {
				this.tryMaxPicture(userId).then((numpics) => {
					if (numpics && numpics < 5) {
						let query = 'INSERT INTO pictures (user_id) VALUES (?);';
						const result = this.db.prepare<number>(query).run(userId);
						const picture_id = result.lastInsertRowid;
						
						this.setPictureFolder(picture_id)

						resolve(picture_id);
					} else {
						throw new UserRepositoryError('number of picture >= 5', null)
					}

				}).catch((e) => reject(new UserRepositoryError('something went wrong fetching the number of picture for id: ' + userId, e)))
			} catch (e) {
				reject(new UserRepositoryError('something went wrong setting picture for id: ' + userId, e))
			}

		});
	}

	public async picture(pictureId: number) : Promise<unknown> {
		return new Promise((resolve, reject) => {
			// Step 1: Check the number of pictures for the user
			
			try {
				const query = 'SELECT * FROM picture WHERE picture_id = ?'
				const result = this.db.prepare<number>(query).get(pictureId)
				resolve(result)
			} catch (e) {
				reject(new UserRepositoryError('something went wrong setting picture for id: ' + userId, e))
			}

		});
	}

	public async deleteTag(userId: number, tag: string): Promise<void>  {
		return new Promise((resolve, reject) => {
			try {
				let query = 'DELETE FROM tags WHERE user_id = ? AND tag = ?';
				this.db.prepare<[number, string], User>(query)
				.run(userId, tag);
				resolve()
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong deleting the Tag for id: ' + userId, e))
			}
		})
	}

	public async setTag(userId: number, tag: string) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query = 'INSERT INTO tags (user_id, tag) VALUE (?, ?)';
				this.db.prepare<[number, string], User>(query)
				.run(userId, tag);
				resolve();
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong setting tag for id: ' + userId, e));
			}
		})
	}

	async updateProfile(id: number, updates: Partial<ProfileInfo>) {
		return new Promise((resolve, reject) => {
			// Base SQL query
			const params: string[] = [];

			// Dynamically build query based on what fields are provided
			if (updates.gender) {
				this.updateGender(id, updates.gender)
			}
		
			if (updates.sex_preference) {
				this.updateSexPreference(id, updates.sex_preference)
			}
		
			if (updates.biography) {
				this.updateBiography(id, updates.biography)
			}
			
		})

	}

	async userProfile(id: number) {
		try {
			const result = this.db
				.prepare<number, ProfileInfo>(
					`
					SELECT 
								profiles.user_id, 
								profiles.gender, 
								profiles.sex_preference, 
								profiles.biography, 
								GROUP_CONCAT(DISTINCT pictures.picture_id) AS pictures, 
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
			throw new UserRepositoryError('Something went wrong fetching user profile for id: ' + id, e);
		}
	}

	async setProfile(userId: number, profileTest: ProfileInfo) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let profilequery = `INSERT INTO 
				profiles (user_id, gender, sex_preference, biography) 
				VALUES 
				(?, ?, ?, ?);`;

				this.db.prepare<[number, string, string, string], Partial<ProfileInfo> >(profilequery)
				.run(userId, profileTest.gender, profileTest.sex_preference, profileTest.biography)
				
				const promisesPics : Promise<void>[] = [] 
				for (let i = 0; i < profileTest.pictures.length; i++)
					promisesPics.push(this.setPicture(userId))
				Promise.all(promisesPics)

				const promisesTag : Promise<void>[] = []
				for (let i = 0; i < profileTest.tags.length; i++)
					promisesTag.push(this.setTag(userId, profileTest.tags[i]))
				Promise.all(promisesTag)

				resolve()
			} catch (e) {
				reject(e)
			}
		})
	}

	public userById(id: number): Promise<User | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db.prepare<number, User>('SELECT * FROM users WHERE id = ?').get(id);
				resolve(result ? result : null);
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong fetching user for id: ' + id, e));
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
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
	}
}

export default UserRepository;
