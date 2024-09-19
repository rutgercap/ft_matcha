import { Database } from 'sqlite3';
import type User from './domain/user';
import type { ProfileInfo } from './domain/user';

class UserRepositoryError extends Error {
	
	originalError : Error | null
    
	constructor(message: string, originalError: Error | null) {
        super(message);
        this.name = 'DatabaseQueryError';
        this.originalError = originalError;
    }

    logError() {
        console.error(`${this.name}: ${this.message}`);
		if (this.originalError)
			console.error('Original error:', this.originalError);

    }
}

type ProfileInfoWithoutImages = Omit<ProfileInfo, 'images'>;


class UserRepository {

	public async updateGender(id: number, gender: string) {
		return new Promise((resolve, reject) => {
			let query = 'UPDATE profiles SET gender = ? WHERE user_id = ?';
			this.db.run(query, [gender, id], (err) => {
				if (err) {
					throw new UserRepositoryError('updateGender has failed', null)
				}
				return true
			})
		})
	}

	public async updateSexPreference(id: number, sex_preference: string) {
		return new Promise((resolve, reject) => {
			let query = 'UPDATE profiles SET sex_preference = ? WHERE user_id = ?';
			this.db.run(query, [sex_preference, id], (err) => {
				if (err) {
					throw new UserRepositoryError('updateSexPreference has failed', null)
				}
				return true
			})
		})
	}

	public async updateBiography(id: number, biography: string) {
		return new Promise((resolve, reject) => {
			let query = 'UPDATE profiles SET biography = ? WHERE user_id = ?';
			this.db.run(query, [biography, id], (err) => {
				if (err) {
					throw new UserRepositoryError('updateBiography has failed', null)
				}
				return true
			})
		})
	}

	public async deletePicture(pictureId: number) {
		return new Promise((resolve, reject) => {
			let query = 'DELETE FROM pictures WHERE picture_id = ?';

			this.db.run(query, [pictureId], (err) => {
				if (err) {
					throw new UserRepositoryError('deletePicture has failed', null)
				}
				return true
			})
		})
	}

	public async setPicture(user_id: number) {
		return new Promise((resolve, reject) => {
			// Step 1: Check the number of pictures for the user
			let countQuery = 'SELECT COUNT(*) AS pictureCount FROM pictures WHERE user_id = ?;';
	
			this.db.get(countQuery, [user_id], (err, row : any) => {
				if (err) 
					return reject(new UserRepositoryError('Failed to check picture count', err));

				const pictureCount = row.pictureCount;
				if (pictureCount >= 5) 
					return reject(new UserRepositoryError('User pictures are more than 5', null));
	
				// Step 3: Insert the picture if less than 5 pictures exist
				let insertQuery = 'INSERT INTO pictures (user_id) VALUES (?);';
	
				this.db.run(insertQuery, [user_id], (err) => {
					if (err)
						return reject(new UserRepositoryError('Failed to insert new picture', err));
					resolve(true);  // Resolve if the picture was added successfully
				});
			});
		});
	}

	public async deleteTag(userId: number, tag: string) {
		return new Promise((resolve, reject) => {
			let query = 'DELETE FROM tags WHERE user_id = ? AND tag = ?';

			this.db.run(query, [userId, tag], (err) => {
				if (err) {
					throw new UserRepositoryError('deleteTag has failed', null)
				}
				return true
			})
		})
	}

	public async setTag(userId: number, tag: string) {
		return new Promise((resolve, reject) => {
			let query = 'INSERT INTO tags (user_id, tag) VALUE (?, ?)';

			this.db.run(query, [userId, tag], (err) => {
				if (err) {
					throw new UserRepositoryError('deleteTag has failed', null)
				}
				return true
			})
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
		return new Promise((resolve, reject) => {

			let request = `
						SELECT 
							profiles.user_id, 
							profiles.gender, 
							profiles.sex_preference, 
							profiles.biography, 
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

			this.db.get<ProfileInfo>(request, [id], (err, row) => {
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


	setProfile(id: number, profileTest: ProfileInfoWithoutImages) {
		return new Promise(
			(resolve, reject) => {
				this.db.serialize(() => {
					this.db.run('BEGIN TRANSACTION')
					this.db.run("INSERT INTO profiles (user_id, gender, sex_preference, biography) VALUES (?, ?, ?, ?);", [id,
						profileTest.gender,
						profileTest.sex_preference,
						profileTest.biography])
					
					// const img_statement = this.db.prepare("INSERT INTO pictures (user_id) VALUES (?);");
					// add upload function
					// profileTest.pictures.forEach((image) => {
					// 	if (image)
					// 		img_statement.run(id);
					// });
		
					const tag_statement = this.db.prepare("INSERT INTO tags (user_id, tag) VALUES (?, ?);");
					profileTest.tags.forEach((tag) => {
						tag_statement.run(id, tag);
					});
					this.db.run('COMMIT', (res: any, err: any) => {
						if (err) {
							reject(err);
						} else {
							if (!res) {
								resolve(null);
							}
							resolve(res);
						}
					})
		
					img_statement.finalize()
					tag_statement.finalize()
				})
			}
		
		) 
	}

	constructor(private db: Database) { }

	public dbInstance() : Database {
		return this.db
	}

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
