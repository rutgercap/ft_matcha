import { lucia } from '$lib/auth';
import type { UserRepository, UserWithoutProfileSetup } from '$lib/userRepository';
import { verify } from '@node-rs/argon2';
import type { Cookie } from 'lucia';

export type AuthServiceErrorTypes = "INCORRECT_USERNAME_OR_PASSWORD" | "ERROR_CREATING_SESSION";

export class AuthServiceError extends Error {
	type: string;
	constructor(message: string, type: AuthServiceErrorTypes) {
		super(message);
		this.name = 'AuthServiceError';
		this.type = type;
	}
}

export class AuthService {
	constructor(private userRepository: UserRepository) {}

	public async createUser(
		user: UserWithoutProfileSetup,
		password: string
	): Promise<UserWithoutProfileSetup> {
		return this.userRepository.createUser(user, password);
	}

	public async signIn(username: string, password: string): Promise<Cookie> {
		const user = await this.userRepository.userByUsername(username);
		if (!user) {
			throw new AuthServiceError(
				'Incorrect username or password',
				'INCORRECT_USERNAME_OR_PASSWORD'
			);
		}
		const validPassword = await verify(user.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			throw new AuthServiceError(
				'Incorrect username or password',
				'INCORRECT_USERNAME_OR_PASSWORD'
			);
		}
		try {
			const session = await lucia.createSession(user.id, {});
			return lucia.createSessionCookie(session.id);
		} catch (e) {
			console.log(e);
			throw new AuthServiceError('Error creating session', 'ERROR_CREATING_SESSION');
		}
	}
}
