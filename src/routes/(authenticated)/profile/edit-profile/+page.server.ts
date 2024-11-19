import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { isGender, isSexualPreference } from '$lib/domain/profile';
import type { User } from 'lucia';
import { MAX_F_SIZE } from '$env/static/private';

const MAX_FILE_SIZE = Number(MAX_F_SIZE);

const profileSchema = z.object({
	firstName: z.string().min(1).max(255),
	lastName: z.string().min(1).max(255),
	gender: z.enum(['man', 'woman', 'other']).refine((value) => isGender(value)),
	sexualPreference: z
		.enum(['men', 'women', 'all', 'other'])
		.refine((value) => isSexualPreference(value)),
	biography: z.string().min(0).max(500).default(''),
	tags: z
		.string()
		.transform((val) => val.split(',').map((item) => item.trim())) // Split and trim each item
		.refine((arr) => arr.length > 0 && arr.length <= 50, {
			message: 'Array length must be between 1 and 50.'
		}),
	pictures: z
		.instanceof(File, { message: 'Please upload a valid file.' }) // Accepts File objects
		.refine((f) => f.size < MAX_FILE_SIZE, { message: 'Max 100 kB upload size.' })
		.optional()
		.array()
		.default([null, null, null, null, null]),
	pictures_filenames: z
		.string({ message: 'Must be a valid string representing the image name.' })
		.transform((val) => val || 'default2')
		.array()
		.default(['default2', 'default2', 'default2', 'default2', 'default2'])
});

export const load: PageServerLoad = async ({ locals: { user, userRepository } }) => {
	const currentUser = user as User;
	const currentProfile = await userRepository.profileInfoFor(currentUser.id);
	const form = await superValidate(
		currentProfile ? { ...currentProfile, tags: currentProfile.tags.join(',') } : {},
		zod(profileSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { userRepository, user } }) => {
		if (!user) {
			return fail(401, { message: 'You must be signed in to update your profile' });
		}
		const form = await superValidate(request, zod(profileSchema));
		if (!form.valid) {
			return message(form, 'Please fix the invalid fields before trying again.', { status: 400 });
		}
		const formData = form.data;
		try {
			form.data.pictures_filenames = await userRepository.upsertPersonalInfo(user.id, formData);
			// reseting the uploaded Files in case you edit multiple things and click save multiple times
			form.data.pictures = [undefined, undefined, undefined, undefined, undefined];
		} catch {
			return message(form, 'An error occurred while updating your profile', { status: 500 });
		}

		return message(form, 'Profile updated!');
	}
};
