import { UserRepository } from '$lib/userRepository';
import type { RequestHandler } from '@sveltejs/kit';
import { isWithinExpirationDate } from "oslo";
import { lucia } from '$lib/auth';

// The directory where images are stored
export async function GET({ params, locals }) {
	const verificationToken = params.token;
	if (!locals.user) {
		// TODO do appropriate error handling
	}

	const userRepository = locals.userRepository

	const token = userRepository.emailSession(verificationToken)
	if (token) {
		await userRepository.deleteEmailSession(token.id);
	}

	if (!token || !isWithinExpirationDate(new Date(token.expires_at))) {
		return new Response(null, {
			status: 400
		});
	}

	const user = locals.user
	if (!user || user.email !== token.email) {
		return new Response(null, {
			status: 400
		});
	}

	await lucia.invalidateUserSessions(user.id);
	const res = await userRepository.updateEmailIsSetup(user.id, true)
	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/",
			"Set-Cookie": sessionCookie.serialize(),
			"Referrer-Policy": "strict-origin"
		}
	});
};
