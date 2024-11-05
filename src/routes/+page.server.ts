import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) {
		console.log(user)
		if (!user.emailIsSetup)
			redirect(302, '/auth-email')
		redirect(303, '/profile');
	}
};
