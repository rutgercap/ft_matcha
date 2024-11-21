import { describe, expect } from 'vitest';
import { itWithFixtures } from '../fixtures';

describe('ConnectionRepository', () => {
	itWithFixtures(
		'Should be able to like a user',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);

			const userLikes = await connectionRepository.likes(users[0].id);
			expect(userLikes).toEqual([users[1].id]);
			const userLikedBy = await connectionRepository.userLikedBy(users[1].id);
			expect(userLikedBy).toEqual([users[0].id]);
		}
	);

	itWithFixtures(
		'Should be able to unlike a user',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[0].id, users[1].id);

			const userLikes = await connectionRepository.likes(users[0].id);
			expect(userLikes).toEqual([]);
		}
	);

	itWithFixtures(
		'Should be able to fetch if user is liked by another user',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			const before = await connectionRepository.isLikedBy(users[1].id, users[0].id);
			expect(before).toBe(false);

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			const found = await connectionRepository.isLikedBy(users[1].id, users[0].id);
			expect(found).toBe(true);
		}
	);

	itWithFixtures(
		'Two users liking each other should result in match',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			const before = await connectionRepository.matchStatus(users[0].id, users[1].id);
			expect(before).toBeNull();

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[1].id, users[0].id);

			const matchStatus = await connectionRepository.matchStatus(users[0].id, users[1].id);
			expect(matchStatus!.status).toEqual('MATCHED');
		}
	);

	itWithFixtures(
		'unliking a match should remove the match',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[1].id, users[0].id);
			await connectionRepository.flipLikeUser(users[0].id, users[1].id);

			const matchStatus = await connectionRepository.matchStatus(users[0].id, users[1].id);
			expect(matchStatus!.status).toEqual('UNMATCHED');
		}
	);

	itWithFixtures(
		're-liking a lost match should add the match back',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[1].id, users[0].id);
			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[0].id, users[1].id);

			const matchStatus = await connectionRepository.matchStatus(users[0].id, users[1].id);
			expect(matchStatus!.status).toEqual('MATCHED');
		}
	);
});
