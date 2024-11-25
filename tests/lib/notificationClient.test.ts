import { describe } from 'vitest';
import { itWithFixtures } from '../fixtures';
import { lucia } from '$lib/auth';
import { NotificationClient } from '$lib/notificationClient';

describe.skip('NotificationClient', () => {
	itWithFixtures(
		'Should be able to authenticate',
		async ({ notificationClient, savedUserFactory }) => {
			const users = await savedUserFactory(1, {});
			const session = await lucia.createSession(users[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			// await notificationClient.authenticate(sessionCookie.value);
		}
	);
});
