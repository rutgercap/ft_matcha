import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { User } from 'lucia';

export const load: LayoutServerLoad = async ({ url, locals: { user } }) => {
	if (!user && !url.pathname.startsWith('/sign-in')) {
		redirect(302, '/sign-in');
	}
	let currentUser = user as User;
	if (!currentUser.profileIsSetup && !url.pathname.startsWith('/profile/edit-personal-info')) {
		redirect(302, '/profile/edit-personal-info');
	}
};
