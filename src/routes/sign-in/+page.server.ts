import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/auth';

const loginSchema = z.object({
	username: z.string().min(4).max(31),
	password: z.string().min(6).max(255)
});

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) {
		redirect(303, '/');
	}
	const form = await superValidate(
		{ password: 'password', username: 'rutgercap' },
		zod(loginSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { userRepository } }) => {
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { username, password } = form.data;

		const user = await userRepository.userByUsername(username);
		if (!user) {
			return fail(400, {
				form
			});
		}
		const validPassword = await verify(user.password_hash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password',
				form
			});
		}
		const session = await lucia.createSession(user.id, {
			username: user.username
		});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/');
	}
};
