import type { UserRepository } from '$lib/userRepository';
import type { EmailRepository } from '$lib/emailRepository';
import type { User, Session } from 'Lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userRepository: UserRepository;
			user: User | null;
			session: Session | null;
			emailRepository: EmailRepository
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
