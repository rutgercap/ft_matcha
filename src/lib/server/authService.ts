import type { UserRepository, UserWithoutProfileSetup } from '$lib/userRepository';
import type { Cookie } from 'lucia';

export class AuthService {
	constructor(private userRepository: UserRepository) {}

	public async createUser(
		user: UserWithoutProfileSetup,
		password: string
	): Promise<UserWithoutProfileSetup> {
		return this.userRepository.createUser(user, password);
	}

	public async login(username: string, password: string): Promise<Cookie> {
		return {} as Cookie;
	}
}
