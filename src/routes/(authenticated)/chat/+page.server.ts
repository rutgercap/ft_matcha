import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ChatPreview } from '$lib/domain/chat';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository, userRepository },
	depends
}) => {
	depends('app:chat');
	if (!user) {
		throw redirect(401, '/login');
	}
	const chatPreviews: ChatPreview[] = [];
	return {
		chatPreviews
	};
};
