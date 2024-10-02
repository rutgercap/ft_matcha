import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const profileSchema = z.object({
	firstName: z.string().min(1).max(255),
	lastName: z.string().min(1).max(255),
    email: z.string().email('Please enter a valid email address'),
    gender: z.enum(['man', 'woman', 'other']),
    sexualPreference: z.enum(["men, women, all other"]),
    biography: z.string().max(500),
});

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const form = await superValidate(zod(profileSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { userRepository, user } }) => {
        if (!user) {
            return fail(401, { message: 'You must be signed in to update your profile' });
        }
		const form = await superValidate(request, zod(profileSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			// await userRepository.setPersonalInfo(user.id, form.data);
			return { status: 204 };
		} catch (e) {
			return message(form, 'An error occurred while updating your profile', { status: 500 });
		}
	}
};
