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
	email_is_setup: number;
	password_is_set: number;
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
			email: attributes.email,
			emailIsSetup: attributes.email_is_setup === 0 ? false : true,
			passwordIsSet: attributes.password_is_set === 0 ? false : true
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}
