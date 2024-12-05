import type { Database } from 'better-sqlite3';

class BrowsingRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'BrowsingRepositoryError';
		this.exception = exception;
	}
}

class BrowsingRepository {
	constructor(private db: Database) {}

	public async allOtherUsers(id: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, { id: string }>(
						`SELECT id
   						FROM users
						  WHERE id != ? AND profile_is_setup = 1`
					)
					.all(id)
					.map((user) => user.id);
				resolve(result);
			} catch (e) {
				reject(new BrowsingRepositoryError('Something went wrong fetching other users', e));
			}
		});
	}

	public async numberOfLiked(userId: string) {
		try {
			const sql = `
				SELECT count(id) AS cnt FROM likes WHERE liked_id = ?`;
			const query = this.db.prepare<string>(sql);
			const result = query.get(userId);
			return result.cnt;
		} catch (e) {
			throw new BrowsingRepositoryError('an error occured trying to get the number of like for user:' + userId, e)
		}

	}
}

export { BrowsingRepository, BrowsingRepositoryError };
