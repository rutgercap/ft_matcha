import { describe, expect } from 'vitest';
import { itWithFixtures } from '../fixtures';


describe('ConnectionRepository', () => {
	itWithFixtures('Should be able to like a user', async ({ connectionRepository, savedUserFactory }) => {
		const users = await savedUserFactory(2, {});

		await connectionRepository.likeUser(users[0].id, users[1].id);

		const userLikes = await connectionRepository.likes(users[0].id);
		expect(userLikes).toEqual([users[1].id]);
		const userLikedBy = await connectionRepository.userLikedBy(users[1].id);
		expect(userLikedBy).toEqual([users[0].id]);
	});

	itWithFixtures('Two users liking each other should result in match', async ({ connectionRepository, savedUserFactory }) => {
		const users = await savedUserFactory(2, {});

		const before = await connectionRepository.matchStatus(users[0].id, users[1].id)
		expect(before).toBeNull();

		await connectionRepository.likeUser(users[0].id, users[1].id);
		await connectionRepository.likeUser(users[1].id, users[0].id);

		const matchStatus = await connectionRepository.matchStatus(users[0].id, users[1].id);
		expect(matchStatus!.status).toEqual('MATCHED');
	});
});
