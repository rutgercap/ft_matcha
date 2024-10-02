import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { isGender, isSexualPreference, type User } from '$lib/domain/user';

const profileSchema = z.object({
	firstName: z.string().min(1).max(255),
	lastName: z.string().min(1).max(255),
	gender: z.enum(['man', 'woman', 'other']).refine((value) => isGender(value)),
	sexualPreference: z
		.enum(['men', 'women', 'all', 'other'])
		.refine((value) => isSexualPreference(value)),
	biography: z.string().max(500)
});

export const load: PageServerLoad = async ({ locals: { user, userRepository } }) => {
	const currentUser = user as User;
	const currentProfile = await userRepository.peronsalInfoFor(currentUser.id);
	const form = await superValidate(currentProfile ?? {}, zod(profileSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { userRepository, user } }) => {
		if (!user) {
			return fail(401, { message: 'You must be signed in to update your profile' });
		}
		const form = await superValidate(request, zod(profileSchema));
		if (!form.valid) {
			return message(form, 'Please fix the invalid fields before trying again.', { status: 400});
		}
		let formData = form.data;
		try {
			await userRepository.upsertPersonalInfo(user.id, formData);
		} catch (e) {
			return message(form, 'An error occurred while updating your profile', { status: 500 });
		}
		return message(form, 'Profile updated!');
	}
};
