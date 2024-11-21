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

	public async flipLikeUser(userId: string, likedUserId: string): Promise<boolean> {
		const didUserAlreadyLike = this.db.prepare<[string, string], { id: number }>(
			'SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?'
		);
		const insertLike = this.db.prepare<[string, string]>(
			'INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)'
		);
		const didOtherUserLike = this.db.prepare<[string, string], string>(
			'SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?'
		);
		const insertMatch = this.db.prepare<[string, string]>(
			`INSERT INTO connections (user_id_1, user_id_2, status) 
				VALUES (?, ?, 'MATCHED')
				ON CONFLICT (user_id_1, user_id_2)
				DO UPDATE SET status = 'MATCHED';`
		);
		const setUnmatched = this.db.prepare<[string, string, string, string]>(
			"UPDATE connections SET status = 'UNMATCHED' WHERE  (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?);"
		);
		const deleteLike = this.db.prepare<number>('DELETE FROM likes WHERE id = ?');
		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction((userId: string, likedUserId: string) => {
					const maybeLikeId = didUserAlreadyLike.get(userId, likedUserId);
					if (!maybeLikeId) {
						insertLike.run(userId, likedUserId);
						const otherUserLike = didOtherUserLike.run(likedUserId, userId);
						if (otherUserLike) {
							insertMatch.run(userId, likedUserId);
						}
						return true;
					} else {
						deleteLike.run(maybeLikeId.id);
						setUnmatched.run(userId, likedUserId, likedUserId, userId);
						return false;
					}
				});
				const isLiked = transaction(userId, likedUserId);
				resolve(isLiked);
			} catch (e) {
				console.log(e);
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
				reject(new ConnectionRepositoryError('Failed to fetch users who liked user'));
			}
		});
	}

	public async isLikedBy(targetId: string, userId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			try {
				const result = this.db
					.prepare<
						[string, string],
						{ liked_id: string }
					>('SELECT liked_id FROM likes WHERE liker_id = ? AND liked_id = ?')
					.get(userId, targetId);
				if (!result) {
					resolve(false);
				}
				resolve(true);
			} catch (e) {
				reject(new ConnectionRepositoryError('Failed to check if user is liked by another user'));
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
