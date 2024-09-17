import { Database } from 'sqlite3';
import type User from './domain/user';
import type { ProfileInfo } from './domain/user';

class UserRepository {

	async userProfile(id: number) {
		return new Promise((resolve, reject) => {

			let request = `
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

	setProfile(id: number, profileTest: ProfileInfo) {
		return new Promise(
			(resolve, reject) => {
				this.db.serialize(() => {
					this.db.run('BEGIN TRANSACTION')
					this.db.run("INSERT INTO profiles (user_id, gender, sex_preference, biography) VALUES (?, ?, ?, ?);", [id,
						profileTest.gender,
						profileTest.sex_preference,
						profileTest.biography])
					
					const img_statement = this.db.prepare("INSERT INTO pictures (user_id, url) VALUES (?, ?);");
					profileTest.pictures.forEach((image) => {
						img_statement.run(id, image);
					});
		
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
