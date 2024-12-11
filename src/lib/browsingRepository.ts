import type { Database } from 'better-sqlite3';
import { averages, fameRatingWeights, scoreWeights } from './domain/browse';
import type { ReducedProfileInfo, CommonTagStats, BrowsingInfo } from './domain/browse';
import { SexualPreference } from './domain/profile';

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

	public browsingInfoFor(id: string): Promise<ReducedProfileInfo> {
		return new Promise((resolve, reject) => {
			try {
				const sql = `
					SELECT u.id, u.username, p.biography, p.gender, p.age, p.sexual_preference, l.longitude, l.latitude
					FROM users AS u
					INNER JOIN profile_info AS p ON u.id = p.user_id
					INNER JOIN location AS l ON u.id = l.user_id
					WHERE u.id = ?
				`;

				const res = this.db.prepare<string>(sql).get(id);
				resolve(res);
			} catch (error) {
				reject(
					new BrowsingRepositoryError(
						'Something went wrong getting browsing infos for user id: ' + id,
						error
					)
				);
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

	public async commonTagsStats(userId:string, otherUserId: string): Promise<CommonTagStats> {
		try {
			const sql = `SELECT * FROM tags WHERE user_id = ? OR user_id = ?`

			const query = this.db.prepare<string, string>(sql)

			const res = query.all(userId, otherUserId)


			const user1tags = res.filter(u => u.user_id == userId)
			const user2tags = res.filter(u => u.user_id == otherUserId)

			let cnt = 0;

			user1tags.forEach((u: any) => {
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

	public async scoring(userId: string, userToScoreId: string, distance: number, fameRatingPreComp: number | null = null) {
		const fameWeight = scoreWeights.fameRating
		const commonTagWeight = scoreWeights.tags
		const distWeight = scoreWeights.distance

		let fameRate = 0
		if (!fameRatingPreComp) {
			fameRate = await this.fameRatingFor(userToScoreId);
		} else {
			fameRate = fameRatingPreComp
		}
		const commonTags = await this.commonTagsStats(userId, userToScoreId);
		const tagStat = commonTags.commonTag / (commonTags.ntagsUser1 + commonTags.ntagsUser2)

		const dist = distance // TODO update for distance metric to be relevant

		return Number(((fameWeight * fameRate) + (tagStat * commonTagWeight) + (1/(1+dist) * distWeight)).toFixed(4))

	}

	public async fameRateAll(users: BrowsingInfo[]) {
		try {
			for (const u of users) {
				u.fameRate = await this.fameRatingFor(u.id)
			}
			return users
		} catch (error) {
			throw new BrowsingRepositoryError('Error occurs trying to compute fameRating for every users', error)
		}
	}

	public async scoreThemAll(userId: string, users: BrowsingInfo[]) {
		try {
			for (const u of users) {
				u.score = await this.scoring(userId, u.id, u.localisation, u.fameRate)
			}
			return users
		} catch (error) {
			console.log('in scoreThemAll', error)
			throw new BrowsingRepositoryError('Error occurs trying to compute score for every users', error)
		}
	}

	public async sort(users: BrowsingInfo[]) {
		try {
			const compare = (a: any, b: any) => {
				return b.score - a.score; // Sort by age in ascending order
			};
			users = users.sort(compare)
			return users
		} catch (error) {
			throw new BrowsingRepositoryError('Error occurs trying to sort the list by score', error)
		}
	}

	public async preFilter(userSexualPreference:string, users: BrowsingInfo[]) {
		try {
			if (userSexualPreference === 'all')
					return users
			let test = 'other';
			if (userSexualPreference === 'men')
				test = 'man'
			else if (userSexualPreference === 'women')
				test = 'woman'
			return users.filter((u) => (u.gender === test))
		} catch (error) {
			throw new BrowsingRepositoryError('Error occurs trying to pre filter the list by score', error)
		}
	}

	public async distanceAll(userCoordinate: BrowsingInfo, usersCoordinates: BrowsingInfo[]) : Promise<ReducedProfileInfo[]> {
		for (const other of usersCoordinates) {
			other.localisation = (await this.haversineDistance(userCoordinate.latitude,
				userCoordinate.longitude,
				other.latitude,
				other.longitude
			)).toFixed(2)
		}
		return usersCoordinates
	}

	public async haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) : Promise<number> {
		try {
			const toRadians = (degrees:number) => (degrees * Math.PI) / 180;

			// Convert degrees to radians
			const lat1Rad = toRadians(lat1);
			const lon1Rad = toRadians(lon1);
			const lat2Rad = toRadians(lat2);
			const lon2Rad = toRadians(lon2);

			// Radius of Earth in kilometers (mean radius)
			const R = 6371;

			// Differences in coordinates
			const dLat = lat2Rad - lat1Rad;
			const dLon = lon2Rad - lon1Rad;

			// Haversine formula
			const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;

			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			// Distance in kilometers
			return R * c;
		} catch (error) {
			console.log('harvessing error -->', error)
			throw new BrowsingRepositoryError('Error occurs trying to compute harvesing distance', error)
		}
	  }
}

export { BrowsingRepository, BrowsingRepositoryError };
