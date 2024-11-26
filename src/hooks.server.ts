import { getDb } from '$lib/database/database';
import { UserRepository } from '$lib/userRepository';
import { ImageRepository } from '$lib/imageRepository';
import { EmailRepository, getTransporter } from '$lib/emailRepository';
import { type Handle } from '@sveltejs/kit';
import { lucia } from '$lib/auth';
import { IMAGE_FOLDER } from '$env/static/private';
import { ProfileVisitRepository } from '$lib/profileVisitRepository';
import { BrowsingRepository } from '$lib/browsingRepository';
import { ConnectionRepository } from '$lib/connectionRepository';

export const handle: Handle = async ({ event, resolve }) => {
	const db = getDb();
	const transporter = getTransporter();
	const imageRepo = new ImageRepository(IMAGE_FOLDER, db);
	event.locals.userRepository = new UserRepository(db, imageRepo);
	event.locals.emailRepository = new EmailRepository(db, transporter);
	event.locals.profileVisitRepository = new ProfileVisitRepository(db);
	event.locals.browsingRepository = new BrowsingRepository(db);
	event.locals.connectionRepository = new ConnectionRepository(db);

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
