import runMigrations, { MIGRATIONS_PATH } from '$lib/database/database';
import type { UserRepository as UserRepositoryType } from '$lib/userRepository';
import path from 'path';
import { UserRepository } from '$lib/userRepository';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import temp from 'temp';
import { it } from 'vitest';
import type { ImageRepository as ImageRepositoryType } from '$lib/imageRepository';
import { EmailRepository, type EmailRepository as EmailRepositoryType } from '$lib/emailRepository';
import { ImageRepository } from '$lib/imageRepository';
import type { User } from 'lucia';
import { anyUser } from './testHelpers';
import { ProfileVisitRepository } from '$lib/profileVisitRepository';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface MyFixtures {
	db: DatabaseType;
	userRepository: UserRepositoryType;
	imageRepository: ImageRepositoryType;
	emailRepository: EmailRepositoryType;
	savedUser: User;
	profileVisitRepository: ProfileVisitRepository;
	savedUserFactory: (n: number, overrides: Partial<User>) => Promise<User[]>;
	image: Buffer;
}

const IMAGE_FOLDER = './tests/lib/pictures-repo-test';

export const itWithFixtures = it.extend<MyFixtures>({
	db: async ({}, use) => {
		const tempMigrationsDir = temp.mkdirSync('migrations');
		const db = new Database(':memory:');
		await runMigrations(db, MIGRATIONS_PATH, path.join(tempMigrationsDir, 'migrations.lock'), true);
		await use(db);
		temp.cleanupSync();
	},
	imageRepository: async ({ db }, use) => {
		const tempMigrationsDir = IMAGE_FOLDER;
		await use(new ImageRepository(tempMigrationsDir, db));
		temp.cleanupSync();
	},
	userRepository: async ({ db, imageRepository }, use) => {
		await use(new UserRepository(db, imageRepository));
	},

	emailRepository: async ({ db }, use) => {
		await use(new EmailRepository(db));
	},

	savedUser: async ({ userRepository }, use) => {
		const user = anyUser();
		await userRepository.createUser(user, 'password');
		await use(user);
	},
	profileVisitRepository: async ({ db }, use) => {
		await use(new ProfileVisitRepository(db));
	},
	savedUserFactory: async ({ userRepository }, use) => {
		const createUser = async (n: number, overrides: Partial<User> = {}) => {
			return Promise.all(Array.from({ length: n }, async (_, i) => {
				const user = anyUser(overrides);
				return await userRepository.createUser(user, 'password');
			}));
		};
		use(createUser);
	},
	image: async ({}, use) => {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		const imagePath = path.join(__dirname, 'test-image.jpg');
		const image = fs.readFileSync(imagePath);
		use(image);
	}
});
