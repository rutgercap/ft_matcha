import { Lucia, type Adapter } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { getDb } from './database/database';
import type { Database } from 'better-sqlite3';


export function adapter(db: Database) {
	const adapter = new BetterSqlite3Adapter(db, {
		user: 'users',
		session: 'sessions'
	});
	return adapter;
}


export function createLuciaInstance(luciaAdapter: Adapter) {
	return new Lucia(luciaAdapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes: DatabaseUserAttributes) => {
			return {
				username: attributes.username,
				profileIsSetup: attributes.profile_is_setup === 0 ? false : true,
				email: attributes.email,
				emailIsSetup: attributes.email_is_setup === 0 ? false : true,
				passwordIsSet: attributes.password_is_set === 0 ? false : true
			};
		}
	});
}

export const lucia = createLuciaInstance(adapter(getDb()));


export interface DatabaseUserAttributes {
	username: string;
	profile_is_setup: number;
	email: string;
	email_is_setup: number;
	password_is_set: number;
}


declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}