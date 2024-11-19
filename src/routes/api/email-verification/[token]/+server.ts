import { UserRepository } from '$lib/userRepository';
import { EmailRepository } from '$lib/emailRepository';
import { fail, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { isWithinExpirationDate } from 'oslo';
import { lucia } from '$lib/auth';
import { error } from '@sveltejs/kit';

// The directory where images are stored
export async function GET({ params, locals }) {
	const verificationToken = params.token;
	if (!locals.user) {
		// TODO do appropriate error handling
	}

	const emailRepository = locals.emailRepository;

	const token = emailRepository.emailSession(verificationToken);
	if (token) {
		console.log('in email-verificatio api, should delete emailsession');
		await emailRepository.deleteEmailSession(token.id);
	}

	if (!token) {
		console.log('--> in api/email-verification: token is invalid');
		throw error(404, 'Token is invalid');
	}

	if (!isWithinExpirationDate(new Date(token.expires_at))) {
		redirect(302, '/sign-up/auth-email');
	}

	const user = locals.user;
	if (!user || user.email !== token.email) {
		return new Response(null, {
			status: 400
		});
	}

	await lucia.invalidateUserSessions(user.id);
	const res = await emailRepository.updateEmailIsSetup(user.id, true);
	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
			'Set-Cookie': sessionCookie.serialize(),
			'Referrer-Policy': 'strict-origin'
		}
	});
}
