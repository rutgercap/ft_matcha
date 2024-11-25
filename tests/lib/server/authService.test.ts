import { describe } from 'vitest';
import { DEFAULT_PASSWORD, itWithFixtures } from '../../fixtures';

describe('authService', () => {
	itWithFixtures('login', async ({ authService, userRepository, savedUser, savedUserFactory }) => {
		const users = await savedUserFactory(1);
		const user = users[0];

		authService.login(user.username, DEFAULT_PASSWORD);
	});
});
