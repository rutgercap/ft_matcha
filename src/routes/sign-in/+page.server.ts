import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/auth';
import { PUBLIC_BASE_URL } from '$env/static/public';

const signInSchema = z.object({
	username: z.string().min(4).max(31),
	password: z.string().min(6).max(255)
});

const emailSchema = z.object({
	username: z.string().min(4).max(31),
	email: z.string().email({ message: 'Invalid email address' })
});

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) {
		redirect(303, '/');
	}
	const form = await superValidate(zod(signInSchema));
	return { form };
};

export const actions: Actions = {
	sign_in: async ({ request, cookies, locals: { userRepository, emailRepository } }) => {
		const form = await superValidate(request, zod(signInSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { username, password } = form.data;

		const user = await userRepository.userByUsername(username);
		if (!user) {
			return message(form, 'Incorrect username or password', {
				status: 400
			});
		}

		const validPassword = await verify(user.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return message(form, 'Incorrect username or password', {
				status: 400
			});
		}

		// this condition is in case the user clicked the reset password button
		// but then log in whitout changing the oldpswd
		if (!user.passwordIsSet) {
			const change = await emailRepository.deleteResetPasswordSessionByUserId(user.id);
			userRepository.upsertPasswordIsSet(user.id, true);
			await lucia.invalidateUserSessions(user.id);
		}
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		console.log('sessionCookie: ', sessionCookie);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		if (user.emailIsSetup) return redirect(302, '/');
		else return redirect(302, '/sign-up/auth-email');
	},

	forgot_pswd: async ({ request, cookies, locals: { userRepository, emailRepository } }) => {
		const form = await superValidate(request, zod(emailSchema));
		if (!form.valid) {
			console.log('*************the form is not valid');
			return fail(400, { form });
		}

		const { username, email } = form.data;
		const user = await userRepository.userByUsername(username);
		if (!user || email !== user.email) {
			return message(form, 'Incorrect username or email', {
				status: 400
			});
		}
		if (!user.emailIsSetup) {
			return message(
				form,
				'your email has not been verified, you must contact service support at matchalover.serviceteam@gmail.com to unlock your profile',
				{
					status: 400
				}
			);
		}
		try {
			const verificationToken = emailRepository.createResetPasswordToken(
				user.id,
				email,
				user.passwordHash
			);
			const verificationLink =
				`${PUBLIC_BASE_URL}/profile/${user.id}/edit-profile/reset-pswd/` + verificationToken;
			const res_email = await emailRepository.resetLinkTo(email, verificationLink);
			await userRepository.upsertPasswordIsSet(user.id, false);
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			console.log('reset password verification link: ', verificationLink);
			return message(
				form,
				'Email verified, we sent you a verification link to reset your password',
				{ status: 418 }
			);
		} catch (error) {
			console.log('ERROR IN THE FORGOT PASSWORD ACTION: ', error);
			return message(form, 'Something went wrong on our side.\nPlease try again later.', {
				status: 500
			});
		}
	}
};
