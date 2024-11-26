import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import { faker } from '@faker-js/faker';
import type { User } from 'Lucia';
import type { ProfileInfo } from '../domain/profile';
import { Gender, SexualPreference } from '../domain/profile';

function anyUser(overrides: Partial<User> = {}): User {
	const userId = generateIdFromEntropySize(10);
	return {
		id: userId,
		email: faker.internet.email(),
		username: faker.internet.userName(),
		profileIsSetup: true,
		emailIsSetup:true,
		...overrides
	};
}

function anyUserProfile(overrides: Partial<ProfileInfo> = {}): ProfileInfo {
	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		gender: faker.helpers.arrayElement(Object.values(Gender)),
		sexualPreference: faker.helpers.arrayElement(Object.values(SexualPreference)),
		biography: faker.lorem.paragraph({ min: 1, max: 25 }),
		tags: [faker.lorem.word(), faker.lorem.word()],
		pictures: [null, null, null, null, null],
		pictures_filenames: [],
		...overrides
	};
}


export const DATABASE_PATH = 'database/database.db';
// singleton instance
let db: DatabaseType | null = null;

function getDb(path: string = DATABASE_PATH): DatabaseType {
	if (!db) {
		db = Database(path);
	}
	return db;
}

function createUsers(n:number) {
	const db = getDb(DATABASE_PATH)




	console.log('bonjour depuis le script de creation d\'utilisateurs')
}


createUsers(0)
