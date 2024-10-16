import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { isGender, isSexualPreference } from '$lib/domain/profile';
import type { User } from 'lucia';

const MAX_FILE_SIZE = 5000000;


const ACCEPTED_IMAGE_SIZE = ["image/jpeg", "image/jpg", "image/ProcessingInstruction", "image/webp"];

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
		  .instanceof(File, { message: 'Please upload a file.'})
		  .refine((f) => f.size < MAX_FILE_SIZE, 'Max 100 kB upload size.')
		  .optional() // TODO remove optinal when load function will be updated with currentImage

});

export const load: PageServerLoad = async ({ locals: { user, userRepository } }) => {

	console.log(user?.id);
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
		console.log("LALALALALALALAL", form.data)
		if (!form.valid) {
			return message(form, 'Please fix the invalid fields before trying again.', { status: 400 });
		}
		const formData = form.data;
		try {
			await userRepository.upsertPersonalInfo(user.id, formData);
		} catch {
			return message(form, 'An error occurred while updating your profile', { status: 500 });
		}
		return message(form, 'Profile updated!');
	}
};
