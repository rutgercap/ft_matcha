import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository, userRepository }, depends
}) => {
	depends('app:matches');
	if (!user) {
		throw redirect(401, '/login');
	}
	const matches = await connectionRepository.matchesForUser(user.id);
	const matchPreviews = await userRepository.profilePreviews(matches.map((match) => match.userTwo));
	let likes = await connectionRepository.likes(user.id);
	likes = likes.filter((like) => !matches.some((match) => match.userTwo === like));
	const likedProfilePreviews = await userRepository.profilePreviews(likes);
	let likedBy = await connectionRepository.userLikedBy(user.id);
	likedBy = likedBy.filter((like) => !matches.some((match) => match.userTwo === like));
	const likedByProfilePreviews = await userRepository.profilePreviews(likedBy);
	return {
		matchPreviews,
		likedProfilePreviews,
		likedByProfilePreviews,
	};
};
