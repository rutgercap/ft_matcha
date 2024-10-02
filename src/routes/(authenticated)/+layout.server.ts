import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	if (!user) {
		redirect(302, '/sign-in');
	}
};
