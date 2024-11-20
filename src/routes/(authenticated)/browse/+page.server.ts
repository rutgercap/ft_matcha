import { error, redirect } from '@sveltejs/kit';
import { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';
import type { Action, PageServerLoad } from './$types';


interface IdObject {
    id: string;
}

export const load: PageServerLoad = async ({ locals: { user, userRepository, browsingRepository}, params }) => {
	if (!user) {
		throw redirect(401, '/login');
	}

	const ids: IdObject[] = browsingRepository.allIdExcept(user.id)
	console.log(user.id)

	console
	const profiles = await Promise.all(
		ids.map((idObj: IdObject) => userRepository.reducedProfile(idObj.id))
	);
	return { profiles, ids };


};

// export const action: Action = {
// 	default: async ({ params, request, cookies, locals: { user, userRepository, emailRepository }}) => {

// 	}
// }
