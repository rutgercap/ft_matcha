import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import { faker } from '@faker-js/faker';
import { hash } from '@node-rs/argon2';
import type { User } from 'Lucia';
import type { ProfileInfo } from '../domain/profile';
import { Gender, SexualPreference } from '../domain/profile';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2); // Get arguments after the `node` and script name
const numUsersArg = args.find((arg) => arg.startsWith('--num='));

let numUsers = 10; // Default value
if (numUsersArg) {
	numUsers = parseInt(numUsersArg.split('=')[1], 10);
	if (isNaN(numUsers)) {
		console.error('Invalid number of users provided');
		process.exit(1);
	}
}

async function copyFile(sourcePath: string, destinationPath: string): Promise<void> {
	try {
		// Validate that the source file exists
		if (!fs.existsSync(sourcePath)) {
			throw new Error(`Source file does not exist: ${sourcePath}`);
		}

		// Ensure the destination directory exists, create it if not
		const destinationDir = path.dirname(destinationPath);
		if (!fs.existsSync(destinationDir)) {
			fs.mkdirSync(destinationDir, { recursive: true });
		}

		// Read the file and write to the destination
		const data = await fs.promises.readFile(sourcePath);
		await fs.promises.writeFile(destinationPath, data);

		console.log(`File successfully copied from ${sourcePath} to ${destinationPath}`);
	} catch (error) {
		console.error(`Error copying file: ${error.message}`);
	}
}

async function anyUser(password: string, overrides: Partial<User> = {}): User {
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const userId = generateIdFromEntropySize(10);
	return {
		id: userId,
		email: faker.internet.email(),
		username: faker.internet.userName(),
		profileIsSetup: 1,
		emailIsSetup: 1,
		passwordHash: passwordHash,
		...overrides
	};
}

function anyUserProfile(overrides: Partial<ProfileInfo> = {}): ProfileInfo {
	const gender = faker.helpers.arrayElement(Object.values(Gender));

	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		gender: gender,
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

async function createUsers(n: number) {
	const db = getDb(DATABASE_PATH);

	const user_sql = db.prepare(`INSERT INTO
		users (id, email, username, profile_is_setup, email_is_setup, password_hash)
		VALUES (@id, @email, @username, @profileIsSetup, @emailIsSetup, @passwordHash)`);

	const user_profile_sql = db.prepare(`INSERT INTO
			profile_info (user_id, first_name, last_name, gender, sexual_preference, biography)
			VALUES (@user_id, @firstName, @lastName, @gender, @sexualPreference, @biography)`);

	const user_tag_sql = db.prepare(`INSERT INTO
				tags (id, user_id, tag)
				VALUES (@id, @user_id, @tag)`);
	const user_picture_sql = db.prepare(`INSERT INTO
				profile_pictures (id, user_id, image_order)
				VALUES (@id, @user_id, @order)`);

	let users: User[] = [];
	let user_profile: ProfileInfo[] = [];
	let user_tags: any[] = [];
	let user_picture: any[] = [];

	for (let i = 0; i < n; i++) {
		users[i] = await anyUser('123456789'); // setting same password for every users so we can access there profiles easily
		user_profile[i] = anyUserProfile({ user_id: users[i].id });
		let tmp_imgid = generateIdFromEntropySize(10);
		user_picture[i] = { id: tmp_imgid, user_id: users[i].id, order: 0 };
		if (user_profile[i].gender === 'man') {
			await copyFile(
				'static/profile_pictures/male_robot.jpg',
				'profile-pictures/' + tmp_imgid + '.jpg'
			);
		} else if (user_profile[i].gender === 'woman') {
			await copyFile(
				'static/profile_pictures/female_robot.jpg',
				'profile-pictures/' + tmp_imgid + '.jpg'
			);
		} else {
			await copyFile(
				'static/profile_pictures/other_robot.jpg',
				'profile-pictures/' + tmp_imgid + '.jpg'
			);
		}

		for (let j = 0; j < user_profile[i].tags.length; j++) {
			let tmp = generateIdFromEntropySize(10);
			user_tags.push({ id: tmp, user_id: users[i].id, tag: user_profile[i].tags[j] });
		}
	}
	const insertManyUser = db.transaction((users: User[]) => {
		for (const u of users) user_sql.run(u);
	});
	const insertManyProfile = db.transaction((users_profle: ProfileInfo[]) => {
		for (const u of users_profle) user_profile_sql.run(u);
	});
	const insertManyTag = db.transaction((user_tags: any[]) => {
		for (const u of user_tags) user_tag_sql.run(u);
	});
	const insertManyPicture = db.transaction((user_picture: any[]) => {
		for (const u of user_picture) user_picture_sql.run(u);
	});

	insertManyUser(users);
	insertManyProfile(user_profile);
	insertManyTag(user_tags);
	insertManyPicture(user_picture);
}

// pnpm run script:fake_users
await createUsers(numUsers);
