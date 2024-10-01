import { lucia } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const signUpSchema = z.object({
	username: z.string().min(4).max(31),
	password: z.string().min(6).max(255),
	email: z.string().email()
});

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) {
		redirect(303, '/');
	}
	const form = await superValidate(
		{ email: 'rutgercappendijk@gmail.com', password: 'password', username: 'rutgercap' },
		zod(signUpSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { userRepository, user } }) => {
		if (user) {
			redirect(303, '/');
		}
		const form = await superValidate(request, zod(signUpSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { username, email, password } = form.data;
		const id = generateIdFromEntropySize(10);

		await userRepository.createUser({ id, username, email }, password);
		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
