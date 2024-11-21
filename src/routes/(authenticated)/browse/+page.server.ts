import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ReducedProfileInfo } from '$lib/domain/profile';

export const load: PageServerLoad = async ({ locals: { user, userRepository } }) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const ids = await userRepository.allOtherUsers(user.id);
	const profiles = (
		await Promise.all(ids.map(async (id) => await userRepository.reducedProfile(id)))
	).filter(Boolean) as ReducedProfileInfo[];
	return { profiles, ids };
};
