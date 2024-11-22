import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository, userRepository }, depends
}) => {
	depends('app:matches');
	if (!user) {
		throw redirect(401, '/login');
	}
	const matches = await connectionRepository.matchesForUser(user.id);
	const profilePreviews = await userRepository.profilePreviews(matches.map((match) => match.userTwo));
	return {
		matches,
		profilePreviews
	};
};
