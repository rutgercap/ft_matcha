import { error, redirect } from '@sveltejs/kit';
import { UserRepository } from '$lib/userRepository';
import type { ProfileInfo, ReducedProfileInfo } from '$lib/domain/profile';
import type { Action, PageServerLoad } from './$types';
import type { SortingCriteria } from './sorting';
import { faker } from '@faker-js/faker';

export const load: PageServerLoad = async ({
	locals: { user, userRepository, browsingRepository },
	params
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}

	const ids: string[] = await browsingRepository.allOtherUsers(user.id);

	let profiles: ReducedProfileInfo[] = await Promise.all(
		ids.map((idObj: string) => userRepository.reducedProfile(idObj))
	);
	profiles = profiles.filter((profile) => Boolean(profile));
	profiles.forEach(async (profile, idx) => {
			(profile.fameRate = faker.number.float({ min: 0, max: 1, precision: 0.001 })),
			(profile.localisation = faker.number.int({ min: 0, max: 1000 })),
			(profile.mask = true);
			(profile.score = await browsingRepository.scoring(user.id, ids[idx]))
	});
	const compare = (a: any, b: any) => {
		return b.score - a.score; // Sort by age in ascending order
	};
	profiles.sort(compare);

	return { profiles, ids };
};
