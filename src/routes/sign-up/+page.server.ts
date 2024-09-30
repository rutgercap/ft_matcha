import { lucia } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { hash } from '@node-rs/argon2';
import type { Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const signUpSchema = z.object({
	username: z.string().min(4).max(31),
	password: z.string().min(6).max(255),
	email: z.string().email()
});

export const load = async () => {
	const form = await superValidate(
		{ email: 'rutgercappendijk@gmail.com', password: 'password', username: 'rutgercap' },
		zod(signUpSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals: { userRepository } }) => {
		const form = await superValidate(request, zod(signUpSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const { username, email, password } = form.data;
		const id = generateIdFromEntropySize(10);
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		await userRepository.createUser({ id, username, email }, passwordHash);
		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
