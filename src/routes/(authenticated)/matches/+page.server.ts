import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../visits/$types';

export const load: PageServerLoad = async ({ locals: { user, profileVisitRepository } }) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const profileVisits = await profileVisitRepository.profileVisitsForUser(user.id);
	return {
		profileVisits
	};
};
