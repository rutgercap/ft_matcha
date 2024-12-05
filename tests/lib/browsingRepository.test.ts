import { DuplicateEntryError, UserRepository } from '$lib/userRepository';
import type { ProfileWithoutPicturesAndId, UserWithPassword } from '$lib/userRepository';
import { describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { type User } from 'lucia';
import { verify } from '@node-rs/argon2';
import { itWithFixtures } from '../fixtures';
import { Gender, SexualPreference, type ProfileInfo } from '$lib/domain/profile';
import { anyUser } from '../testHelpers';

function anyUserProfile(overrides: Partial<ProfileInfo> = {}): ProfileWithoutPicturesAndId {
	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		gender: faker.helpers.arrayElement(Object.values(Gender)),
		sexualPreference: faker.helpers.arrayElement(Object.values(SexualPreference)),
		biography: faker.lorem.paragraph({ min: 1, max: 25 }),
		tags: [faker.lorem.word(), faker.lorem.word()],
		age: faker.number.int({ min: 18, max: 99 }),
		...overrides
	};
}

describe('BrowsingRepository', () => {
	itWithFixtures('allOtherUsers should render empty list because all profile_is_setup == false', async ({ browsingRepository, savedUserFactory }) => {
		const users = await savedUserFactory(5, {})
		const user = users[0]
		const others = users.slice(1);
		const found = await browsingRepository.allOtherUsers(user.id);
		expect(found.length).toBe(0)
	});

	itWithFixtures('allOtherUsers should render list because profile_is_setup == true', async ({ browsingRepository, savedUserFactory, userRepository }) => {
		const users = await savedUserFactory(5, {})
		for (const u of users) {
			await userRepository.upsertProfileIsSetup(u.id, true)
		}
		const user = users[0]
		const others = users.slice(1);
		const found = await browsingRepository.allOtherUsers(user.id);
		expect(found.length).toBe(4)
		expect(found.every(other => other.id !== user.id)).toBe(true);
	});

	itWithFixtures('should get the count of user like 0 because table is empty', async ({ db , browsingRepository, savedUserFactory }) => {
		const users = await savedUserFactory(1, {})
		const user = users[0]
		const cnt = await browsingRepository.numberOfLiked(user.id);
		expect(cnt).toBe(0)
	});

	itWithFixtures('should get the count of user like', async ({ db , browsingRepository, savedUserFactory }) => {
		const users = await savedUserFactory(5, {})
		const user = users[0]
		const others = users.slice(1);
		const sql = `INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)`
		const query = db.prepare<string, string>(sql)
		for (const oth of others) {
			const res = query.run(oth.id, user.id)
		}

		const cnt = await browsingRepository.numberOfLiked(user.id);
		expect(cnt).toBe(4)
	});


})
