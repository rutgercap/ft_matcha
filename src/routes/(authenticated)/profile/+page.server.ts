import type { User } from 'lucia';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';

async function personalInfoFor(
	user: User,
	userRepository: UserRepository
): Promise<ProfileInfo | null> {
	try {
		return await userRepository.profileInfoFor(user.id);
	} catch {
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

export const load: PageServerLoad = async ({ locals: { user, userRepository } }) => {
	const currentUser = user as User;
	const maybeProfileInfo = await personalInfoFor(currentUser, userRepository);
	console.log("--------------------->", maybeProfileInfo)
	if (!maybeProfileInfo) {
		error(404, {
			message: 'Not found'
		});
	}
	const profileInfo = maybeProfileInfo as ProfileInfo;
	return {
		profileInfo
	};
};
