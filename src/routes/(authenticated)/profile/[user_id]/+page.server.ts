import { error, redirect } from '@sveltejs/kit';
import type { UserRepository } from '$lib/userRepository';
import type { ProfileInfo } from '$lib/domain/profile';
import type { PageServerLoad } from './$types';
import type { ConnectionRepository } from '$lib/connectionRepository';

async function profileInfoFor(
	userId: string,
	userRepository: UserRepository
): Promise<ProfileInfo | null> {
	try {
		return await userRepository.profileInfoFor(userId);
	} catch (e) {
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

async function isLikedByCurrentUser(
	currentUserId: string,
	targetId: string,
	connectionRepository: ConnectionRepository
): Promise<boolean> {
	try {
		return await connectionRepository.isLikedBy(targetId, currentUserId);
	} catch (e) {
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

export const load: PageServerLoad = async ({
	locals: { user, userRepository, profileVisitRepository, connectionRepository },
	params
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const id = params.user_id;
	const maybeProfileInfo = await profileInfoFor(id, userRepository);
	if (!maybeProfileInfo) {
		throw error(404, {
			message: 'Not found'
		});
	}
	let isCurrentUserProfile = false;
	let likedByCurrentUser = false;
	if (user.id === id) {
		isCurrentUserProfile = true;
	} else {
		profileVisitRepository.addVisit(user.id, id);
		likedByCurrentUser = await isLikedByCurrentUser(id, user.id, connectionRepository);
	}
	return {
		profileInfo: maybeProfileInfo,
		isCurrentUserProfile,
		likedByCurrentUser
	};
};
