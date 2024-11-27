import type { ReducedProfileInfo } from "./domain/profile";
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

	public allIdExcept(userId: string) {
		try {
			const sql = this.db.prepare<string>('SELECT id FROM users where id != ?');
			const res = sql.all(userId);
			return res;
		} catch (error) {
			throw new BrowsingRepositoryError(
				'error occur trying to get browsing list for user:' + userId,
				error
			);
		}
	}

}

export { BrowsingRepository, BrowsingRepositoryError };
