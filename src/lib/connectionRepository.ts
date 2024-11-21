import type { Database } from 'better-sqlite3';
import type { MatchStatus } from './domain/match';

export class ConnectionRepositoryError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConnectionRepositoryError';
	}
}

export class ConnectionRepository {
	constructor(private db: Database) {}

	public async likeUser(userId: string, likedUserId: string): Promise<void> {
		const likeUserStatement = this.db.prepare<[string, string]>(
			'INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)'
		);
		const getOtherLike = this.db.prepare<[string, string], string>(
			'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?'
		);
		const insertMatch = this.db.prepare<[string, string]>(
			"INSERT INTO connections (user_id_1, user_id_2, status) VALUES (?, ?, 'MATCHED')"
		);
		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction((userId: string, likedUserId: string) => {
					likeUserStatement.run(userId, likedUserId);
					const like = getOtherLike.run(likedUserId, userId);
					if (like) {
						insertMatch.run(userId, likedUserId);
					}
				});
				transaction(userId, likedUserId);
				resolve();
			} catch (e) {
				reject(new ConnectionRepositoryError('Failed to like user'));
			}
		});
	}

	public async userLikedBy(id: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, { liker_id: string }>('SELECT liker_id FROM likes WHERE liked_id = ?')
					.all(id);
				resolve(result.map((row) => row.liker_id));
			} catch (e) {
				console.log(e);
				reject(new ConnectionRepositoryError('Failed to fetch users who liked user'));
			}
		});
	}

	public async likes(id: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<string, { liked_id: string }>('SELECT liked_id FROM likes WHERE liker_id = ?')
					.all(id);
				resolve(result.map((row) => row.liked_id));
			} catch (e) {
				reject(new ConnectionRepositoryError('Failed to fetch likes'));
			}
		});
	}

	public async matchStatus(userId: string, otherUserId: string): Promise<MatchStatus | null> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						[string, string],
						{ status: string }
					>('SELECT status FROM connections WHERE user_id_1 = ? AND user_id_2 = ?')
					.get(userId, otherUserId);
				if (!result) {
					resolve(null);
				}
				resolve({
					userOne: userId,
					userTwo: otherUserId,
					status: result!.status as 'MATCH' | 'BLOCKED'
				});
			} catch (e) {
				reject(new ConnectionRepositoryError('Failed to fetch match status'));
			}
		});
	}
}
