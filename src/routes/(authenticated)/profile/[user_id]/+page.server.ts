import { error, redirect } from '@sveltejs/kit';
import type { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';
import type { PageServerLoad } from './$types';


async function personalInfoFor(
	userId: string,
	userRepository: UserRepository
): Promise<ProfileInfo | null> {
	try {
		return await userRepository.profileInfoFor(userId);
	} catch (e) {
		console.error(e);
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

export const load: PageServerLoad = async ({ locals: { user, userRepository, profileVisitRepository}, params }) => {
	if (!user) {
		throw redirect(401, '/login');
	}	
	const id = params.user_id;
	const maybeProfileInfo = await personalInfoFor(id, userRepository);
	if (!maybeProfileInfo) {
		error(404, {
			message: 'Not found'
		});
	}
	let isCurrentUserProfile = false;
	if (user.id === id) {
		isCurrentUserProfile = true;
	} else {
		profileVisitRepository.addVisit(user.id, id);
	}
	return {
		profileInfo: maybeProfileInfo,
		isCurrentUserProfile,
	};
};
