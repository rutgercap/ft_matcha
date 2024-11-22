import { describe, expect } from 'vitest';
import { itWithFixtures } from '../fixtures';
import type { MatchStatus } from '$lib/domain/match';

describe('ConnectionRepository', () => {
	itWithFixtures(
		'Should be able to like a user',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser]= await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);

			const userLikes = await connectionRepository.likes(currentUser.id);
			expect(userLikes).toEqual([targetUser.id]);
			const userLikedBy = await connectionRepository.userLikedBy(targetUser.id);
			expect(userLikedBy).toEqual([currentUser.id]);
		}
	);

	itWithFixtures(
		'One sided like should not result in match',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser]= await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);

			const matchStatus = await connectionRepository.matchStatus(currentUser.id, targetUser.id);
			expect(matchStatus).toBeNull();
		}
	);

	itWithFixtures(
		'Should be able to unlike a user',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser]= await savedUserFactory(2, {});

			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);
			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);

			const userLikes = await connectionRepository.likes(currentUser.id);
			expect(userLikes).toEqual([]);
			const userLikedBy = await connectionRepository.userLikedBy(targetUser.id);
			expect(userLikedBy).toEqual([]);
		}
	);

	itWithFixtures(
		'Should be able to fetch if user is liked by another user',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser]= await savedUserFactory(2, {});

			const before = await connectionRepository.isLikedBy(currentUser.id, targetUser.id);
			expect(before).toBe(false);

			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);
			const found = await connectionRepository.isLikedBy(currentUser.id, targetUser.id);
			expect(found).toBe(true);
		}
	);

	itWithFixtures(
		'Two users liking each other should result in match',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser]= await savedUserFactory(2, {});

			const before = await connectionRepository.matchStatus(currentUser.id, targetUser.id);
			expect(before).toBeNull();

			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);
			await connectionRepository.flipLikeUser(targetUser.id, currentUser.id);

			const matchStatus = await connectionRepository.matchStatus(currentUser.id, targetUser.id);
			expect(matchStatus!.status).toEqual('MATCHED');
			// Should not matter which id is checked
			const doubleCheck = await connectionRepository.matchStatus(targetUser.id, currentUser.id);
			expect(doubleCheck!.status).toEqual('MATCHED');
		}
	);

	itWithFixtures(
		'Should be able to get all matches for a user ids should be in order of user requesting their matches',
		async ({ connectionRepository, savedUserFactory }) => {
			const users = await savedUserFactory(2, {});
			await connectionRepository.flipLikeUser(users[0].id, users[1].id);
			await connectionRepository.flipLikeUser(users[1].id, users[0].id);

			const matches = await connectionRepository.matchesForUser(users[0].id);

			const expected: MatchStatus = {
				userOne: users[0].id,
				userTwo: users[1].id,
				status: 'MATCHED'
			};
			expect(matches).toStrictEqual([expected]);
		}
	);

	itWithFixtures(
		'matches for user does not return unmatched matches',
		async ({ connectionRepository, savedUserFactory }) => {
			const [currentUser, targetUser ]= await savedUserFactory(2, {});
			await connectionRepository.flipLikeUser(currentUser.id, targetUser.id);
			await connectionRepository.flipLikeUser(targetUser.id, currentUser.id);
			await connectionRepository.flipLikeUser(targetUser.id, currentUser.id);

			const currentUserMatches = await connectionRepository.matchesForUser(currentUser.id);
			expect(currentUserMatches).toStrictEqual([]);
			// Should not matter which id is checked
			const targetUserMatches = await connectionRepository.matchesForUser(targetUser.id);
			expect(targetUserMatches).toStrictEqual([]);
		}
	);

	itWithFixtures(
		'unliking a user should remove the match',
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
