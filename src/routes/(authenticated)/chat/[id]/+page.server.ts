import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals: { user, connectionRepository },
	params: { id }
}) => {
	if (!user) {
		throw redirect(401, '/login');
	}
	const status = await connectionRepository.matchStatus(user.id, id);
	if (!status || status.status !== 'MATCHED') {
		throw redirect(401, '/chat');
	}
};
