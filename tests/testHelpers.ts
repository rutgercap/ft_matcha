import { faker } from "@faker-js/faker";
import { generateIdFromEntropySize, type User } from "lucia";

function anyUser(overrides: Partial<User> = {}): User {
	const userId = generateIdFromEntropySize(10);
	return {
		id: userId,
		email: faker.internet.email(),
		username: faker.internet.userName(),
		profileIsSetup: faker.datatype.boolean(),
		...overrides
	};
}

export { anyUser};