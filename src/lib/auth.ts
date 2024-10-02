import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { getDb } from './database/database';

const db = getDb();

const adapter = new BetterSqlite3Adapter(db, {
	user: 'users',
	session: 'sessions'
});

interface DatabaseUserAttributes {
	username: string;
	profile_is_setup: number;
	email: string;
}

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			profileIsSetup: attributes.profile_is_setup === 0 ? false : true,
			email: attributes.email
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}
