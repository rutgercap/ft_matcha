import { DuplicateEntryError } from '$lib/userRepository';
import { describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { type User } from 'lucia';
import { itWithFixtures } from '../fixtures';
import { Gender, SexualPreference, type ProfileInfo } from '$lib/domain/profile';
import { anyUser } from '../testHelpers';

function anyUserProfile(overrides: Partial<ProfileInfo> = {}): ProfileInfo {
	return {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		gender: faker.helpers.arrayElement(Object.values(Gender)),
		sexualPreference: faker.helpers.arrayElement(Object.values(SexualPreference)),
		biography: faker.lorem.paragraph({ min: 1, max: 25 }),
		tags: [faker.lorem.word(), faker.lorem.word()],
		uploadedPictures: [],
		...overrides
	};
}

describe('UserRepository', () => {
	itWithFixtures('should be able to create a new user', async ({ userRepository }) => {
		const password = faker.internet.password();
		const user = anyUser({ profileIsSetup: false });

		const response = await userRepository.createUser(user, password);
		const found = await userRepository.user(response.id);

		expect(found).toMatchObject(user);
	});

	itWithFixtures('should be able to set user profile', async ({ userRepository, savedUser }) => {
		const userProfile = anyUserProfile();

		await userRepository.upsertProfileInfo(savedUser.id, userProfile);

		const found = await userRepository.profileInfoFor(savedUser.id);
		// ignoring the image properties that are tested in the imageRepository
		expect(found).toEqual(
			expect.objectContaining({
				firstName: userProfile.firstName,
				lastName: userProfile.lastName,
				gender: userProfile.gender,
				sexualPreference: userProfile.sexualPreference,
				biography: userProfile.biography,
				tags: userProfile.tags
			})
		);
	});

	itWithFixtures('should be able to update user profile', async ({ userRepository }) => {
		const userProfile = anyUserProfile();
		const user = anyUser({ profileIsSetup: true });
		await userRepository.createUser(user, faker.internet.password());
		await userRepository.upsertProfileInfo(user.id, userProfile);

		userProfile.biography = 'I am a new person';
		await userRepository.upsertProfileInfo(user.id, userProfile);

		const found = await userRepository.profileInfoFor(user.id);

		// ignoring the image properties that are tested in the imageRepository
		expect(found).toEqual(
			expect.objectContaining({
				firstName: userProfile.firstName,
				lastName: userProfile.lastName,
				gender: userProfile.gender,
				sexualPreference: userProfile.sexualPreference,
				biography: userProfile.biography,
				tags: userProfile.tags
			})
		);
	});

	itWithFixtures('Setting new tags does not double tags', async ({ userRepository }) => {
		const userProfile = anyUserProfile();
		const user = anyUser({ profileIsSetup: true });
		await userRepository.createUser(user, faker.internet.password());

		userProfile.tags = ['tag1000'];
		await userRepository.upsertProfileInfo(user.id, userProfile);

		const found = await userRepository.profileInfoFor(user.id);
		// ignoring the image properties that are tested in the imageRepository
		expect(found).toEqual(
			expect.objectContaining({
				firstName: userProfile.firstName,
				lastName: userProfile.lastName,
				gender: userProfile.gender,
				sexualPreference: userProfile.sexualPreference,
				biography: userProfile.biography,
				tags: userProfile.tags
			})
		);
	});

	itWithFixtures(
		'Setting user profile sets profile_is_setup to true',
		async ({ userRepository }) => {
			const user = anyUser({ profileIsSetup: false });
			await userRepository.createUser(user, faker.internet.password());

			let found = (await userRepository.user(user.id)) as User;
			expect(found.profileIsSetup).toBe(false);

			const userProfile = anyUserProfile();
			await userRepository.upsertProfileInfo(user.id, userProfile);

			found = (await userRepository.user(user.id)) as User;
			expect(found.profileIsSetup).toBe(true);
		}
	);

	itWithFixtures(
		'Can get all other user profiles',
		async ({ userRepository, savedUserFactory }) => {
			const profile = anyUserProfile();
			const users = await savedUserFactory(3, {});
			const thisUser = users[0];
			const others = users.slice(1);
			others.forEach(async (user) => await userRepository.upsertProfileInfo(user.id, profile));

			const found = await userRepository.allOtherUsers(thisUser.id);

			expect(found).toHaveLength(others.length);
			expect(found).toEqual(expect.arrayContaining(others.map((user) => user.id)));
		}
	);

	itWithFixtures('Should be able to fetch user by username', async ({ userRepository }) => {
		const password = faker.internet.password();
		const user = anyUser({ profileIsSetup: false });
		await userRepository.createUser(user, password);

		const found = await userRepository.userByUsername(user.username);

		expect(found).toMatchObject(user);
	});

	itWithFixtures('should return null if user does not exist', async ({ userRepository }) => {
		const response = await userRepository.user(faker.string.uuid());

		expect(response).toBeNull();
	});

	itWithFixtures(
		'should return DuplicateEntryError if username taken',
		async ({ userRepository }) => {
			const userName = faker.internet.userName();
			const password = faker.internet.password();
			const userOne = anyUser({ username: userName, profileIsSetup: false });
			const userTwo = anyUser({ username: userName, profileIsSetup: false });
			await userRepository.createUser(userOne, password);

			try {
				await userRepository.createUser(userTwo, password);
			} catch (e) {
				expect(e).toBeInstanceOf(DuplicateEntryError);
				expect((e as DuplicateEntryError).entity).toBe('username');
			}
		}
	);
});
