import { getDb } from '$lib/database/database';
import { UserRepository } from '$lib/userRepository';
import { ImageRepository } from '$lib/imageRepository';
import { EmailRepository } from '$lib/emailRepository';
import { type Handle } from '@sveltejs/kit';
import { lucia } from '$lib/auth';

let IMAGE_FOLDER = './profile-pictures'

export const handle: Handle = async ({ event, resolve }) => {
	const db = getDb();
	const imageRepo = new ImageRepository(IMAGE_FOLDER, db)
	event.locals.userRepository = new UserRepository(db, imageRepo);
	event.locals.emailRepository = new EmailRepository()

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
