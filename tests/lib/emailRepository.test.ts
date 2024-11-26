import { DuplicateEntryError } from '$lib/userRepository';
import { describe, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { type User } from 'lucia';
import { itWithFixtures } from '../fixtures';
import { Gender, SexualPreference, type ProfileInfo } from '$lib/domain/profile';
import { anyUser } from '../testHelpers';

describe('EmailRepository', () => {
	itWithFixtures('should be able update email_is_setup flag', async ({ userRepository, emailRepository }) => {

		const user = anyUser({ emailIsSetup: false })

		await userRepository.createUser(user, faker.internet.password())

		await emailRepository.updateEmailIsSetup(user.id, true)

		const found = await userRepository.user(user.id)
		const test = (found.emailIsSetup == 1) ? true : false
		expect(test).toBe(true)

	})


});
