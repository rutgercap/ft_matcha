import type { Database } from 'better-sqlite3';
import { averages, fameRatingWeights, scoreWeights} from './domain/browse';


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

	public async numberOfMatch(userId: string) {
		try {
			const sql = `SELECT count() AS cnt, l1.liked_id AS liked1, l1.liker_id AS liker1, l2.liked_id AS liked2, l2.liker_id AS liker2 FROM likes AS l1, likes AS l2
				WHERE liked1 = ? AND liker2 = ? AND liker1 = liked2`
			const query = this.db.prepare<string, string>(sql);
			const result = query.get(userId, userId);
			return result.cnt;
		} catch (e) {
			throw new BrowsingRepositoryError('an error occured trying to get the number of like for user:' + userId, e)
		}

	}

	public async numberOfVisited(userId: string) {
		try {
			const sql = `
				SELECT count(visited_user_id) AS cnt FROM profile_visits WHERE visited_user_id = ?`;
			const query = this.db.prepare<string>(sql);
			const result = query.get(userId);
			return result.cnt;
		} catch (e) {
			throw new BrowsingRepositoryError('an error occured trying to get the number of visits for user:' + userId, e)
		}

	}


	public async fameRatingFor(userId: string): Promise<number> {
		try {
			const views = await this.numberOfVisited(userId);
			const likes = await this.numberOfLiked(userId);
			const match = await this.numberOfMatch(userId)

			const a = fameRatingWeights.views
			const b = fameRatingWeights.likes
			const c = fameRatingWeights.match

			const averageViews = averages.average_views
			const averageLikes = averages.average_likes
			const averageMatch = averages.average_match

			const fameRating = a * (views / averageViews) + b * (likes / averageLikes) + c * (match / averageMatch)
			return fameRating
		} catch (e) {
			throw new BrowsingRepositoryError('Error occurs trying to compute fame Rating for user' + userId, e);
		}
	}

	public async commonTagsStats(userId:string, otherUserId: string): Promise<any> {
		try {
			const sql = `SELECT * FROM tags WHERE user_id = ? OR user_id = ?`

			const query = this.db.prepare<string, string>(sql)

			const res = query.all(userId, otherUserId)


			const user1tags = res.filter(u => u.user_id == userId)
			const user2tags = res.filter(u => u.user_id == otherUserId)

			let cnt = 0;

			user1tags.forEach((u) => {
				if (user2tags.some(u2 => u.tag === u2.tag))
					cnt += 1
			})

			return {
				commonTag: cnt,
				ntagsUser1: user1tags.length,
				ntagsUser2: user2tags.length
			}

		} catch (e) {
			console.log(e)
			throw new BrowsingRepositoryError('Error occurs trying to compute common tag for ' + userId, e);
		}
	}

	public async scoring(userId: string, userToScoreId: string) {
		const fameWeight = scoreWeights.fameRating
		const commonTagWeight = scoreWeights.tags
		const distWeight = scoreWeights.distance

		const fameRate = await this.fameRatingFor(userToScoreId);
		const commonTags = await this.commonTagsStats(userId, userToScoreId);
		const tagStat = commonTags.commonTag / (commonTags.ntagsUser1 + commonTags.ntagsUser2)

		const distance = 0 // TODO update for distance metric to be relevant

		return (fameWeight * fameRate) + (tagStat * commonTagWeight) + (distance * distWeight)

	}
}

export { BrowsingRepository, BrowsingRepositoryError };
