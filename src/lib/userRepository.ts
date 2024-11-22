import type { Database } from 'better-sqlite3';
import { SqliteError } from 'better-sqlite3';
import type { ProfileInfo, ReducedProfileInfo } from './domain/profile';
import { hash } from '@node-rs/argon2';
import _ from 'lodash';
import type { User } from 'lucia';
import { v4 as uuidv4 } from 'uuid';
import { ImageRepository } from './imageRepository';
import { Buffer } from 'buffer';
import type { ToSnakeCase } from './commonTypes';

type UserWithPassword = User & { passwordHash: string };

type UserWithoutProfileSetup = Omit<User, 'profileIsSetup' | 'emailIsSetup'>;

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
	constructor(
		private db: Database,
		private imageRepo: ImageRepository
	) {}

	async userByUsername(username: string): Promise<UserWithPassword | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						string,
						ToSnakeCase<UserWithPassword>
					>('SELECT id, email, username, password_hash, profile_is_setup, email_is_setup FROM users WHERE username = ?')
					.get(username);
				if (result) {
					const camelCaseObject = _.mapKeys(result, (value, key) => _.camelCase(key)) as any;
					camelCaseObject.profileIsSetup = camelCaseObject.profileIsSetup === 0 ? false : true;
					resolve(camelCaseObject as UserWithPassword);
				} else {
					resolve(null);
				}
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

	async profileInfoFor(id: string): Promise<ProfileInfo | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, ToSnakeCase<ProfileInfo>>(
						`
						SELECT profile_info.*, GROUP_CONCAT(tags.tag) AS tags
						FROM profile_info
						LEFT JOIN tags ON profile_info.user_id = tags.user_id
						WHERE profile_info.user_id = ?
						GROUP BY profile_info.user_id
						`
					)
					.get(id);
				const pictures: Array<string> = this.imageRepo.allImageIdOnly(id);
				if (!result) {
					resolve(null);
				} else {
					const camelCaseObject = _.mapKeys(result, (value, key) => _.camelCase(key));
					camelCaseObject.tags = (camelCaseObject.tags as string).split(',');
					camelCaseObject.pictures_filenames = pictures;
					resolve(camelCaseObject as ProfileInfo);
				}
			} catch (e) {
				reject(
					new UserRepositoryError('Something went wrong fetching user for username: ' + id, e)
				);
			}
		});
	}

	async upsertPersonalInfo(id: string, info: ProfileInfo): Promise<Array<string | null>> {
		const insertIntoProfile = this.db.prepare<[string, string, string, string, string, string]>(
			`
				INSERT INTO profile_info (user_id, first_name, last_name, gender, sexual_preference, biography)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT(user_id) DO UPDATE SET
				first_name=excluded.first_name,
				last_name=excluded.last_name,
				gender=excluded.gender,
				sexual_preference=excluded.sexual_preference,
				biography=excluded.biography;`
		);
		const updateProfileSet = this.db.prepare<[string]>(
			'UPDATE users SET profile_is_setup = 1 WHERE id = ?'
		);
		const deleteTags = this.db.prepare<[string]>(`DELETE FROM tags WHERE user_id = ?`);
		const insertTag = this.db.prepare<[string, string, string]>(
			`INSERT INTO tags (id, user_id, tag) VALUES (?, ?, ?)`
		);

		const buffers: Array<Buffer | null> = await this.imageRepo.convertFileToBuffer(info.pictures);

		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction((id: string, profileTest: ProfileInfo) => {
					insertIntoProfile.run(
						id,
						profileTest.firstName,
						profileTest.lastName,
						profileTest.gender.toString(),
						profileTest.sexualPreference.toString(),
						profileTest.biography
					);
					updateProfileSet.run(id);
					deleteTags.run(id);
					profileTest.tags.forEach((tag) => {
						insertTag.run(uuidv4(), id, tag);
					});
				});
				transaction(id, info);

				// if (buffers)
				const inserted_filename: Array<string | null> = this.imageRepo.upsertImageAll(id, buffers);

				resolve(inserted_filename);
			} catch (e) {
				if (e instanceof SqliteError) {
					reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
				}
				reject(new UserRepositoryError(`Something went wrong creating user: ${e}`, e));
			}
		});
	}

	public async allOtherUsers(id: string) {
		interface UserId {
			id: string;
		}
		return new Promise((resolve, reject) => {
			try {
				// this needs AND profile_is_setup = 1
				const result = this.db
					.prepare<string, UserId>(
						`SELECT id
   						FROM users
						WHERE id != ?`
					)
					.all(id)
					.map((user) => user.id);
				resolve(result);
			} catch (e) {
				console.log(e);
				reject(new UserRepositoryError('Something went wrong fetching other users', e));
			}
		});
	}

	public user(id: string): Promise<User | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						string,
						UserWithPassword
					>('SELECT id, email, username, profile_is_setup FROM users WHERE id = ?')
					.get(id);
				if (!result) {
					resolve(null);
				}
				const camelCaseObject = _.mapKeys(result, (value, key) => _.camelCase(key)) as any;
				camelCaseObject.profileIsSetup = camelCaseObject.profileIsSetup === 0 ? false : true;
				resolve(camelCaseObject as User);
			} catch (e) {
				reject(new UserRepositoryError('Something went wrong fetching user for id: ' + id, e));
			}
		});
	}

	public reducedProfile(id:string): Promise<ReducedProfileInfo> {
		return new Promise((resolve, reject) => {
			try {
				const sql = `
					SELECT u.username, p.biography, p.gender, pp.id AS picture
					FROM users AS u
					INNER JOIN profile_info AS p ON u.id = p.user_id
					INNER JOIN profile_pictures AS pp ON u.id = pp.user_id
					WHERE u.id = ? AND pp.image_order = 0
				`;

				const res = this.db.prepare<string>(sql).get(id);
				resolve(res);
			} catch (error) {
				reject(new UserRepositoryError('Something went wrong getting reducedProfile for user id: ' + id, error));
			}
		})
	}

	public upsertProfileIsSetup(userId: string, flag: boolean) {
		try {
			const val = flag ? 1 : 0;
			const sql = this.db.prepare<[number, string]>(
				`UPDATE users SET profile_is_setup = ? WHERE id = ?`
			);
			const res = sql.run(val, userId);
			return res;
		} catch (error) {
			console.log('error in the userRepository:upsertProfileIsSetup:', error);
			throw new UserRepositoryError('Error occur in the upsertProfileIsSetup function', error);
		}
	}

	public upsertPasswordIsSet(userId: string, flag: boolean) {
		try {
			const val = flag ? 1 : 0;
			const sql = this.db.prepare<[number, string]>(
				`UPDATE users SET password_is_set = ? WHERE id = ?`
			);
			const res = sql.run(val, userId);
			return res;
		} catch (error) {
			console.log('error in the userRepository:upsertProfileIsSetup:', error);
			throw new UserRepositoryError('Error occur in the upsertProfileIsSetup function', error);
		}
	}

	public async createUser(user: UserWithoutProfileSetup, password: string): Promise<User> {
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<[string, string, string, string], ToSnakeCase<UserWithPassword>>(
						`INSERT INTO users (id, email, username, password_hash)
						VALUES (?, ?, ?, ?)
						RETURNING id, email, username, profile_is_setup;`
					)
					.get(user.id, user.email, user.username, passwordHash);
				if (result !== undefined) {
					const camelCaseObject = _.mapKeys(result, (value, key) => _.camelCase(key));
					resolve(camelCaseObject as unknown as User);
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

	public async updateUserPswd(userId: string, password: string) {
		try {
			const passwordHash = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			const sql = this.db.prepare<[string, string]>(
				`UPDATE users SET password_hash = ? WHERE id = ?`
			);
			const res = sql.run(passwordHash, userId);
			return res;
		} catch (error) {
			console.log('error occur at updateUserPswd: ', error);
			throw new UserRepositoryError(
				'error occur trying to update new password for user:' + userId,
				error
			);
		}
	}

	public async deleteUserImage(picture_id: string) {
		try {
			const res = this.db
				.prepare<string>('DELETE FROM profile_pictures WHERE id = ?')
				.run(picture_id);
			if (res.changes) {
				await this.imageRepo.deleteImageById(picture_id);
			} else {
				throw new Error('picture_id is not in the database');
			}
		} catch (error) {
			throw new UserRepositoryError('Error occurs trying to delete image: ' + picture_id, error);
		}
	}
}

export { UserRepository, UserRepositoryError, DuplicateEntryError };
export type { UserWithPassword, UserWithoutProfileSetup };
