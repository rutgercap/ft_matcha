import { error } from '@sveltejs/kit';

export async function POST({ params, locals: { user, connectionRepository } }) {
	const user_id = params.user_id;
	if (!user) {
		throw error(403, 'Forbidden');
	}
	if (user_id === user.id) {
		throw error(400, 'Cannot like self');
	}
	try {
		const isLiked = await connectionRepository.flipLikeUser(user.id, user_id);
		return new Response(JSON.stringify({ isLiked }), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response('Error processing image', { status: 500 });
	}
}
