import type { User } from 'lucia';
import { error } from '@sveltejs/kit';
import type { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';
import type { PageServerLoad } from './types';

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
	const currentUser = user as User;
	const maybeProfileInfo = await personalInfoFor(id, userRepository);
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
