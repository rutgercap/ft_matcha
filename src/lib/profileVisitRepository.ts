import type { Database } from 'better-sqlite3';

class ProfileVisitRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'UserRepositoryError';
		this.exception = exception;
	}
}

interface ProfileVisit {
	visitor_id: string;
}

export class ProfileVisitRepository {
	constructor(private db: Database) {}

	public async addVisit(visitorId: string, visitedId: string): Promise<void> {
		const result = this.db.prepare<[string, string]>(
			`INSERT INTO profile_visits (visitor_id, visited_user_id) 
			VALUES (?, ?) 
			ON CONFLICT (visitor_id, visited_user_id) DO NOTHING;`
		);
		return new Promise((resolve, reject) => {
			try {
				result.run(visitorId, visitedId);
				resolve();
			} catch (e) {
				reject(
					new ProfileVisitRepositoryError(
						`Something went wrong saving profile visit of ${visitorId} to ${visitedId}`,
						e
					)
				);
			}
		});
	}

	public async profileVisitsForUser(userId: string): Promise<string[]> {
		const result = this.db.prepare<string[], ProfileVisit>(
			`SELECT visitor_id FROM profile_visits WHERE visited_user_id = ?`
		);

		return new Promise((resolve, reject) => {
			try {
				const rows = result.all(userId);
				resolve(rows.map((row) => row.visitor_id));
			} catch (e) {
				reject(
					new ProfileVisitRepositoryError(
						`Something went wrong retrieving visits to the profile of ${userId}`,
						e
					)
				);
			}
		});
	}
}
