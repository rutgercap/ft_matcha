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
		return await connectionRepository.isLikedBy(currentUserId, targetId);
	} catch (e) {
		error(500, {
			message: 'Something went wrong.'
		});
	}
}

export const load: PageServerLoad = async ({
	locals: { user: currentUser, userRepository, profileVisitRepository, connectionRepository },
	params,
}) => {
	if (!currentUser) {
		throw redirect(401, '/login');
	}
	const profileId = params.user_id;
	const maybeProfileInfo = await profileInfoFor(profileId, userRepository);
	if (!maybeProfileInfo) {
		throw error(404, {
			message: 'Not found'
		});
	}
	let isCurrentUserProfile = false;
	let likedByCurrentUser = false;
	if (currentUser.id === profileId) {
		isCurrentUserProfile = true;
	} else {
		profileVisitRepository.addVisit(currentUser.id, profileId);
		likedByCurrentUser = await isLikedByCurrentUser(currentUser.id, profileId, connectionRepository);
	}
	return {
		profileInfo: maybeProfileInfo,
		isCurrentUserProfile,
		likedByCurrentUser
	};
};
