import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository, chatRepository },
	params: { id }
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const status = await connectionRepository.matchStatus(user.id, id);
	if (!status || status.status !== 'MATCHED') {
		throw redirect(401, '/chat');
	}
	const allChats = await chatRepository.chatsForUser(user.id);
	let chat = allChats.find((c) => c.userOne === id || c.userTwo === id);
	if (!chat) {
		chat = await chatRepository.createChat(user.id, id);
	}
	return {
		chat,
	};
};
