import { error } from '@sveltejs/kit';
import type { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';
import type { PageServerLoad } from './$types';


async function personalInfoFor(
	userId: string,
	userRepository: UserRepository
): Promise<ProfileInfo | null> {
	try {
		return await userRepository.profileInfoFor(userId);
	} catch {
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

export const load: PageServerLoad = async ({ locals: { user, userRepository}, params }) => {
	const id = params.user_id;
	const maybeProfileInfo = await personalInfoFor(id, userRepository);
	if (!maybeProfileInfo) {
		error(404, {
			message: 'Not found'
		});
	}
	const currentUser = user;
	return {
		profileInfo: maybeProfileInfo,
		isCurrentUserProfile: currentUser?.id === id,
	};
};
