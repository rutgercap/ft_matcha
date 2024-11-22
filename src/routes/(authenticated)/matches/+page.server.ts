import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../visits/$types';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository, userRepository }
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const matches = await connectionRepository.matchesForUser(user.id);
	const profilePreviews = userRepository.profilePreviews(matches.map((match) => match.userTwo));

	return {
		matches,
		profilePreviews
	};
};
