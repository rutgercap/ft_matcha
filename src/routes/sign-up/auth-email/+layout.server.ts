import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals: { user } }) => {
	if (!user && !url.pathname.startsWith('/sign-in')) {
		redirect(302, '/sign-in');
	} else if (user && user.emailIsSetup) {
		redirect(302, '/');
	}
};
