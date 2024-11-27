import type { UserRepository } from '$lib/userRepository';
import type { EmailRepository } from '$lib/emailRepository';
import type { User, Session } from 'Lucia';
import type { ProfileVisitRepository } from '$lib/profileVisitRepository';
import type { BrowsingRepository } from '$lib/browsingRepository';
import type { ConnectionRepository } from '$lib/server/connectionRepository';
import type { AuthService } from '$lib/server/authService';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userRepository: UserRepository;
			user: User | null;
			session: Session | null;
			emailRepository: EmailRepository;
			profileVisitRepository: ProfileVisitRepository;
			browsingRepository: BrowsingRepository;
			connectionRepository: ConnectionRepository;
			authService: AuthService;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
