import { getDb } from '$lib/database/database';
import { UserRepository } from '$lib/userRepository';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const db = await getDb();

	event.locals.userRepository = new UserRepository(db);
	return resolve(event);
};
