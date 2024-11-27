import { error, redirect } from '@sveltejs/kit';
import { UserRepository } from '$lib/userRepository';
import type { ProfileInfo, ReducedProfileInfo } from '$lib/domain/profile';
import type { Action, PageServerLoad } from './$types';
import type { SortingCriteria } from './sorting';
import { faker } from '@faker-js/faker';


interface IdObject {
    id: string;
}



export const load: PageServerLoad = async ({ locals: { user, userRepository, browsingRepository}, params }) => {
	if (!user) {
		throw redirect(401, '/login');
	}

	const ids: IdObject[] = browsingRepository.allIdExcept(user.id)

	const profiles : ReducedProfileInfo[] = await Promise.all(
		ids.map((idObj: IdObject) => userRepository.reducedProfile(idObj.id))
	);
	profiles.forEach(profile => {
		profile.fameRate = faker.number.float({ min: 0, max: 1, precision: 0.001 }),
		profile.localisation = faker.number.int({ min: 0, max: 1000 }),
		profile.mask = true
	})

	return { profiles, ids };


};

