import { describe, expect } from 'vitest';
import { DEFAULT_PASSWORD, itWithFixtures } from '../../fixtures';
import { AuthServiceError } from '$lib/server/authService';
import { Cookie } from 'lucia';

describe('AuthService', () => {
	itWithFixtures(
		'should throw an error if the username does not exist',
		async ({ authService }) => {
			await expect(authService.signIn('nonexistent', 'password')).rejects.toThrow(AuthServiceError);

			const error = await authService.signIn('nonexistent', 'password').catch((err) => err);
			expect(error).toHaveProperty('type', 'INCORRECT_USERNAME_OR_PASSWORD');
		}
	);

    itWithFixtures(
		'should return session cookie if the user exists', 
		async ({ authService, savedUserFactory }) => {
            const users = await savedUserFactory(1);
            const user = users[0];

			const cookie = await authService.signIn(user.username, DEFAULT_PASSWORD);

            expect(cookie).instanceOf(Cookie);
		}
	);
});
